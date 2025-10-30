from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any

from app.services.gemini_client import gemini_client
from app.services.storage import storage

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    execution_result: Optional[Dict[str, Any]] = None
    code: Optional[str] = None

class ChatResponse(BaseModel):
    response: str

class DatasetChatRequest(BaseModel):
    file_id: str
    message: str
    dataset_schema: Dict[str, Any]

class ResultsChatRequest(BaseModel):
    message: str
    execution_result: Dict[str, Any]
    python_code: Optional[str] = None

@router.post("/chat/dataset", response_model=ChatResponse)
async def chat_about_dataset(request: DatasetChatRequest):
    """Chat with AI about the uploaded dataset before path selection"""
    
    try:
        # Get the dataset from storage
        df = storage.get_dataset(request.file_id)
        if df is None:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        # Build context about the dataset
        schema = request.dataset_schema
        
        # Get basic statistics
        numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
        categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
        
        stats_info = []
        if numeric_cols:
            stats_info.append(f"Numeric columns: {', '.join(numeric_cols[:5])}{'...' if len(numeric_cols) > 5 else ''}")
            for col in numeric_cols[:3]:
                stats_info.append(f"  - {col}: mean={df[col].mean():.2f}, std={df[col].std():.2f}, min={df[col].min():.2f}, max={df[col].max():.2f}")
        
        if categorical_cols:
            stats_info.append(f"\nCategorical columns: {', '.join(categorical_cols[:5])}{'...' if len(categorical_cols) > 5 else ''}")
            for col in categorical_cols[:3]:
                unique_vals = df[col].nunique()
                stats_info.append(f"  - {col}: {unique_vals} unique values")
        
        # Create comprehensive context
        context = f"""Dataset Information:
- Shape: {schema['shape'][0]} rows × {schema['shape'][1]} columns
- Columns: {', '.join(schema['columns'][:10])}{'...' if len(schema['columns']) > 10 else ''}
- Memory usage: {schema['memory_usage']}

Data Types:
{chr(10).join([f"- {col}: {dtype}" for col, dtype in list(schema['dtypes'].items())[:10]])}

Missing Values:
{chr(10).join([f"- {col}: {count} missing" for col, count in schema['null_counts'].items() if count > 0][:5])}

Statistics:
{chr(10).join(stats_info)}

First 3 rows sample:
{df.head(3).to_string()}
"""
        
        # Create prompt for Gemini
        prompt = f"""You are a helpful data analyst assistant. A user has uploaded a dataset and is asking questions about it.

{context}

User Question: {request.message}

Provide a clear, concise, and helpful response. Use the dataset information provided to answer accurately.
- Reference specific columns, values, and statistics when relevant
- Explain data patterns and characteristics
- Suggest potential analyses or insights when appropriate
- Be friendly and encouraging

Response:"""

        # Get response from Gemini
        response = gemini_client.model.generate_content(prompt)
        ai_response = response.text.strip()
        
        return ChatResponse(response=ai_response)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[DATASET_CHAT] Error: {str(e)}")
        return ChatResponse(
            response="I apologize, but I encountered an error processing your question. Could you please rephrase it or ask something else about your dataset?"
        )

@router.post("/chat/analyze", response_model=ChatResponse)
async def analyze_results(request: ChatRequest):
    """Chat with AI about analysis results"""
    
    try:
        # Build context for Gemini
        context_parts = [
            f"User Question: {request.message}",
            ""
        ]
        
        if request.code:
            context_parts.append(f"Python Code Executed:\n```python\n{request.code}\n```\n")
        
        if request.execution_result:
            result = request.execution_result
            
            if result.get('summary'):
                context_parts.append(f"Analysis Summary: {result['summary']}\n")
            
            if result.get('artifacts'):
                artifact_summary = []
                for artifact in result['artifacts']:
                    if artifact.get('type') == 'metrics':
                        metrics_list = [f"{item['name']}: {item['value']}" for item in artifact.get('items', [])]
                        artifact_summary.append(f"Metrics: {', '.join(metrics_list)}")
                    elif artifact.get('type') == 'plot':
                        artifact_summary.append(f"Generated visualization: {artifact.get('name', 'plot')}")
                    elif artifact.get('type') == 'table':
                        artifact_summary.append(f"Generated table: {artifact.get('name', 'table')}")
                
                if artifact_summary:
                    context_parts.append(f"Generated Outputs: {'; '.join(artifact_summary)}\n")
        
        # Create prompt for Gemini
        prompt = f"""You are a helpful data science assistant. A user has run an analysis and has a question about the results.

Context:
{chr(10).join(context_parts)}

Please provide a clear, concise, and helpful response to the user's question. 
- Explain concepts in simple terms
- Reference specific results when relevant
- Suggest next steps if appropriate
- Be encouraging and supportive

Response:"""

        # Get response from Gemini
        response = gemini_client.model.generate_content(prompt)
        ai_response = response.text.strip()
        
        return ChatResponse(response=ai_response)
        
    except Exception as e:
        print(f"[CHAT] Error: {str(e)}")
        return ChatResponse(
            response="I apologize, but I encountered an error processing your question. Could you please rephrase it or ask something else about your analysis results?"
        )

@router.post("/chat/results", response_model=ChatResponse)
async def chat_about_results(request: ResultsChatRequest):
    """Chat with AI about execution results on the results page"""
    
    try:
        # Build comprehensive context from results
        result = request.execution_result
        context_parts = []
        
        # Add summary
        if result.get('summary'):
            context_parts.append(f"Analysis Summary: {result['summary']}")
        
        # Add code context
        if request.python_code:
            context_parts.append(f"\nPython Code Executed:\n{request.python_code[:500]}...")
        
        # Add artifacts summary
        if result.get('artifacts'):
            artifacts_info = []
            for artifact in result['artifacts']:
                if artifact.get('type') == 'metrics':
                    metrics = [f"{item['name']}: {item['value']}" for item in artifact.get('items', [])]
                    artifacts_info.append(f"Metrics - {', '.join(metrics)}")
                elif artifact.get('type') == 'plot':
                    artifacts_info.append(f"Visualization: {artifact.get('name', 'plot')}")
                elif artifact.get('type') == 'table':
                    artifacts_info.append(f"Table: {artifact.get('name', 'table')}")
            
            if artifacts_info:
                context_parts.append(f"\nGenerated Outputs:\n" + "\n".join(f"- {info}" for info in artifacts_info))
        
        # Add followups context
        if result.get('followups'):
            context_parts.append(f"\nSuggested Next Steps:\n" + "\n".join(f"- {step}" for step in result['followups']))
        
        # Create prompt
        prompt = f"""You are a helpful data science assistant. A user is viewing their analysis results and has a question.

Context:
{chr(10).join(context_parts)}

User Question: {request.message}

Provide a clear, helpful response that:
- Explains the results in simple terms
- References specific metrics, visualizations, or patterns
- Suggests actionable insights when appropriate
- Encourages further exploration

Response:"""

        # Get response from Gemini
        response = gemini_client.model.generate_content(prompt)
        ai_response = response.text.strip()
        
        return ChatResponse(response=ai_response)
        
    except Exception as e:
        print(f"[RESULTS_CHAT] Error: {str(e)}")
        return ChatResponse(
            response="I apologize, but I encountered an error. Could you please rephrase your question?"
        )
