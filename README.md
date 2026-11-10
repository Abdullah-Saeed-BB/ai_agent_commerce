# AI Agent Commerce

AI Agent Commerce is an AI-powered conversational commerce and booking system designed to automate appointments, handle payments, and manage schedules seamlessly through messaging platforms.

This system provides an AI-powered conversational agent via a web chat interface that interacts with customers in natural language to identify services, select preferred staff, check availability, and handle secure Stripe transactions.

## Tools

#### Backend

![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)
![Pydantic](https://img.shields.io/badge/Pydantic-E92063?style=for-the-badge&logo=pydantic&logoColor=white)

#### AI & Vector DB

![LangChain](https://img.shields.io/badge/LangChain-1C3C3A?style=for-the-badge&logo=langchain&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-F55036?style=for-the-badge&logo=groq&logoColor=black)
![Chroma](https://img.shields.io/badge/Chroma_VDB-3072B4?style=for-the-badge&logo=chroma&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

#### Frontend

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Lucide React](https://img.shields.io/badge/Lucide_React-FDE047?style=for-the-badge&logo=lucide&logoColor=black)
![Recharts](https://img.shields.io/badge/Recharts-22B5BF?style=for-the-badge&logo=recharts&logoColor=white)

---

## Project Structure

### Backend Structure

The backend follows a service-oriented architecture, cleanly separating the API layer, business logic, AI operations, and database interactions.

```text
backend/
├── ai_agent.py          # [MAIN FILE] Core AI agent logic using LangChain/LangGraph
├── main.py              # FastAPI application entry point
├── routers/             # FastAPI route handlers (endpoints, incl. chat simulator)
├── services/            # Business logic layer (e.g., booking_service)
├── models/              # SQLAlchemy database models and Pydantic schemas
├── db/                  # Database connection and session management
├── worker.py            # (optional) ARQ background task worker for async jobs
├── data/ & chroma-data/ # Vector DB and embedding storage
├── bills/               # Generated bills and barcodes storage
└── pyproject.toml       # Python dependencies and project configuration

```

### Frontend Structure

The frontend is built using Next.js App Router, providing a responsive and modern interface for the management dashboard and payment flows.

```text
frontend/
├── app/                 # Next.js App Router (Pages and layouts)
├── components/          # Reusable React UI components
├── public/              # Static assets (images, icons)
├── package.json         # Node.js dependencies and scripts
├── tailwind.config.js   # Tailwind CSS configuration
└── next.config.ts       # Next.js configuration

```

---

## Installation & Setup

### Prerequisites

Ensure you have **Docker** installed to manage external services, alongside a running instance of **PostgreSQL**.

### 1. Infrastructure (Docker Setup)

Spin up the vector index database (**ChromaVDB**). Redis is optional — it is only needed for the ARQ background auto-cancel worker.

```bash
docker run -d -p 8000:8001 --name commerce-chroma chromadb/chroma

```

### 2. Backend Setup

1. Navigate to the backend directory and install the dependencies:

```bash
   cd backend
   uv sync
```

2. Create a `.env` configuration file inside the `backend/` directory:

```env
   DATABASE_URL="postgresql://[username]:[password]@localhost:5432/ai_commerce"
   CHROMA_SERVER_HOST="localhost"
   CHROMA_SERVER_HTTP_PORT="8000"

   GROQ_API_KEY="YOUR_GROQ_API_KEY"
   STRIPE_SECRET_KEY="YOUR_STRIPE_SECRET_KEY"

   JWT_SECRET_KEY="YOUR_JWT_SECRET_KEY"
   JWT_ALGORITHM="HS256"

```

3. Launch the FastAPI server application:

```bash
   uv run uvicorn main:app --reload

```

> **Optional:** To enable the 30-minute auto-cancel of unpaid bookings, start Redis and an ARQ worker in a separate terminal with `uv run arq worker.WorkerSettings`.

### 3. Frontend Setup

1. Navigate to the frontend directory and install dependencies:

```bash
   cd frontend
   npm install

```

2. Create a `.env.local` configuration file inside the `frontend/` directory:

```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="YOUR_STRIPE_PUBLISHABLE_KEY"

```

3. Initialize the local development build:

```bash
   npm run dev

```

> **Note:** If layout rendering components fail or break after authorization changes, delete the local compiler caches via `rm -rf .next node_modules` and run a clean `npm install`.
