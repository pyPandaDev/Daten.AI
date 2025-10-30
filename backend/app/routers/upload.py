from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import io

from app.services.storage import storage
from app.services.planner import planner
from app.services.gemini_client import gemini_client
from app.models.schemas import UploadResponse, DatasetSchema

# Load environment configuration
import os
from dotenv import load_dotenv
load_dotenv()

MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", 50))
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

router = APIRouter()

@router.post("/upload", response_model=UploadResponse)
async def upload_dataset(
    file: UploadFile = File(...),
    user_goal: str = None
):
    """Upload and process a dataset file with optional user goal"""
    
    try:
        # Read file content
        content = await file.read()
        
        # Check file size after reading
        if len(content) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(status_code=413, detail=f"File size exceeds the maximum allowed size of {MAX_FILE_SIZE_MB} MB")
        
        # Determine file type and read into DataFrame
        filename = file.filename.lower()
        
        if filename.endswith('.csv'):
            # Try multiple encodings to handle various CSV formats
            encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'windows-1252', 'cp1252']
            df = None
            last_error = None
            
            for encoding in encodings:
                try:
                    df = pd.read_csv(io.BytesIO(content), encoding=encoding)
                    print(f"[UPLOAD] Successfully read CSV with {encoding} encoding")
                    break
                except UnicodeDecodeError as e:
                    last_error = e
                    continue
                except Exception as e:
                    # If it's not an encoding error, re-raise it
                    raise e
            
            if df is None:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Unable to decode CSV file. Tried encodings: {', '.join(encodings)}. Error: {str(last_error)}"
                )
        elif filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(io.BytesIO(content))
        elif filename.endswith('.json'):
            df = pd.read_json(io.BytesIO(content))
        elif filename.endswith('.parquet'):
            df = pd.read_parquet(io.BytesIO(content))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
        
        # Validate DataFrame
        if df.empty:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")
        
        # Store dataset locally
        file_id = storage.store_dataset(df, file.filename)
        print(f"[UPLOAD] Dataset stored locally with ID: {file_id}")
        
        # Extract schema
        schema_dict = planner.extract_dataset_schema(df)
        dataset_schema = DatasetSchema(**schema_dict)
        
        # Create table preview (first 10 rows)
        table_preview = df.head(10).to_dict(orient='records')
        # Convert values to JSON-serializable types
        for row in table_preview:
            for key, value in row.items():
                if pd.isna(value):
                    row[key] = None
                elif isinstance(value, (pd.Timestamp, pd.Timedelta)):
                    row[key] = str(value)
                elif hasattr(value, 'item'):  # numpy types
                    row[key] = value.item()
        
        # Generate comprehensive statistics summary
        statistics_summary = {
            "numeric_columns": [],
            "categorical_columns": [],
            "datetime_columns": []
        }
        
        # Numeric columns statistics
        numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
        for col in numeric_cols:
            col_stats = {
                "name": col,
                "count": int(df[col].count()),
                "mean": float(df[col].mean()) if not pd.isna(df[col].mean()) else None,
                "median": float(df[col].median()) if not pd.isna(df[col].median()) else None,
                "std": float(df[col].std()) if not pd.isna(df[col].std()) else None,
                "min": float(df[col].min()) if not pd.isna(df[col].min()) else None,
                "max": float(df[col].max()) if not pd.isna(df[col].max()) else None,
                "missing": int(df[col].isnull().sum())
            }
            statistics_summary["numeric_columns"].append(col_stats)
        
        # Categorical columns statistics
        categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
        for col in categorical_cols:
            unique_count = df[col].nunique()
            top_values = df[col].value_counts().head(3).to_dict()
            col_stats = {
                "name": col,
                "unique_values": int(unique_count),
                "most_common": [{
                    "value": str(k),
                    "count": int(v)
                } for k, v in top_values.items()],
                "missing": int(df[col].isnull().sum())
            }
            statistics_summary["categorical_columns"].append(col_stats)
        
        # Datetime columns statistics
        datetime_cols = df.select_dtypes(include=['datetime64', 'datetime']).columns.tolist()
        for col in datetime_cols:
            col_stats = {
                "name": col,
                "min": str(df[col].min()) if not pd.isna(df[col].min()) else None,
                "max": str(df[col].max()) if not pd.isna(df[col].max()) else None,
                "missing": int(df[col].isnull().sum())
            }
            statistics_summary["datetime_columns"].append(col_stats)
        
        # Get Gemini initial analysis
        print(f"[UPLOAD] Getting Gemini initial analysis...")
        gemini_summary = ""
        try:
            # Customize analysis based on user goal
            goal_context = f"\n\nUser's Goal: {user_goal}" if user_goal else ""
            
            analysis_prompt = f"""Analyze this dataset and provide a brief, clear summary in 3-4 sentences.{goal_context}

Dataset: {file.filename}
Shape: {df.shape[0]} rows × {df.shape[1]} columns

Columns and Types:
{df.dtypes.to_string()}

First 3 rows:
{df.head(3).to_string()}

Missing values:
{df.isnull().sum().to_string()}

Provide insights about:
1. What type of data this appears to be
2. Key patterns or characteristics you notice
3. Potential analysis opportunities (e.g., correlations, classifications, predictions)
4. Any data quality issues{' related to the user\'s goal' if user_goal else ''}

Keep it concise and user-friendly."""

            result = gemini_client.model.generate_content(analysis_prompt)
            gemini_summary = result.text.strip()
            print(f"[UPLOAD] Gemini summary generated successfully")
        except Exception as e:
            print(f"[UPLOAD] Gemini analysis failed: {e}")
            gemini_summary = f"Dataset contains {df.shape[0]} rows and {df.shape[1]} columns. Ready for analysis."
        
        return UploadResponse(
            file_id=file_id,
            filename=file.filename,
            dataset_schema=dataset_schema,
            message=f"Successfully uploaded {file.filename} with {df.shape[0]} rows and {df.shape[1]} columns",
            gemini_insights=gemini_summary,
            user_goal=user_goal,
            table_preview=table_preview,
            statistics_summary=statistics_summary
        )
    
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="File is empty or invalid")
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"ERROR in upload: {error_details}")
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
