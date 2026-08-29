# Cogniva AI

> **Your AI-Powered Learning Companion**
>
> Cogniva AI is an intelligent learning platform that transforms a student's study material into an interactive learning experience. Students can upload study materials, ask questions with grounded citations, generate active-recall quizzes, and track learning progress.

---

## 📖 Overview

**Cogniva AI** helps university students understand, practice, and master complex academic coursework:

- **Ask Cogniva AI (Grounded Q&A)**: Ask questions across single or multiple course documents and receive answers strictly cited to specific pages and paragraph excerpts.
- **Smart Study Summaries**: Synthesize comprehensive revision guides, key concept definitions, and high-yield notes.
- **Cogniva Quiz Generator**: Create custom multiple-choice quizzes (5, 10, or 20 questions) tailored by difficulty (Easy, Medium, Hard).
- **Interactive Quiz Runner**: Active recall assessments with instant scoring, timer, and detailed pedagogical explanations.
- **Learning Insights & Mastery Tracking**: Monitor performance over time and automatically pinpoint topics that need review.

---

## 🏗️ System Architecture

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
- **Framework**: React 18 with TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS & Lucide Icons
- **Routing**: React Router v6
- **Auth & Storage Client**: `@supabase/supabase-js`

### Backend
- **Framework**: Python 3.12 + FastAPI
- **Validation**: Pydantic v2 & Pydantic-Settings
- **Document Processing**: `pypdf` with sliding-window chunking
- **Retrieval Engine**: BM25 & term-frequency saturation ranker
- **AI Engine**: Google Gemini API (`google-genai`)
- **Database Client**: `supabase-py` & PostgreSQL
- **Testing**: `pytest` & `httpx`

### Database & Security
- **Database**: PostgreSQL on Supabase
- **Security**: Row Level Security (RLS) policies on all tables
- **Tenant Isolation**: Cryptographic JWT validation enforcing `user_id` boundaries

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ (v20+ recommended)
- **Python**: v3.11+ (v3.12 recommended)
- **Supabase Project**: [supabase.com](https://supabase.com)
- **Google Gemini API Key**: [aistudio.google.com](https://aistudio.google.com)

---

### 1. Database Setup (Supabase)

1. Create a project on [Supabase](https://supabase.com).
2. Run `database/schema.sql` to initialize tables and indexes.
3. Run `database/rls_policies.sql` to enforce Row Level Security.
4. Retrieve your **Project URL**, **Anon Key**, and **JWT Secret** from **Project Settings > API**.

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env

# Run development server
python -m uvicorn main:app --reload --port 8000
```

- API Base URL: `http://localhost:8000`
- Swagger Interactive Documentation: `http://localhost:8000/docs`

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Run development server
npm run dev
```

- Frontend Web App: `http://localhost:5173`

---

## 🧪 Testing

```bash
cd backend
python -m pytest -v
```

---

## 📁 Repository Structure

```
studypilot/
├── README.md               # Cogniva AI Documentation
├── .gitignore              # Git ignore rules
├── .env.example            # Root environment template
├── database/
│   ├── schema.sql          # PostgreSQL DDL & triggers
│   └── rls_policies.sql    # Row-Level Security policies
├── backend/
│   ├── .env.example        # Backend environment template
│   ├── requirements.txt    # Python dependencies
│   ├── main.py             # FastAPI entrypoint
│   ├── app/
│   │   ├── config.py       # Pydantic settings configuration
│   │   ├── core/           # Auth, DB client, Exception handlers
│   │   ├── models/         # Pydantic data schemas
│   │   ├── services/       # Document, Chunking, Retrieval, AI, Quiz
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

- **Zero Client Secrets**: All external AI calls, document storage tokens, and processing operations occur exclusively on the backend.
- **JWT Authentication**: Protected REST endpoints cryptographically verify Supabase JWT tokens.
- **Row Level Security**: PostgreSQL enforces tenant isolation directly at the database engine layer.
- **Input Sanitization & Upload Constraints**: Uploads are restricted by MIME type (`application/pdf`) and maximum size (20MB default).

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
