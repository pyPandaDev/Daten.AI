from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

# Load environment variables FIRST before importing app modules
load_dotenv()

from app.routers import upload, suggest, run, stream, export, results, chat, recommend

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting Daten.AI API...")
    yield
    # Shutdown
    print("👋 Shutting down Daten.AI API...")

app = FastAPI(
    title="Daten.AI API",
    description="AI-powered data analysis and visualization platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(suggest.router, prefix="/api", tags=["suggest"])
app.include_router(recommend.router, prefix="/api", tags=["recommend"])
app.include_router(run.router, prefix="/api", tags=["run"])
app.include_router(stream.router, prefix="/api", tags=["stream"])
app.include_router(results.router, prefix="/api", tags=["results"])
app.include_router(export.router, prefix="/api", tags=["export"])
app.include_router(chat.router, prefix="/api", tags=["chat"])

@app.get("/")
async def root():
    return {
        "message": "Daten.AI API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health():
    """Health check endpoint with system statistics"""
    from app.services.storage import storage
    from app.utils.streaming import stream_manager
    from app.routers.run import execution_manager
    
    return {
        "status": "healthy",
        "system": {
            "storage": storage.get_stats(),
            "streaming": stream_manager.get_stats(),
            "execution": {
                "active_tasks": execution_manager.get_active_count()
            }
        },
        "capabilities": {
            "concurrent_users": "unlimited",
            "concurrent_tasks": "unlimited",
            "thread_safe": True
        }
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("BACKEND_PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
