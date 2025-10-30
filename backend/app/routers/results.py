from fastapi import APIRouter, HTTPException

from app.services.storage import storage
from app.models.schemas import ExecutionResult

router = APIRouter()

@router.get("/results/{task_execution_id}", response_model=ExecutionResult)
async def get_execution_result(task_execution_id: str):
    """Get execution result for a completed task"""
    result = storage.get_result(task_execution_id)
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    return result
