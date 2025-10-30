from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from app.models.schemas import RecommendRequest, RecommendResponse, AIRecommendation, DatasetSchema
from app.services.gemini_client import gemini_client
from app.services.storage import storage

router = APIRouter()

# Request/Response models for feature recommendations
class FeatureRecommendRequest(BaseModel):
    file_id: str
    dataset_schema: DatasetSchema
    path: str  # 'analysis' or 'datascience'

class FeatureRecommendation(BaseModel):
    feature_ids: List[str]
    reasoning: str
    data_insights: List[str]

@router.post("/recommend", response_model=RecommendResponse)
async def get_ai_recommendation(request: RecommendRequest):
    """
    Get AI-powered recommendation on whether to use Data Analysis or Data Science path
    """
    
    try:
        # Verify dataset exists
        df = storage.get_dataset(request.file_id)
        if df is None:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        # Prepare dataset context
        dataset_schema = request.dataset_schema.model_dump()
        
        # Analyze dataset characteristics
        num_rows = dataset_schema['shape'][0]
        num_cols = dataset_schema['shape'][1]
        dtypes = dataset_schema['dtypes']
        null_counts = dataset_schema.get('null_counts', {})
        
        # Count column types
        num_numeric = sum(1 for dtype in dtypes.values() if 'int' in dtype or 'float' in dtype)
        num_categorical = sum(1 for dtype in dtypes.values() if 'object' in dtype or 'category' in dtype)
        has_datetime = any('datetime' in dtype for dtype in dtypes.values())
        
        # Calculate data quality metrics
        total_nulls = sum(null_counts.values())
        null_percentage = (total_nulls / (num_rows * num_cols) * 100) if num_rows * num_cols > 0 else 0
        
        # Get sample data
        sample_rows = dataset_schema.get('sample_rows', [])[:5]
        
        # Build prompt for Gemini
        recommendation_prompt = f"""Analyze this dataset and recommend whether the user should choose "Data Analysis" or "Data Science" path.

Dataset Characteristics:
- Shape: {num_rows} rows × {num_cols} columns
- Numeric columns: {num_numeric}
- Categorical columns: {num_categorical}
- Has datetime columns: {has_datetime}
- Missing values: {null_percentage:.1f}%

Column Types:
{chr(10).join([f'- {col}: {dtype}' for col, dtype in list(dtypes.items())[:10]])}

Sample Data (first few rows):
{sample_rows}

Based on this dataset:

1. Recommend ONE path:
   - "Data Analysis" - for exploratory analysis, visualization, statistical insights
   - "Data Science" - for predictive modeling, machine learning, advanced analytics

2. Provide your confidence level (0.0 to 1.0)

3. Explain your reasoning in 2-3 sentences

4. List 3-5 specific task suggestions relevant to this path

5. Describe 3-4 key data characteristics that influenced your decision

Respond in JSON format:
{{
  "recommended_path": "analysis" or "datascience",
  "confidence": 0.85,
  "reasoning": "Brief explanation...",
  "suggested_tasks": ["Task 1", "Task 2", "Task 3"],
  "data_characteristics": ["Characteristic 1", "Characteristic 2", "Characteristic 3"]
}}"""

        try:
            # Get AI recommendation
            result = gemini_client.model.generate_content(recommendation_prompt)
            response_text = result.text.strip()
            
            # Parse JSON response
            import json
            # Extract JSON from markdown code blocks if present
            if '```json' in response_text:
                response_text = response_text.split('```json')[1].split('```')[0].strip()
            elif '```' in response_text:
                response_text = response_text.split('```')[1].split('```')[0].strip()
            
            ai_data = json.loads(response_text)
            
            # Validate and create recommendation
            recommendation = AIRecommendation(
                recommended_path=ai_data['recommended_path'],
                confidence=float(ai_data['confidence']),
                reasoning=ai_data['reasoning'],
                suggested_tasks=ai_data['suggested_tasks'][:5],
                data_characteristics=ai_data['data_characteristics'][:4]
            )
            
            print(f"[RECOMMEND] AI recommendation: {recommendation.recommended_path} (confidence: {recommendation.confidence})")
            
        except Exception as e:
            print(f"[RECOMMEND] Gemini recommendation failed: {e}, using rule-based fallback")
            
            # Fallback to rule-based recommendation
            recommendation = _get_rule_based_recommendation(
                num_rows, num_cols, num_numeric, num_categorical, 
                has_datetime, null_percentage
            )
        
        return RecommendResponse(recommendation=recommendation)
    
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"ERROR in recommend: {error_details}")
        raise HTTPException(status_code=500, detail=f"Error generating recommendation: {str(e)}")


def _get_rule_based_recommendation(
    num_rows: int, 
    num_cols: int, 
    num_numeric: int, 
    num_categorical: int,
    has_datetime: bool,
    null_percentage: float
) -> AIRecommendation:
    """
    Rule-based fallback for recommendations when AI fails
    """
    
    score_analysis = 0.5
    score_datascience = 0.5
    
    # More rows favor data science (ML needs data)
    if num_rows >= 1000:
        score_datascience += 0.2
    elif num_rows >= 500:
        score_datascience += 0.1
    else:
        score_analysis += 0.1
    
    # More features favor data science
    if num_cols >= 10:
        score_datascience += 0.15
    elif num_cols >= 5:
        score_datascience += 0.05
    
    # Good mix of numeric features favors ML
    if num_numeric >= 3 and num_rows >= 100:
        score_datascience += 0.15
    
    # Primarily categorical or mixed data favors analysis first
    if num_categorical > num_numeric:
        score_analysis += 0.1
    
    # Time series favors analysis
    if has_datetime:
        score_analysis += 0.1
    
    # High missing values favor analysis/cleaning first
    if null_percentage > 10:
        score_analysis += 0.1
    
    # Determine recommendation
    if score_datascience > score_analysis:
        path = "datascience"
        confidence = min(score_datascience, 0.85)
        reasoning = f"Dataset has {num_rows} rows and {num_cols} columns with {num_numeric} numeric features, suitable for machine learning workflows. Recommending data science path for predictive modeling."
        tasks = [
            "Data preprocessing and cleaning",
            "Feature engineering and selection",
            "Model building and evaluation",
            "Cross-validation and metrics"
        ]
    else:
        path = "analysis"
        confidence = min(score_analysis, 0.85)
        reasoning = f"Dataset characteristics suggest starting with exploratory analysis. With {num_rows} rows and {num_cols} columns, focus on understanding patterns and distributions first."
        tasks = [
            "Dataset overview and statistics",
            "Distribution and correlation analysis",
            "Data visualization",
            "Missing value analysis"
        ]
    
    characteristics = [
        f"{num_rows:,} rows and {num_cols} columns",
        f"{num_numeric} numeric, {num_categorical} categorical features",
        f"Missing values: {null_percentage:.1f}%"
    ]
    
    if has_datetime:
        characteristics.append("Contains time-series data")
    
    return AIRecommendation(
        recommended_path=path,
        confidence=confidence,
        reasoning=reasoning,
        suggested_tasks=tasks,
        data_characteristics=characteristics
    )


@router.post("/recommend-features", response_model=FeatureRecommendation)
async def get_feature_recommendations(request: FeatureRecommendRequest):
    """
    Get AI-powered feature recommendations for manual mode based on dataset analysis
    """
    
    try:
        # Verify dataset exists
        df = storage.get_dataset(request.file_id)
        if df is None:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        # Prepare dataset context
        dataset_schema = request.dataset_schema.model_dump()
        
        # Analyze dataset characteristics
        num_rows = dataset_schema['shape'][0]
        num_cols = dataset_schema['shape'][1]
        dtypes = dataset_schema['dtypes']
        null_counts = dataset_schema.get('null_counts', {})
        columns = dataset_schema.get('columns', [])
        
        # Count column types
        num_numeric = sum(1 for dtype in dtypes.values() if 'int' in dtype or 'float' in dtype)
        num_categorical = sum(1 for dtype in dtypes.values() if 'object' in dtype or 'category' in dtype)
        has_datetime = any('datetime' in dtype for dtype in dtypes.values())
        
        # Calculate data quality metrics
        total_nulls = sum(null_counts.values())
        null_percentage = (total_nulls / (num_rows * num_cols) * 100) if num_rows * num_cols > 0 else 0
        
        # Build path-specific feature lists
        if request.path == 'analysis':
            available_features = {
                'head_tail': 'View first and last rows',
                'shape': 'Dataset dimensions',
                'missing_values': 'Missing value analysis',
                'duplicate_rows': 'Duplicate detection',
                'datatype_info': 'Data type information',
                'histogram': 'Distribution histograms',
                'scatter_plot': 'Scatter plots',
                'box_plot': 'Box plots for outliers',
                'heatmap': 'Correlation heatmap',
                'bar_chart': 'Bar charts',
                'correlation_matrix': 'Correlation analysis',
                'outlier_detection': 'Outlier detection',
                'distribution_analysis': 'Distribution analysis',
                'categorical_summary': 'Categorical summaries',
                'numeric_summary': 'Numeric statistics'
            }
        else:  # datascience
            available_features = {
                'handle_missing': 'Handle missing values',
                'remove_duplicates': 'Remove duplicates',
                'handle_outliers': 'Outlier treatment',
                'feature_engineering': 'Feature engineering',
                'train_model': 'Train ML model',
                'model_evaluation': 'Model evaluation',
                'hyperparameter_tuning': 'Hyperparameter tuning',
                'correlation_test': 'Correlation testing',
                'hypothesis_test': 'Hypothesis testing'
            }
        
        # Build prompt for Gemini
        feature_prompt = f"""Analyze this dataset and recommend the BEST 3-5 features for {request.path} path in manual mode.

Dataset Characteristics:
- Shape: {num_rows} rows × {num_cols} columns
- Numeric columns: {num_numeric}
- Categorical columns: {num_categorical}
- Has datetime columns: {has_datetime}
- Missing values: {null_percentage:.1f}%
- Column names: {', '.join(columns[:10])}

Available Features:
{chr(10).join([f'- {fid}: {desc}' for fid, desc in available_features.items()])}

Based on this dataset, recommend 3-5 feature IDs that would provide the MOST VALUE.

Consider:
1. Data quality issues (missing values, duplicates)
2. Data types and distributions
3. Relationships between variables
4. Most impactful insights for this specific dataset

Respond in JSON format:
{{
  "feature_ids": ["feature_id1", "feature_id2", "feature_id3"],
  "reasoning": "Brief explanation of why these features are recommended for this dataset",
  "data_insights": ["Insight 1 about the data", "Insight 2", "Insight 3"]
}}"""

        try:
            # Get AI recommendation
            result = gemini_client.model.generate_content(feature_prompt)
            response_text = result.text.strip()
            
            # Parse JSON response
            import json
            # Extract JSON from markdown code blocks if present
            if '```json' in response_text:
                response_text = response_text.split('```json')[1].split('```')[0].strip()
            elif '```' in response_text:
                response_text = response_text.split('```')[1].split('```')[0].strip()
            
            ai_data = json.loads(response_text)
            
            # Validate feature IDs
            valid_feature_ids = [fid for fid in ai_data['feature_ids'] if fid in available_features]
            
            # If no valid features, use fallback
            if not valid_feature_ids:
                raise ValueError("No valid feature IDs returned")
            
            recommendation = FeatureRecommendation(
                feature_ids=valid_feature_ids[:5],
                reasoning=ai_data.get('reasoning', 'AI-recommended features based on dataset analysis'),
                data_insights=ai_data.get('data_insights', [])[:4]
            )
            
            print(f"[RECOMMEND-FEATURES] AI recommended: {recommendation.feature_ids}")
            
        except Exception as e:
            print(f"[RECOMMEND-FEATURES] Gemini recommendation failed: {e}, using rule-based fallback")
            
            # Fallback to rule-based recommendation
            recommendation = _get_rule_based_feature_recommendation(
                request.path, num_rows, num_cols, num_numeric, num_categorical,
                has_datetime, null_percentage, available_features
            )
        
        return recommendation
    
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"ERROR in recommend-features: {error_details}")
        raise HTTPException(status_code=500, detail=f"Error generating feature recommendations: {str(e)}")


def _get_rule_based_feature_recommendation(
    path: str,
    num_rows: int,
    num_cols: int,
    num_numeric: int,
    num_categorical: int,
    has_datetime: bool,
    null_percentage: float,
    available_features: dict
) -> FeatureRecommendation:
    """
    Rule-based fallback for feature recommendations when AI fails
    """
    
    feature_ids = []
    insights = []
    
    if path == 'analysis':
        # Always start with basics
        feature_ids.append('shape')
        insights.append(f"Dataset has {num_rows:,} rows and {num_cols} columns")
        
        # Check for missing values
        if null_percentage > 5:
            feature_ids.append('missing_values')
            insights.append(f"{null_percentage:.1f}% missing values detected")
        
        # Numeric analysis
        if num_numeric >= 2:
            feature_ids.append('correlation_matrix')
            feature_ids.append('histogram')
            insights.append(f"{num_numeric} numeric columns suitable for correlation analysis")
        
        # Categorical analysis
        if num_categorical > 0:
            feature_ids.append('categorical_summary')
            insights.append(f"{num_categorical} categorical columns for frequency analysis")
        
        # Outlier detection for numeric data
        if num_numeric >= 1:
            feature_ids.append('outlier_detection')
        
        reasoning = "Recommended features for comprehensive data analysis including distributions, correlations, and data quality checks."
        
    else:  # datascience
        # Data cleaning first
        if null_percentage > 5:
            feature_ids.append('handle_missing')
            insights.append(f"{null_percentage:.1f}% missing values need handling")
        
        # Feature engineering
        if num_numeric >= 2:
            feature_ids.append('feature_engineering')
            insights.append(f"{num_numeric} numeric features available for engineering")
        
        # Model training
        if num_rows >= 100 and num_numeric >= 1:
            feature_ids.append('train_model')
            insights.append(f"Dataset size ({num_rows:,} rows) suitable for ML modeling")
        
        # Outlier handling
        if num_numeric >= 1:
            feature_ids.append('handle_outliers')
        
        # Model evaluation
        feature_ids.append('model_evaluation')
        
        reasoning = "Recommended features for complete ML pipeline including data preparation, feature engineering, and model building."
    
    # Ensure we have 3-5 features
    feature_ids = feature_ids[:5]
    
    return FeatureRecommendation(
        feature_ids=feature_ids,
        reasoning=reasoning,
        data_insights=insights[:4]
    )
