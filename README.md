
# AI Agent Commerce
AI Agent Commerce is an AI-powered conversational commerce and booking system designed to automate appointments, handle payments, and manage schedules seamlessly through messaging platforms. 

This system provides an AI-powered conversational agent via a Telegram Bot that interacts with customers in natural language to identify services, select preferred staff, check availability, handle secure Stripe transactions, and issue digital bills with barcodes.

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

## Core Problem & Solution

### The Problem
Traditional booking processes for service-based businesses (like barbershops) often rely on manual scheduling through DMs, calls, or messaging apps. This manual approach leads to double bookings, inefficient time management, delayed responses, and administrative overhead. Customers must wait for a human response to find available time slots, and handling payments manually can result in lost revenue and tracking difficulties.

### The Solution
This project provides an AI-powered conversational agent (accessible via a Telegram Bot) that interacts with customers in natural language. The system autonomously:
*   Understands user requests to identify desired services, preferred barbers, and dates/times.
*   Queries the live database for available time slots and displays them clearly.
*   Handles secure frontend/backend payment flows through **Stripe**.
*   Generates a barcode-ready PDF digital bill using **ReportLab** upon a successful transaction.

---

## Business Impact

*   **Increased Efficiency:** Eliminates manual administrative work, allowing business owners and staff to focus strictly on providing their services.
*   **24/7 Availability:** The AI agent captures bookings and processes payments continuously, even outside of normal business hours.
*   **Enhanced Customer Experience:** Provides users with a fast, intuitive, and conversational booking experience without waiting for a human reply.
*   **Revenue Protection:** Automated upfront transactions via Stripe significantly reduce no-shows, while barcode-enabled digital bills streamline in-person client verification.
*   **Scalability:** Built with a decoupled, decoupled architecture, making it easy to adapt the system for other service-based commerce industries beyond barbershops.

---

## Project Structure

### Backend Structure
The backend follows a service-oriented architecture, cleanly separating the API layer, business logic, AI operations, and database interactions.
```text
backend/
├── ai_agent.py          # [MAIN FILE] Core AI agent logic using LangChain/LangGraph
├── main.py              # FastAPI application entry point
├── tele_bot.py          # Telegram Bot webhook integration
├── routers/             # FastAPI route handlers (endpoints)
├── services/            # Business logic layer (e.g., booking_service)
├── models/              # SQLAlchemy database models and Pydantic schemas
├── db/                  # Database connection and session management
├── worker.py            # ARQ background task worker for async jobs
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

Spin up the required background instances for the cache store (**Redis**) and vector index database (**ChromaVDB**):

```bash
docker run -d -p 6379:6379 --name commerce-redis redis:alpine
docker run -d -p 8000:8000 --name commerce-chroma chromadb/chroma

```

### 2. Backend Setup

1. Navigate to the backend directory and configure your virtual environment:

```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
   pip install -r requirements.txt

```

2. Create a `.env` configuration file inside the `backend/` directory:

```env
   DATABASE_URL="postgresql://[username]:[password]@localhost:5432/ai_commerce"
   REDIS_URL="redis://localhost:6379"
   CHROMA_SERVER_HOST="localhost"
   CHROMA_SERVER_HTTP_PORT="8000"
   
   GROQ_API_KEY="YOUR_GROQ_API_KEY"
   TELEGRAM_BOT_TOKEN="YOUR_TELEGRAM_BOT_TOKEN"
   STRIPE_SECRET_KEY="YOUR_STRIPE_SECRET_KEY"
   
   JWT_SECRET_KEY="YOUR_JWT_SECRET_KEY"
   JWT_ALGORITHM="HS256"

```

3. Launch the background async job worker and the FastAPI server application:

```bash
   # In terminal window 1 (Background workers)
   arq worker.py:Worker
   
   # In terminal window 2 (Web server api)
   uvicorn main:app --reload

```

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
