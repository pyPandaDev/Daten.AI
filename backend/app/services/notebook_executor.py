import os
import uuid
import json
import tempfile
import nbformat
from nbformat.v4 import new_notebook, new_code_cell, new_markdown_cell
from nbconvert.preprocessors import ExecutePreprocessor
from nbconvert import HTMLExporter
from typing import Dict, Any, List, Tuple
import pandas as pd
import io
import base64


class NotebookExecutor:
    """Execute Python code in Jupyter notebooks and extract results"""
    
    def __init__(self):
        self.notebooks_dir = tempfile.mkdtemp(prefix="data_science_notebooks_")
        self.timeout = int(os.getenv("EXECUTION_TIMEOUT_SECONDS", "300"))
    
    def create_notebook(
        self, 
        title: str, 
        code: str, 
        dataset_path: str = None,
        description: str = ""
    ) -> Tuple[str, Dict[str, Any]]:
        """
        Create and execute a Jupyter notebook
        
        Args:
            title: Notebook title
            code: Python code to execute
            dataset_path: Path to dataset file
            description: Description of the analysis
            
        Returns:
            Tuple of (notebook_path, results)
        """
        # Create new notebook
        nb = new_notebook()
        
        # Add title cell
        nb.cells.append(new_markdown_cell(f"# {title}\n\n{description}"))
        
        # Add dataset loading cell if path provided
        if dataset_path:
            load_code = f"""
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import warnings
warnings.filterwarnings('ignore')

# Set style
sns.set_style('whitegrid')
plt.rcParams['figure.figsize'] = (12, 6)

# Load dataset
df = pd.read_csv('{dataset_path}')
print(f"Dataset loaded: {{df.shape[0]}} rows, {{df.shape[1]}} columns")
df.head()
"""
            nb.cells.append(new_code_cell(load_code))
        
        # Add main analysis code
        nb.cells.append(new_code_cell(code))
        
        # Execute notebook
        notebook_path = os.path.join(
            self.notebooks_dir, 
            f"{uuid.uuid4().hex[:8]}_{title.replace(' ', '_')}.ipynb"
        )
        
        try:
            # Execute
            ep = ExecutePreprocessor(timeout=self.timeout, kernel_name='python3')
            ep.preprocess(nb)
            
            # Save executed notebook
            with open(notebook_path, 'w', encoding='utf-8') as f:
                nbformat.write(nb, f)
            
            # Extract results
            results = self._extract_results(nb)
            return notebook_path, results
            
        except Exception as e:
            error_results = {
                'success': False,
                'error': str(e),
                'outputs': [],
                'plots': [],
                'tables': [],
                'metrics': {}
            }
            return notebook_path, error_results
    
    def _extract_results(self, nb: nbformat.NotebookNode) -> Dict[str, Any]:
        """Extract outputs, plots, tables, and metrics from executed notebook"""
        
        results = {
            'success': True,
            'outputs': [],
            'plots': [],
            'tables': [],
            'metrics': {},
            'summary': ''
        }
        
        for cell in nb.cells:
            if cell.cell_type == 'code' and hasattr(cell, 'outputs'):
                for output in cell.outputs:
                    # Extract text/stream output
                    if output.output_type == 'stream':
                        text = output.text
                        results['outputs'].append(text)
                        
                        # Parse special markers
                        self._parse_special_markers(text, results)
                    
                    # Extract display_data (plots, tables)
                    elif output.output_type == 'display_data':
                        if 'image/png' in output.data:
                            plot_base64 = output.data['image/png']
                            results['plots'].append(plot_base64)
                        
                        if 'text/html' in output.data:
                            html = output.data['text/html']
                            results['tables'].append(html)
                    
                    # Extract execute_result (DataFrame display)
                    elif output.output_type == 'execute_result':
                        if 'text/html' in output.data:
                            html = output.data['text/html']
                            results['tables'].append(html)
                        elif 'text/plain' in output.data:
                            text = output.data['text/plain']
                            results['outputs'].append(text)
        
        return results
    
    def _parse_special_markers(self, text: str, results: Dict[str, Any]):
        """Parse special markers in output text (METRIC:, PLOT_BASE64:, TABLE_START:)"""
        
        lines = text.split('\n')
        
        for line in lines:
            # Parse metrics
            if line.startswith('METRIC:'):
                try:
                    parts = line.replace('METRIC:', '').split(':', 1)
                    if len(parts) == 2:
                        key, value = parts
                        results['metrics'][key.strip()] = value.strip()
                except:
                    pass
            
            # Parse base64 plots
            elif line.startswith('PLOT_BASE64:'):
                try:
                    plot_data = line.replace('PLOT_BASE64:', '').strip()
                    results['plots'].append(plot_data)
                except:
                    pass
            
            # Parse summary
            elif line.startswith('SUMMARY:'):
                try:
                    summary = line.replace('SUMMARY:', '').strip()
                    results['summary'] = summary
                except:
                    pass
    
    def convert_to_html(self, notebook_path: str) -> str:
        """Convert notebook to HTML for viewing"""
        
        try:
            with open(notebook_path, 'r', encoding='utf-8') as f:
                nb = nbformat.read(f, as_version=4)
            
            html_exporter = HTMLExporter()
            html_exporter.template_name = 'classic'
            
            (body, resources) = html_exporter.from_notebook_node(nb)
            return body
            
        except Exception as e:
            return f"<p>Error converting notebook: {str(e)}</p>"
    
    def execute_code_with_dataframe(
        self, 
        code: str, 
        df: pd.DataFrame
    ) -> Dict[str, Any]:
        """
        Execute code with a DataFrame in notebook environment
        
        Args:
            code: Python code to execute
            df: DataFrame to work with
            
        Returns:
            Dictionary with execution results
        """
        # Save DataFrame to temp CSV
        temp_csv = os.path.join(self.notebooks_dir, f"temp_{uuid.uuid4().hex[:8]}.csv")
        df.to_csv(temp_csv, index=False)
        
        try:
            # Create and execute notebook
            title = "Analysis"
            notebook_path, results = self.create_notebook(
                title=title,
                code=code,
                dataset_path=temp_csv,
                description="Automated data analysis"
            )
            
            results['notebook_path'] = notebook_path
            results['notebook_html'] = self.convert_to_html(notebook_path)
            
            return results
            
        finally:
            # Cleanup temp file
            if os.path.exists(temp_csv):
                os.remove(temp_csv)
    
    def cleanup_old_notebooks(self, max_age_hours: int = 24):
        """Remove old notebooks to save disk space"""
        import time
        
        current_time = time.time()
        
        for filename in os.listdir(self.notebooks_dir):
            filepath = os.path.join(self.notebooks_dir, filename)
            
            if os.path.isfile(filepath):
                file_age_hours = (current_time - os.path.getmtime(filepath)) / 3600
                
                if file_age_hours > max_age_hours:
                    try:
                        os.remove(filepath)
                    except:
                        pass


# Singleton instance
_notebook_executor = None

def get_notebook_executor() -> NotebookExecutor:
    """Get or create NotebookExecutor singleton"""
    global _notebook_executor
    if _notebook_executor is None:
        _notebook_executor = NotebookExecutor()
    return _notebook_executor
