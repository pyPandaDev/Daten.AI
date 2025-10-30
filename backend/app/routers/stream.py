from fastapi import APIRouter, HTTPException
from sse_starlette.sse import EventSourceResponse

from app.utils.streaming import stream_manager

router = APIRouter()

@router.get("/stream/{task_execution_id}")
async def stream_task_events(task_execution_id: str):
    """Stream execution events via Server-Sent Events"""
    
    # Check if stream exists or was completed
    stream = stream_manager.get_stream(task_execution_id)
    is_completed = task_execution_id in stream_manager.completed_streams
    
    if not stream and not is_completed:
        raise HTTPException(status_code=404, detail="Stream not found or not started yet")
    
    # Return SSE response (will be empty if already completed)
    return EventSourceResponse(
        stream_manager.stream_events(task_execution_id),
        media_type="text/event-stream"
    )
