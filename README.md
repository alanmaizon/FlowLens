# FlowLens

FlowLens is an AI-powered business process analysis and transformation copilot. It turns uploaded process documentation into a structured executive report, implementation opportunities, and a project-aware conversation.

## Current capabilities

- Password authentication with JWT bearer tokens and OAuth-ready service boundaries.
- User-scoped projects and private local document storage.
- TXT, Markdown, CSV, PDF, and DOCX upload with text extraction.
- Versioned process-analysis reports with executive summary, process map, actors, systems, pain points, risks, AI/automation opportunities, user stories, acceptance criteria, and roadmap.
- Project-context chat that grounds answers in the stored report, source excerpts, and recent conversation.
- A responsive React workspace for projects, uploads, reports, and chat.

## Architecture

```text
flowlens/
├── frontend/                 React, Vite, TypeScript, Tailwind, shadcn-compatible UI
│   └── src/
│       ├── app/              Application providers and routing
│       ├── components/       Reusable UI and layout components
│       ├── features/         Feature-owned screens and state
│       └── lib/              API client and shared utilities
├── backend/                  FastAPI application
│   └── app/
│       ├── api/              Thin HTTP endpoints and dependencies
│       ├── agents/           Agent orchestration boundary
│       ├── core/             Settings, logging, and security primitives
│       ├── database/         SQLAlchemy engine and declarative base
│       ├── models/           Persistence models
│       ├── prompts/          Versioned, focused prompt templates
│       ├── repositories/     Persistence access layer
│       ├── schemas/          API request/response contracts
│       └── services/         Domain services and analysis interfaces
├── docker-compose.yml        Production-like local stack
└── docker-compose.dev.yml    Hot-reload development override
```

The backend keeps routes limited to transport concerns. Domain logic belongs in services; repositories own persistence access; Pydantic schemas form the API boundary. The analysis pipeline composes independent process, executive-summary, opportunity, and roadmap services so each can evolve into its own agentic workflow.

## Quick start

1. Create local environment configuration:

   ```bash
   cp .env.example .env
   ```

2. Set a strong `POSTGRES_PASSWORD` and `SECRET_KEY` in `.env`, then add `ANTHROPIC_API_KEY`. The key is server-only and is never exposed to the browser.

3. Start the production-like stack:

   ```bash
   docker compose up --build
   ```

   The web app is available at [http://localhost:8080](http://localhost:8080), the API docs at [http://localhost:8080/docs](http://localhost:8080/docs), and the direct API at [http://localhost:8000](http://localhost:8000) only when using the development override.

For hot reload during development, use:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

## Health checks

- `GET /api/v1/health` — liveness probe; no database access.
- `GET /api/v1/health/ready` — readiness probe; verifies the database can execute a query.

## Using FlowLens

1. Open [http://localhost:8080](http://localhost:8080) and create an account.
2. Create a project and upload one or more supported source documents (up to 25 MB each).
3. Select **Generate analysis**. This makes four focused Claude Structured Output calls through the Messages API: current-state process analysis, executive summary, opportunity analysis, and roadmap.
4. Use **Ask about this project** for answers grounded in the report, selected source excerpts, and conversation history.

The application returns a clear configuration error instead of calling Claude when `ANTHROPIC_API_KEY` is absent. Document files are retained in the Docker `uploads-data` volume; document metadata and extracted text are stored in PostgreSQL.

## Manual testing documents

Use the original, fictional [manual testing pack](demo-documents/README.md) to exercise TXT, Markdown, CSV, DOCX, and PDF upload and analysis without exposing business data.

## Local development without Docker

Backend (Python 3.12+ with [uv](https://docs.astral.sh/uv/)):

```bash
cd backend
uv sync --extra dev
uv run alembic upgrade head
uv run uvicorn app.main:app --reload
```

Frontend (Node 20+):

```bash
cd frontend
npm install
npm run dev
```

Copy `frontend/.env.example` to `frontend/.env.local` if the API is not at the default development address.

## Quality commands

| Command | Purpose |
| --- | --- |
| `make test` | Run pytest and Vitest suites |
| `make lint` | Run Ruff, mypy, and ESLint |
| `make format` | Format Python and frontend files |
| `make check` | Run all CI quality gates |
| `make migrate` | Apply Alembic migrations |

## Configuration

All server configuration is supplied through environment variables and documented in [`.env.example`](.env.example). Never commit a real `.env` file. The `DATABASE_URL` must use the SQLAlchemy Psycopg dialect, for example `postgresql+psycopg://user:password@host:5432/database`.

| Variable | Purpose |
| --- | --- |
| `ANTHROPIC_API_KEY` | Server-side credential for Claude analysis and project chat |
| `ANTHROPIC_MODEL` | Structured analysis model; defaults to `claude-sonnet-5` |
| `ANTHROPIC_CHAT_MODEL` | Optional different Claude model for project chat |
| `ANTHROPIC_ANALYSIS_MAX_OUTPUT_TOKENS` | Analysis response budget; defaults to `8192` |
| `ANTHROPIC_CHAT_MAX_OUTPUT_TOKENS` | Chat response budget; defaults to `2048` |
| `STORAGE_LOCAL_PATH` | Local document root; `/data/uploads` in Docker |
| `MAX_UPLOAD_SIZE_BYTES` | Per-file upload limit; defaults to 25 MB |

## Notes for production

The local-storage adapter is suitable for development and single-node deployments. Its narrow storage interface is designed to be replaced by an S3-compatible adapter before a horizontally scaled deployment. Analysis currently runs synchronously for a deliberate MVP feedback loop; introduce a task queue before accepting large or high-concurrency workloads.
