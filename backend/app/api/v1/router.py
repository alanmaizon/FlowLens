"""Versioned API router composition."""

from fastapi import APIRouter

from app.api.v1.endpoints import analysis, auth, chat, health, projects

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, tags=["authentication"])
api_router.include_router(projects.router, tags=["projects"])
api_router.include_router(analysis.router, tags=["analysis"])
api_router.include_router(chat.router, tags=["project chat"])
