from fastapi import APIRouter, HTTPException, BackgroundTasks
import uuid
import asyncio
from threading import Lock
from typing import Dict, Set

from app.models.schemas import RunRequest, RunResponse
from app.services.storage import storage
from app.services.gemini_client import gemini_client
from app.services.code_executor import code_executor
from app.services.planner import planner
from app.services.enhanced_code_generator import get_code_generator
from app.utils.streaming import stream_manager

router = APIRouter()

# Thread-safe execution tracking for multiple concurrent users/tasks
class ExecutionManager:
    def __init__(self):
        self.active_executions: Set[str] = set()
        self.execution_metadata: Dict[str, dict] = {}
        self.lock = Lock()
    
    def add_execution(self, task_execution_id: str, file_id: str, task_id: str):
        with self.lock:
            self.active_executions.add(task_execution_id)
            self.execution_metadata[task_execution_id] = {
                'file_id': file_id,
                'task_id': task_id,
                'started_at': asyncio.get_event_loop().time()
            }
    
    def remove_execution(self, task_execution_id: str):
        with self.lock:
            self.active_executions.discard(task_execution_id)
            self.execution_metadata.pop(task_execution_id, None)
    
    def is_active(self, task_execution_id: str) -> bool:
        with self.lock:
            return task_execution_id in self.active_executions
    
    def get_active_count(self) -> int:
        with self.lock:
            return len(self.active_executions)
    
    def get_metadata(self, task_execution_id: str) -> dict:
        with self.lock:
            return self.execution_metadata.get(task_execution_id, {})

execution_manager = ExecutionManager()

async def execute_task_async(task_execution_id: str, file_id: str, task: dict, dataset_context: dict):
    """Background task to execute analysis - supports concurrent execution"""
    
    # Add to active executions with metadata
    execution_manager.add_execution(task_execution_id, file_id, task.get('id', 'unknown'))
    
    active_count = execution_manager.get_active_count()
    print(f"[EXEC] Starting execution for task: {task_execution_id}")
    print(f"[EXEC] Active concurrent tasks: {active_count}")
    
    try:
        # Stream already created in run_task endpoint
        
        # Check if cancelled before starting
        if not execution_manager.is_active(task_execution_id):
            print(f"[EXEC] Task {task_execution_id} was cancelled before starting")
            return
        
        # Send planning event
        print(f"[EXEC] Sending planning event...")
        await stream_manager.send_event(
            task_execution_id,
            "planning",
            {"message": "Generating execution plan..."}
        )
        await asyncio.sleep(0.1)  # Small delay to ensure event is sent
        
        # Check if cancelled
        if not execution_manager.is_active(task_execution_id):
            print(f"[EXEC] Task {task_execution_id} was cancelled during planning")
            await stream_manager.close_stream(task_execution_id)
            return
        
        # ALWAYS use Gemini AI to generate code based on actual data
        # This ensures code is tailored to the specific dataset
        print(f"[EXEC] Generating code with Gemini based on dataset context...")
        result = gemini_client.generate_execution_plan(dataset_context, task)
        
        # Check if cancelled immediately after Gemini call
        if not execution_manager.is_active(task_execution_id):
            print(f"[EXEC] Task {task_execution_id} was cancelled after code generation")
            await stream_manager.close_stream(task_execution_id)
            return
        
        plan = result.get('plan', [])
        assumptions = result.get('assumptions', [])
        python_code = result.get('python_code', '')
        summary = result.get('summary', '')
        followups = result.get('followups', [])
        
        # Send code generation event with the actual code
        print(f"[EXEC] Sending code generation event with {len(python_code)} chars of code")
        await stream_manager.send_event(
            task_execution_id,
            "code_generation",
            {
                "message": "Code generated successfully",
                "plan": plan,
                "assumptions": assumptions,
                "python_code": python_code  # Send the code to frontend immediately
            }
        )
        await asyncio.sleep(0.2)  # Allow code event to be received
        
        # Check if cancelled before execution
        if not execution_manager.is_active(task_execution_id):
            print(f"[EXEC] Task {task_execution_id} was cancelled before execution")
            await stream_manager.close_stream(task_execution_id)
            return
        
        # Execute code locally
        print(f"[EXEC] Sending execution event...")
        await stream_manager.send_event(
            task_execution_id,
            "execution",
            {"message": "Executing analysis locally..."}
        )
        await asyncio.sleep(0.1)  # Ensure execution event is sent
        
        print(f"[EXEC] Executing code locally...")
        print(f"[EXEC] Code preview (first 500 chars):\n{python_code[:500]}")
        # Get the dataset
        df = storage.get_dataset(file_id)
        execution_result = code_executor.execute(python_code, df)
        print(f"[EXEC] Stdout length: {len(execution_result.get('stdout', ''))}")
        print(f"[EXEC] Stdout preview (first 300 chars): {execution_result.get('stdout', '')[:300]}")
        
        # Normalize result format to match previous Vertex AI format
        if execution_result['error']:
            execution_result['status'] = 'failed'
        else:
            execution_result['status'] = 'completed'
        
        print(f"[EXEC] Local execution completed. Status: {execution_result.get('status')}")
        
        # Check if cancelled after execution
        if not execution_manager.is_active(task_execution_id):
            print(f"[EXEC] Task {task_execution_id} was cancelled after execution")
            await stream_manager.close_stream(task_execution_id)
            return
        
        # Auto-fix with Gemini if execution failed
        max_fix_attempts = 2
        fix_attempt = 0
        
        while execution_result['error'] and fix_attempt < max_fix_attempts:
            # Check if cancelled before attempting fix
            if not execution_manager.is_active(task_execution_id):
                print(f"[EXEC] Task {task_execution_id} was cancelled during auto-fix")
                await stream_manager.close_stream(task_execution_id)
                return
            
            fix_attempt += 1
            print(f"[EXEC] Attempting auto-fix with Gemini (attempt {fix_attempt}/{max_fix_attempts})...")
            
            await stream_manager.send_event(
                task_execution_id,
                "execution",
                {"message": f"Error detected. Auto-fixing with AI (attempt {fix_attempt})..."}
            )
            
            try:
                # Ask Gemini to fix the code with explicit requirements for output
                # Convert dataset context to string to avoid unhashable type error
                columns_str = str(dataset_context.get('columns', []))
                shape_str = str(dataset_context.get('shape', []))
                dtypes_str = str(dataset_context.get('dtypes', {}))
                
                fix_prompt = f"""The following Python code failed with an error. Fix it and return ONLY the corrected Python code.

CRITICAL REQUIREMENTS:
1. The code MUST produce output using these exact formats:
   - For plots: print(f"PLOT_BASE64:{{plot_base64}}")
   - For metrics: print(f"METRIC:Name:{{value}}")
   - For tables: print("TABLE_START:name"), print(json), print("TABLE_END")

2. If error is about boxplot requiring numerical columns, select ONLY numeric columns first:
   numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
   if numeric_cols and len(numeric_cols) > 0:
       df[numeric_cols].boxplot(ax=ax)
   else:
       # Create alternative visualization for non-numeric data
       categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
       if categorical_cols:
           df[categorical_cols[0]].value_counts().plot(kind='bar', ax=ax)
   
3. ALWAYS include at least one visualization and 2-3 metrics in your fixed code.

4. Make sure to define plot_base64 before using it in print statement.

5. Handle mixed data types gracefully - check column types before visualization.

Original Code:
```python
{python_code}
```

Error:
{execution_result['error']}

Dataset Context:
- Columns: {columns_str}
- Data Types: {dtypes_str}
- Shape: {shape_str}

Return ONLY the fixed Python code that will execute successfully AND produce visualizations/metrics."""

                fix_result = gemini_client.model.generate_content(fix_prompt)
                fixed_code = fix_result.text.strip()
                
                # Clean up code if it's in markdown
                if '```python' in fixed_code:
                    fixed_code = fixed_code.split('```python')[1].split('```')[0].strip()
                elif '```' in fixed_code:
                    fixed_code = fixed_code.split('```')[1].split('```')[0].strip()
                
                print(f"[EXEC] Gemini provided fix. Retrying execution locally...")
                print(f"[EXEC] Fixed code preview (first 500 chars):\n{fixed_code[:500]}")
                python_code = fixed_code
                execution_result = code_executor.execute(python_code, df)
                print(f"[EXEC] After fix - Stdout length: {len(execution_result.get('stdout', ''))}")
                print(f"[EXEC] After fix - Stdout preview: {execution_result.get('stdout', '')[:300]}")
                
                # Normalize result format
                if execution_result['error']:
                    execution_result['status'] = 'failed'
                else:
                    execution_result['status'] = 'completed'
                
                print(f"[EXEC] Retry execution completed. Status: {execution_result.get('status')}")
                
            except Exception as fix_error:
                print(f"[EXEC] Auto-fix attempt failed: {fix_error}")
                break
        
        # Check for errors after auto-fix attempts
        if execution_result['error']:
            await stream_manager.send_event(
                task_execution_id,
                "error",
                {
                    "message": "Execution failed",
                    "error": execution_result['error']
                }
            )
            
            # Store error result
            storage.store_result(task_execution_id, {
                'task_execution_id': task_execution_id,
                'status': 'failed',
                'error': execution_result['error'],
                'execution_time': execution_result['execution_time']
            })
            
            await stream_manager.close_stream(task_execution_id)
            return
        
        # Get artifacts from execution result
        print(f"[EXEC] Processing artifacts...")
        artifacts = execution_result.get('artifacts', [])
        if not artifacts:
            artifacts = []
            print(f"[EXEC] Warning: No artifacts generated")
            print(f"[EXEC] Full stdout for debugging:\n{execution_result.get('stdout', 'No stdout')}")
            print(f"[EXEC] Full stderr for debugging:\n{execution_result.get('stderr', 'No stderr')}")
        else:
            print(f"[EXEC] Generated {len(artifacts)} artifacts")
        
        # Generate AI summary of results
        print(f"[EXEC] Generating AI summary...")
        try:
            summary_prompt = f"""Analyze the following data analysis results and provide a clear, concise summary in 2-3 sentences.

Task: {task.get('title', 'Data Analysis')}

Results:
- Artifacts generated: {len(artifacts)} (plots, tables, metrics)
- Execution time: {execution_result['execution_time']:.2f} seconds
- Status: {execution_result['status']}

Code executed:
{python_code[:500]}...

Provide a summary that explains:
1. What analysis was performed
2. Key findings or insights
3. What the user should look for in the results

Keep it concise and non-technical."""

            summary_result = gemini_client.model.generate_content(summary_prompt)
            ai_summary = summary_result.text.strip()
            
            # Use AI summary if available, fallback to default
            if ai_summary and len(ai_summary) > 20:
                summary = ai_summary
                print(f"[EXEC] AI summary generated successfully")
        except Exception as sum_err:
            print(f"[EXEC] AI summary generation failed, using default: {sum_err}")
            # Keep the original summary
        
        # Send summary event
        await stream_manager.send_event(
            task_execution_id,
            "summary",
            {
                "summary": summary,
                "artifacts_count": len(artifacts)
            }
        )
        
        # Prepare final result (include file_id and dataset_schema for next step executions)
        final_result = {
            'task_execution_id': task_execution_id,
            'status': 'completed',
            'plan': plan,
            'assumptions': assumptions,
            'python_code': python_code,
            'artifacts': artifacts,  # From GCS
            'summary': summary,
            'followups': followups,
            'error': None,
            'execution_time': execution_result['execution_time'],
            'file_id': file_id,  # Store for next step executions
            'dataset_schema': dataset_context.get('dataset_schema', {})  # Store for next step executions
        }
        
        # Store result
        storage.store_result(task_execution_id, final_result)
        
        # Send complete event
        print(f"[EXEC] Sending complete event...")
        print(f"[EXEC] Complete event data: status={final_result.get('status')}, artifacts={len(final_result.get('artifacts', []))}")
        await stream_manager.send_event(
            task_execution_id,
            "complete",
            final_result
        )
        
        # Wait longer before closing stream to ensure frontend receives the event
        await asyncio.sleep(1.0)
        
        # Close stream
        print(f"[EXEC] Closing stream...")
        await stream_manager.close_stream(task_execution_id)
        print(f"[EXEC] Execution completed successfully for task: {task_execution_id}")
    
    except Exception as e:
        import traceback
        error_msg = f"Unexpected error: {str(e)}"
        error_trace = traceback.format_exc()
        print(f"[EXEC ERROR] {error_msg}")
        print(f"[EXEC ERROR] Full traceback:\n{error_trace}")
        
        await stream_manager.send_event(
            task_execution_id,
            "error",
            {"message": error_msg, "error": str(e)}
        )
        
        storage.store_result(task_execution_id, {
            'task_execution_id': task_execution_id,
            'status': 'failed',
            'error': str(e),
            'execution_time': 0
        })
        
        # Wait before closing to ensure frontend receives error event
        await asyncio.sleep(0.5)
        
        await stream_manager.close_stream(task_execution_id)
    
    finally:
        # Always remove from active executions when done
        execution_manager.remove_execution(task_execution_id)
        remaining_count = execution_manager.get_active_count()
        print(f"[EXEC] Removed task {task_execution_id} from active executions")
        print(f"[EXEC] Remaining active tasks: {remaining_count}")

@router.delete("/run/{task_execution_id}")
async def cancel_task(task_execution_id: str):
    """Cancel an ongoing task execution"""
    
    if execution_manager.is_active(task_execution_id):
        metadata = execution_manager.get_metadata(task_execution_id)
        execution_manager.remove_execution(task_execution_id)
        print(f"[CANCEL] Task {task_execution_id} cancelled by user")
        print(f"[CANCEL] Task metadata: {metadata}")
        
        # Close the stream
        await stream_manager.close_stream(task_execution_id)
        
        return {"message": "Task cancelled successfully", "task_execution_id": task_execution_id}
    else:
        print(f"[CANCEL] Task {task_execution_id} not found in active executions")
        return {"message": "Task not found or already completed", "task_execution_id": task_execution_id}

@router.get("/run/status")
async def get_execution_status():
    """Get status of all active executions"""
    active_count = execution_manager.get_active_count()
    return {
        "active_tasks": active_count,
        "message": f"Currently processing {active_count} task(s)"
    }

@router.post("/run", response_model=RunResponse)
async def run_task(request: RunRequest, background_tasks: BackgroundTasks):
    """Start execution of a selected task"""
    
    try:
        # Verify dataset exists
        df = storage.get_dataset(request.file_id)
        if df is None:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        # Generate task execution ID
        task_execution_id = str(uuid.uuid4())
        
        # CREATE STREAM IMMEDIATELY before background task
        stream_manager.create_stream(task_execution_id)
        
        # Prepare task info
        task = {
            'id': request.task_id,
            'title': request.task_title,
            'parameters': request.parameters
        }
        
        # Prepare dataset context
        dataset_context = request.dataset_schema.model_dump()
        
        # Start background execution
        background_tasks.add_task(
            execute_task_async,
            task_execution_id,
            request.file_id,
            task,
            dataset_context
        )
        
        return RunResponse(
            task_execution_id=task_execution_id,
            status="queued",
            message="Task queued for execution"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting task: {str(e)}")
