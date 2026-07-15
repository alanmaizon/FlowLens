.DEFAULT_GOAL := help

.PHONY: help up up-dev down logs test lint format check migrate revision

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "%-12s %s\n", $$1, $$2}'

up: ## Start the production-like Docker environment
	docker compose up --build

up-dev: ## Start the hot-reloading Docker environment
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

down: ## Stop containers
	docker compose down

logs: ## Follow container logs
	docker compose logs -f

test: ## Run backend and frontend tests
	cd backend && uv run pytest
	cd frontend && npm run test:run

lint: ## Run lint checks
	cd backend && uv run ruff check . && uv run mypy app
	cd frontend && npm run lint

format: ## Format source files
	cd backend && uv run ruff format .
	cd frontend && npm run format

check: ## Run all quality gates
	cd backend && uv run ruff format --check . && uv run ruff check . && uv run mypy app && uv run pytest
	cd frontend && npm run check && npm run test:run

migrate: ## Apply backend database migrations
	cd backend && uv run alembic upgrade head

revision: ## Create an Alembic migration (MESSAGE='description')
	cd backend && uv run alembic revision --autogenerate -m "$(MESSAGE)"
