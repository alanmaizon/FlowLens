# FlowLens API

The FastAPI service follows a clean, layered structure:

- `api/`: HTTP transport only. Versioned endpoints and dependency providers live here.
- `services/`: application and domain orchestration.
- `repositories/`: SQLAlchemy persistence access.
- `models/`: database representations.
- `schemas/`: Pydantic API contracts.
- `prompts/`: small, versioned instructions for process discovery, executive summary, opportunities, roadmap, and chat.
- `agents/`: future orchestration boundary.

Use Alembic for all schema changes; `Base.metadata.create_all()` is intentionally not used at runtime.

## AI boundaries

`ClaudeMessagesGateway` is the only module that imports the Anthropic SDK. It uses the Claude Messages API with Pydantic Structured Outputs for the four report components. `ProjectAnalysisOrchestrator` composes the independently replaceable process, summary, opportunity, and roadmap services. `ProjectChatService` uses a separate focused prompt and manually supplies bounded project context and recent conversation history.

`ANTHROPIC_API_KEY` is optional at service startup so health checks and non-AI project operations remain available. Analysis and chat endpoints return `503` until the key is configured.
