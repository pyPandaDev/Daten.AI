import sys
import io
import re
import base64
import time
from typing import Dict, Any, List, Tuple
import pandas as pd
import numpy as np
from contextlib import redirect_stdout, redirect_stderr

class CodeExecutor:
    """Safely execute generated Python code in a controlled environment"""
    
    def __init__(self, timeout: int = 300):
        self.timeout = timeout
    
    def execute(self, code: str, df: pd.DataFrame) -> Dict[str, Any]:
        """Execute Python code and capture results"""
        
        start_time = time.time()
        
        # Create execution environment
        exec_globals = {
            'pd': pd,
            'np': np,
            'df': df.copy(),
            '__builtins__': __builtins__,
        }
        
        # Import common libraries
        import matplotlib
        matplotlib.use('Agg')  # Non-interactive backend
        import matplotlib.pyplot as plt
        import seaborn as sns
        import sklearn
        import scipy
        
        exec_globals.update({
            'plt': plt,
            'sns': sns,
            'sklearn': sklearn,
            'scipy': scipy,
            'io': io,
            'base64': base64,
        })
        
        # Capture stdout and stderr
        stdout_capture = io.StringIO()
        stderr_capture = io.StringIO()
        
        artifacts = {
            'tables': [],
            'plots': [],
            'metrics': []
        }
        
        error = None
        
        try:
            with redirect_stdout(stdout_capture), redirect_stderr(stderr_capture):
                exec(code, exec_globals)
            
            # Parse output
            output = stdout_capture.getvalue()
            stderr_output = stderr_capture.getvalue()
            
            # Check for errors in stderr
            if stderr_output and "Error" in stderr_output:
                print(f"Warning in stderr: {stderr_output}")
            
            artifacts = self._parse_output(output)
            
        except NameError as e:
            error = f"Variable not defined: {str(e)}. Check that all variables (like plot_base64) are properly defined before use."
            print(f"Execution error: {error}")
        except Exception as e:
            error = f"{type(e).__name__}: {str(e)}"
            print(f"Execution error: {error}")
        
        execution_time = time.time() - start_time
        
        return {
            'artifacts': artifacts,
            'error': error,
            'execution_time': execution_time,
            'stdout': stdout_capture.getvalue(),
            'stderr': stderr_capture.getvalue()
        }
    
    def _parse_output(self, output: str) -> Dict[str, List[Any]]:
        """Parse structured output from code execution"""
        
        artifacts = {
            'tables': [],
            'plots': [],
            'metrics': []
        }
        
        lines = output.split('\n')
        i = 0
        
        while i < len(lines):
            line = lines[i].strip()
            
            # Parse tables
            if line.startswith('TABLE_START:'):
                table_name = line.replace('TABLE_START:', '')
                table_data = []
                i += 1
                
                while i < len(lines) and not lines[i].strip().startswith('TABLE_END'):
                    table_data.append(lines[i])
                    i += 1
                
                try:
                    import json
                    table_json = ''.join(table_data)
                    table_records = json.loads(table_json)
                    
                    # Convert to list of lists format
                    if table_records:
                        headers = list(table_records[0].keys())
                        rows = [[str(record.get(h, '')) for h in headers] for record in table_records]
                        
                        artifacts['tables'].append({
                            'type': 'table',
                            'name': table_name,
                            'data': [headers] + rows
                        })
                except:
                    pass
            
            # Parse plots
            elif line.startswith('PLOT_BASE64:'):
                plot_data = line.replace('PLOT_BASE64:', '')
                artifacts['plots'].append({
                    'type': 'plot',
                    'name': f'plot_{len(artifacts["plots"]) + 1}',
                    'format': 'png_base64',
                    'data': plot_data
                })
            
            # Parse metrics
            elif line.startswith('METRIC:'):
                parts = line.replace('METRIC:', '').split(':', 2)
                if len(parts) >= 2:
                    metric_name = parts[0]
                    metric_value = parts[1]
                    
                    # Try to convert to number
                    try:
                        metric_value = float(metric_value)
                    except:
                        pass
                    
                    if not artifacts['metrics']:
                        artifacts['metrics'] = [{
                            'type': 'metrics',
                            'items': []
                        }]
                    
                    artifacts['metrics'][0]['items'].append({
                        'name': metric_name,
                        'value': metric_value
                    })
            
            i += 1
        
        # Flatten metrics if present
        result_artifacts = []
        if artifacts['tables']:
            result_artifacts.extend(artifacts['tables'])
        if artifacts['plots']:
            result_artifacts.extend(artifacts['plots'])
        if artifacts['metrics']:
            result_artifacts.extend(artifacts['metrics'])
        
        return result_artifacts

# Global executor instance
code_executor = CodeExecutor()
