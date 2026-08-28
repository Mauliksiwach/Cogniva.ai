# StudyPilot — AI Study Copilot 🚀

> **Production-Quality Full-Stack AI Learning Assistant for University Students**
>
> Grounded document question answering, smart summarization, interactive quiz generation, and mastery tracking powered by FastAPI, React, Supabase, and Google Gemini AI.

---

## 📖 Overview

**StudyPilot** is an AI-powered study copilot designed for university students to master course materials. Students upload textbooks, lecture slides, and notes (PDFs), and StudyPilot transforms them into an interactive study workspace:

- **Grounded Document Q&A (RAG)**: Ask complex questions and get accurate answers strictly cited to specific pages and sections.
- **Smart Summarization**: Generate structured revision guides, cheatsheets, and key concept takeaways.
- **AI Quiz Generator**: Generate multiple-choice quizzes with custom difficulty and question count directly from course materials.
- **Interactive Quiz Experience**: Take timed quizzes with instant feedback, explanations, and topic tagging.
- **Progress & Mastery Tracking**: Monitor average scores, track attempts over time, and identify weak topics needing review.

---

## 🏗️ Architecture

```
                               ┌────────────────────────┐
                               │   React + TypeScript   │
                               │  Vite + Tailwind CSS   │
                               └───────────┬────────────┘
                                           │ (JWT / REST API)
                                           ▼
                               ┌────────────────────────┐
                               │     FastAPI Backend    │
                               │  (Modular Python App)  │
                               └─────┬────────────┬─────┘
                                     │            │
                  ┌──────────────────┴──┐      ┌──┴──────────────────┐
                  ▼                     ▼      ▼                     ▼
        ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
        │  Supabase Auth   │  │ PostgreSQL + RLS │  │  Google Gemini   │
        │  & User Session  │  │  Storage & Docs  │  │    LLM Engine    │
        └──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React with TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS & Lucide Icons
- **Routing**: React Router v6
- **Auth & Storage**: `@supabase/supabase-js`

### Backend
- **Framework**: Python 3.12 + FastAPI
- **Validation**: Pydantic v2 & Pydantic-Settings
- **Document Processing**: `pypdf` with sliding-window chunking
- **AI Engine**: Google Gemini API (`google-genai`)
- **Database Client**: `supabase-py` & PostgreSQL
- **Testing**: `pytest` & `httpx`

### Database & Security
- **Database**: PostgreSQL on Supabase
- **Security**: Row Level Security (RLS) policies on all tables
- **Multi-Tenancy**: Strict tenant isolation on `user_id`

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ (v20+ recommended)
- **Python**: v3.11+ (v3.12 recommended)
- **Supabase Account**: [supabase.com](https://supabase.com)
- **Google Gemini API Key**: [aistudio.google.com](https://aistudio.google.com)

---

### 1. Database Setup (Supabase)

1. Create a new project on [Supabase](https://supabase.com).
2. Navigate to **SQL Editor** in your Supabase dashboard.
3. Run the scripts in order:
   - Run `database/schema.sql` to create all tables and indexes.
   - Run `database/rls_policies.sql` to enforce Row Level Security.
   - *(Optional)* Run `database/seed.sql` for sample data.
4. Retrieve your **Project URL**, **Anon Key**, and **JWT Secret** from **Project Settings > API**.

---

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment configuration
cp .env.example .env
# Edit .env with your Supabase and Gemini credentials

# Run backend development server
uvicorn main:app --reload --port 8000
```

Backend API will be accessible at: `http://localhost:8000`  
Swagger Interactive API Documentation: `http://localhost:8000/docs`

---

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment configuration
cp .env.example .env
# Edit .env with your Supabase URL and Anon Key

# Run frontend development server
npm run dev
```

Frontend application will be accessible at: `http://localhost:5173`

---

## 🧪 Testing

```bash
# Run backend test suite
cd backend
pytest -v
```

---

## 📁 Repository Structure

```
studypilot/
├── README.md               # Project documentation
├── .gitignore              # Git ignore configuration
├── .env.example            # Environment variables template
├── database/
│   ├── schema.sql          # Relational PostgreSQL DDL
│   ├── rls_policies.sql    # Row-Level Security policies
│   └── seed.sql            # Seed demo data
├── backend/
│   ├── .env.example        # Backend environment template
│   ├── requirements.txt    # Python dependencies
│   ├── main.py             # FastAPI entrypoint
│   ├── app/
│   │   ├── config.py       # Pydantic settings configuration
│   │   ├── core/           # Auth, DB client, Exception handlers
│   │   ├── models/         # Pydantic data schemas
│   │   ├── services/       # Document, Chunking, AI, Quiz, Analytics
│   │   └── api/v1/         # Versioned REST API endpoints
│   └── tests/              # Pytest test suite
└── frontend/
    ├── package.json        # Frontend dependencies
    ├── vite.config.ts      # Vite configuration
    ├── tailwind.config.js  # Tailwind CSS configuration
    └── src/
        ├── api/            # API client & endpoint bindings
        ├── context/        # Auth & Toast context providers
        ├── components/     # Reusable UI & Layout components
        ├── pages/          # Landing, Auth, Dashboard, Documents, Chat, Quizzes, Progress
        └── types/          # TypeScript interfaces
```

---

## 🔒 Security Best Practices

- **Zero Client Secrets**: All external AI calls, document storage tokens, and processing operations happen on the backend.
- **JWT Authentication**: All protected REST endpoints cryptographically verify Supabase JWT tokens.
- **Row Level Security**: PostgreSQL enforces tenant isolation directly at the database engine layer.
- **Input Sanitization & Upload Constraints**: Uploads are restricted by MIME type (`application/pdf`) and maximum size (20MB default).

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
