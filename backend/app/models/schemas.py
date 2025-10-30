from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Literal
from datetime import datetime

# Upload Schemas
class DatasetSchema(BaseModel):
    columns: List[str]
    dtypes: Dict[str, str]
    shape: List[int]
    sample_rows: List[Dict[str, Any]]
    null_counts: Dict[str, int]
    memory_usage: str

class UploadResponse(BaseModel):
    file_id: str
    filename: str
    dataset_schema: DatasetSchema
    message: str
    gemini_insights: Optional[str] = None
    user_goal: Optional[str] = None
    table_preview: Optional[List[Dict[str, Any]]] = None
    statistics_summary: Optional[Dict[str, Any]] = None

# Suggestion Schemas
class TaskSuggestion(BaseModel):
    id: str
    title: str
    description: str
    category: Literal["eda", "cleaning", "visualization", "feature_engineering", "modeling", "statistical_testing"]
    estimated_time: str
    priority: Literal["high", "medium", "low"]

class SuggestRequest(BaseModel):
    file_id: str
    dataset_schema: DatasetSchema
    user_goal: Optional[str] = None
    path: Optional[Literal["analysis", "datascience"]] = None

class SuggestResponse(BaseModel):
    suggestions: List[TaskSuggestion]
    assumptions: List[str]

# AI Recommendation Schemas
class AIRecommendation(BaseModel):
    recommended_path: Literal["analysis", "datascience"]
    confidence: float
    reasoning: str
    suggested_tasks: List[str]
    data_characteristics: List[str]

class RecommendRequest(BaseModel):
    file_id: str
    dataset_schema: DatasetSchema

class RecommendResponse(BaseModel):
    recommendation: AIRecommendation

# Run Schemas
class RunRequest(BaseModel):
    file_id: str
    task_id: str
    task_title: str
    parameters: Optional[Dict[str, Any]] = {}
    dataset_schema: DatasetSchema

class RunResponse(BaseModel):
    task_execution_id: str
    status: Literal["queued", "running", "completed", "failed"]
    message: str

# Artifact Schemas
class TableArtifact(BaseModel):
    type: Literal["table"] = "table"
    name: str
    data: List[List[Any]]

class PlotArtifact(BaseModel):
    type: Literal["plot"] = "plot"
    name: str
    format: Literal["png_base64"] = "png_base64"
    data: str

class MetricItem(BaseModel):
    name: str
    value: Any

class MetricsArtifact(BaseModel):
    type: Literal["metrics"] = "metrics"
    items: List[MetricItem]

# Result Schemas
class ExecutionResult(BaseModel):
    task_execution_id: str
    status: Literal["completed", "failed"]
    plan: Optional[List[str]] = None
    assumptions: Optional[List[str]] = None
    python_code: Optional[str] = None
    artifacts: Optional[List[Any]] = None  # Union of TableArtifact, PlotArtifact, MetricsArtifact
    summary: Optional[str] = None
    followups: Optional[List[str]] = None
    error: Optional[str] = None
    execution_time: float
    file_id: Optional[str] = None  # Stored for next step executions
    dataset_schema: Optional[Dict[str, Any]] = None  # Stored for next step executions

# Export Schemas
class DownloadItem(BaseModel):
    type: Literal["csv", "pdf"]
    name: str
    data: str  # base64 encoded

class ExportRequest(BaseModel):
    task_execution_id: str
    export_type: Literal["pdf", "csv"]
    result_data: Optional[Dict[str, Any]] = None

class ExportResponse(BaseModel):
    download: DownloadItem

# Stream Event Schemas
class StreamEvent(BaseModel):
    event: Literal["planning", "code_generation", "execution", "summary", "complete", "error"]
    data: Dict[str, Any]
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
