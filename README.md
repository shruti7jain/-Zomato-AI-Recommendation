# ZOMATA Milestone AI

An AI-powered restaurant recommendation system built with **FastAPI**, **Groq LLM**, and **React + Vite**.

---

## 🚀 Quick Start

### Backend

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env   # fill in your GROQ_API_KEY
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 📁 Project Structure

```
ZOMATA-MILESTONE-AI/
├── docs/
│   ├── context.md               # Project overview
│   ├── architecture.md          # Technical architecture
│   ├── implementation_plan.md   # Phase-wise plan
│   └── edge.md                  # Edge cases & corner scenarios
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entrypoint
│   │   ├── models/schemas.py    # Pydantic schemas
│   │   └── services/            # data_loader, filter, prompt, llm, orchestrator
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   └── package.json
└── .gitignore
```

---

## 🔑 Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in:

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Your Groq API key |
| `LLM_MODEL` | e.g. `llama3-8b-8192` |
| `CORS_ORIGINS` | Comma-separated allowed origins |
| `TOP_K_DEFAULT` | Default number of recommendations |

---

## 📚 Docs

- [Architecture](docs/architecture.md)
- [Implementation Plan](docs/implementation_plan.md)
- [Edge Cases](docs/edge.md)
