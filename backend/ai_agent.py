from langgraph.prebuilt import InjectedState
from langgraph.graph.state import CompiledStateGraph
class AIAgent:
    def __init__(self):
        import time

        print("=" * 30)
        print("Application building AI Agent process")
        print("=" * 30 + "\n")

        s_time = time.time()
        print("Start loading LangGraph ... ", end="")
        from langgraph.graph.state import CompiledStateGraph
        from langgraph.graph import StateGraph, END
        from langgraph.graph.message import add_messages
        from langgraph.prebuilt import ToolNode
        print(f"Takes {time.time() - s_time:.1f}s")

        s_time = time.time()
        print("Start loading LangChain ... ", end="")
        from langchain_core.runnables import Runnable
        from langchain_core.messages import BaseMessage, ToolMessage, SystemMessage, HumanMessage, AIMessage
        from langchain_core.tools import tool
        from langchain.chat_models import init_chat_model
        from langchain_chroma import Chroma
        from langchain_huggingface import HuggingFaceEmbeddings
        print(f"Takes {time.time() - s_time:.1f}s")



        s_time = time.time()
        print("Start importing other stuff ... ", end="")
        from typing import Annotated, Sequence, TypedDict, List, Dict, Optional, Literal, Union
        from sqlalchemy import text, select, and_
        from pathlib import Path
        import datetime
        import pandas as pd
        import chromadb
        import os
        import requests
        print(f"Takes {time.time() - s_time:.1f}s")


        s_time = time.time()
        print("Start importing DB stuff ... ", end="")
        from db.session import AsyncSessionLocal
        from db.models import Booking, Barber
        from services.booking_service import get_availability, create_booking
        from services.generate_schedule import generate_schedule_image
        print(f"Takes {time.time() - s_time:.1f}s")

        from dotenv import load_dotenv
        load_dotenv()


        s_time = time.time()
        print("Start loading vector database ... ", end="")
        os.environ["TOKENIZERS_PARALLELISM"] = "false"

        BASE_DIR = Path(__file__).parent

        PERSIST_DIRECTORY = BASE_DIR / ".data" / "silver_blade_vdb"
        MODEL_PATH = BASE_DIR / "models" / "embedding_function"

        VDB_HOST = os.getenv("VDB_HOST")
        VDB_PORT = os.getenv("VDB_PORT")

        client = chromadb.HttpClient(host=VDB_HOST, port=VDB_PORT)

        # print("Loading embedding function locally ...")

        embedding_function = HuggingFaceEmbeddings(
            model=str(MODEL_PATH),
            
        )

        # print("Creating Vector Store ...")
        vector_store = Chroma(
            client=client,
            persist_directory=PERSIST_DIRECTORY,
            collection_name="silver-blade-vdb",
            embedding_function=embedding_function
        )
        print(f"Takes {time.time() - s_time:.1f}s")

        s_time = time.time()
        print("Start loading AI Agent tools ... ", end="")
        class AgentState(TypedDict):
            messages: Annotated[Sequence[BaseMessage], add_messages]
            telegram_chatid: str

        @tool
        def retriever_tool(
            filter: Union[Literal["barber", "service", "business_info"], None], query: str) -> str:
            """
            To searches and returns the information from the Silver Blade Business Knowledge base document.
            Arqs:
                query: To search for specific information, do not make the query vague, add details if user did not provided
                filter: To search only for specific data, `barber` To search in barbers data, `service` To search in services data, and `business_info` to search in business knowledge base,
                        use `None` if user wanna know about different thing and need to search in different data. 
            """

            if filter:
                retriever = vector_store.as_retriever(
                    search_kwargs={
                        "k": 2 if filter == "business_info" else 5,
                        "filter": {"type": filter}
                    }
                )
            else:
                retriever = vector_store.as_retriever(
                    search_kwargs={"k": 2}
                )

            docs = retriever.invoke(query)

            if not docs:
                return "I found no relevant information in the Stock Market Performance 2024 document."

            results = []
            for i, doc in enumerate(docs):
                doc_type = doc.metadata["type"]
                title = doc_type.replace("_", " ").capitalize()
                results.append(f"{title} {i+1}:\n{doc.page_content}")
            return "\n\n".join(results)

        @tool
        async def find_free_times_tool(
            state: Annotated[dict, InjectedState],
            start: str,
            end: str,
            limit: Optional[int] = None
        ) -> str:
            """
            Find free booking time slots between start and end dates by checking the database.
            Args:
                start: Start date in YYYY-MM-DD format
                end: End date in YYYY-MM-DD format
                limit: Optional max number of slots to return
            """

            # 1. Parse dates
            start_date = datetime.datetime.strptime(start, "%Y-%m-%d").date()
            end_date = datetime.datetime.strptime(end, "%Y-%m-%d").date()

            async with AsyncSessionLocal() as db: 
                availability_data = await get_availability(db, start_date, end_date)

            if not availability_data:
                return "No barbers are available for the selected dates."

            # Generate and send image
            chat_id = state.get("telegram_chatid")
            if chat_id:
                try:
                    from routers.telegram import send_photo_to_telegram
                    img_buffer = generate_schedule_image(availability_data)
                    send_photo_to_telegram(chat_id, img_buffer, filename="schedule.png")
                except Exception as e:
                    print(f"Failed to generate or send schedule image: {e}")

            # Format Output
            title = f"These are free times {'at ' + start if start == end else 'from ' + start + ' to ' + end} 📅"

            return title


        def validate_booking_time(dt_str: str) -> tuple[bool, datetime.datetime | str]:
            try:
                # 1. Parse the ISO string
                clean_dt_str = dt_str.replace('Z', '+00:00')
                dt = datetime.datetime.fromisoformat(clean_dt_str)
                
                # 2. Business Logic Checks
                if not (9 <= dt.hour < 18):
                    return False, "Time must be between 9:00 AM and 6:00 PM."
                
                if dt.minute not in [0, 30]:
                    return False, "Appointments must be on the hour or half-hour."

                # 3. FIX: Strip the timezone to make it "offset-naive"
                # This resolves the (can't subtract offset-naive and offset-aware datetimes) error
                dt_naive = dt.replace(tzinfo=None)
                    
                return True, dt_naive
            except ValueError:
                return False, "Invalid format. Use YYYY-MM-DDThh:mm:ssZ."

        @tool
        async def booking_tool(
            state: Annotated[dict, InjectedState],
            name: str | None = None,
            booking_datetime: str | None = None,
            service: str | None = None,
            barber: str | None = None,
        ):
            """
            To book an appointment to the barbershop.
            Args:
                name: The name of the user if mentioned in the conversation.
                booking_datetime: The booking_datetime as "YYYY-MM-DDThh:mm:ssZ" if mentioned in the conversation.
                service: The service name or title (e.g., 'Haircut', 'Beard Trim') if mentioned in the conversation.
                barber: The barber name if mentioned in the conversation.
            """
            
            missing_info = []
            validated_data = {
                "name": name,
                "booking_datetime": None,
                "service_id": None,
                "barber_id": None
            }

            # 1. Validate Name
            if not name:
                missing_info.append("your name")

            # 2. Validate Datetime
            if booking_datetime:
                is_valid, dt_result = validate_booking_time(booking_datetime)
                if is_valid:
                    validated_data["booking_datetime"] = dt_result
                else:
                    missing_info.append(f"a valid date & time")
            else:
                missing_info.append("date & time")

            # 3. Validate Service (Vector Search for ID)
            if service:
                try:
                    retriever = vector_store.as_retriever(
                        search_kwargs={'k': 1, 'filter': {'type': 'service'}}
                    )
                    documents = retriever.invoke(service)
                    if documents:
                        service_doc = documents[0]
                        validated_data["service_id"] = service_doc.metadata["id"]
                    else:
                        missing_info.append("a valid service from our menu")
                except Exception as e:
                    print("Error while parsing service data:", e)
                    missing_info.append("service identification")
            else:
                missing_info.append("service title")

            # 4. Validate Barber (Vector Search for ID)
            if barber:
                try:
                    retriever = vector_store.as_retriever(
                        search_kwargs={'k': 1, 'filter': {'type': 'barber'}}
                    )
                    documents = retriever.invoke(barber)
                    if documents:
                        validated_data["barber_id"] = documents[0].metadata["id"]
                    else:
                        missing_info.append("an available barber name")
                except Exception:
                    missing_info.append("barber identification")
            else:
                missing_info.append("barber name")

            try:
                async with AsyncSessionLocal() as db:
                    new_booking = await create_booking(
                        db=db,
                        customer_name=validated_data["name"],
                        booking_datetime=validated_data["booking_datetime"],
                        service_id=validated_data["service_id"],
                        barber_id=validated_data["barber_id"],
                        payment_id=None,
                        telegram_chatid=state.get("telegram_chatid")
                    )
            except Exception as e:
                print(e)
                return "Error occurs while creating the booking to the database, try again later"

            payment_url = f"{os.getenv("FRONTEND_URL")}/payment?id={new_booking.id}"
            if not missing_info:
                return f"<b>Creating booking successed</b>, just need to confirm the pay.\n\n<a href='{payment_url}'>Payment page</a>"
                # return fr"*Creating booking successed*, just need to confirm the pay\.\n\n[Payment page]({payment_url})"
            else:
                readable_missing = \
                    f"{", ".join(missing_info[:-1])}, and {missing_info[-1]}" \
                    if len(missing_info) > 1 else missing_info[0]
                return f"<b>Creating booking successed</b>, you have to enter {readable_missing} in payment page before confirming the pay.\n\n<a href='{payment_url}'>Payment Page</a>"
                # return fr"*Creating booking successed*, you have to enter {readable_missing} in payment page before confirming the pay\`.\n\n[Payment Page]({payment_url})"
        print(f"Takes {time.time() - s_time:.1f}s")

        s_time = time.time()
        print("Start loading LLM ... ", end="")
        # Initilization the AI Agent
        llm = init_chat_model(
            model="openai/gpt-oss-120b",
            model_provider="groq",
            temperature=0
        )
        print(f"Takes {time.time() - s_time:.1f}s")

        s_time = time.time()
        print("Start building AI Agent ... ", end="")

        tools = [find_free_times_tool, retriever_tool, booking_tool]

        model = llm.bind_tools(tools)

        def call_llm(state: AgentState) -> AgentState:
            """Function to call the LLM with the current state."""
            messages = list(state['messages'])
            message = model.invoke(messages)
            return {'messages': [message]}

        def should_call_tool(state: AgentState):
            last_message = state["messages"][-1]

            return "tools" if last_message.tool_calls else END

        def should_continue(state: AgentState):
            last_message = state["messages"][-1]

            if last_message.name in ("find_free_times_tool", "booking_tool"):
                return END
            return "agent"

        graph = StateGraph(AgentState)
        graph.add_node("agent", call_llm)
        graph.add_node("tools", ToolNode(tools))

        graph.set_entry_point("agent")
        graph.add_conditional_edges(
            "agent",
            should_call_tool,
            {"tools": "tools", END: END}
        )

        graph.add_conditional_edges(
            "tools",
            should_continue,
            {"agent": "agent", END: END}
        )
        print(f"Takes {time.time() - s_time:.1f}s")

        s_time = time.time()
        print(f"Compiling AI Agent ... ", end="")
        self.app: CompiledStateGraph = graph.compile()
        print(f"Takes {time.time() - s_time:.1f}s")


        print(f"\n" + "=" * 30)
        print("AI Agent Compiled Successfully!")
        print(f"=" * 30 + "\n")

_agent_instance = None

def get_agent() -> CompiledStateGraph:
    """
    Singleton factory to get the AI Agent.
    """
    global _agent_instance
    
    if _agent_instance is None:
        _agent_instance = AIAgent().app

    return _agent_instance