from typing import Dict, Any
import pandas as pd

class Planner:
    """Build prompts and validate inputs for data analysis tasks"""
    
    def extract_dataset_schema(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Extract comprehensive schema and statistics from a DataFrame"""
        
        # Get basic info
        columns = df.columns.tolist()
        dtypes = {col: str(df[col].dtype) for col in columns}
        shape = list(df.shape)
        
        # Get null counts
        null_counts = df.isnull().sum().to_dict()
        null_counts = {col: int(count) for col, count in null_counts.items()}
        
        # Get more sample rows for better context (10 instead of 5)
        sample_rows = df.head(10).to_dict(orient='records')
        
        # Convert numpy types to Python types for JSON serialization
        for row in sample_rows:
            for key, value in row.items():
                if pd.isna(value):
                    row[key] = None
                elif isinstance(value, (pd.Timestamp, pd.Timedelta)):
                    row[key] = str(value)
                elif hasattr(value, 'item'):  # numpy types
                    row[key] = value.item()
        
        # Get summary statistics for numerical columns
        numerical_cols = df.select_dtypes(include=['number']).columns.tolist()
        summary_stats = {}
        for col in numerical_cols:
            try:
                summary_stats[col] = {
                    'mean': float(df[col].mean()),
                    'median': float(df[col].median()),
                    'std': float(df[col].std()),
                    'min': float(df[col].min()),
                    'max': float(df[col].max()),
                    'q25': float(df[col].quantile(0.25)),
                    'q75': float(df[col].quantile(0.75))
                }
            except:
                pass
        
        # Get unique counts and top values for categorical columns
        categorical_info = {}
        categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
        for col in categorical_cols[:10]:  # Limit to first 10 categorical columns
            try:
                unique_count = int(df[col].nunique())
                # Get top 5 most common values
                top_values = df[col].value_counts().head(5).to_dict()
                top_values = {str(k): int(v) for k, v in top_values.items()}
                categorical_info[col] = {
                    'unique_count': unique_count,
                    'top_values': top_values
                }
            except:
                pass
        
        # Memory usage
        memory_mb = df.memory_usage(deep=True).sum() / 1024 / 1024
        memory_usage = f"{memory_mb:.2f} MB"
        
        return {
            "columns": columns,
            "dtypes": dtypes,
            "shape": shape,
            "sample_rows": sample_rows,
            "null_counts": null_counts,
            "summary_stats": summary_stats,
            "categorical_info": categorical_info,
            "memory_usage": memory_usage
        }
    
    def validate_task_parameters(self, task: Dict[str, Any], dataset_schema: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and enrich task parameters based on dataset schema"""
        
        parameters = task.get('parameters', {})
        
        # Add dataset context to parameters
        parameters['_dataset_columns'] = dataset_schema['columns']
        parameters['_dataset_shape'] = dataset_schema['shape']
        
        return parameters

# Global planner instance
planner = Planner()
