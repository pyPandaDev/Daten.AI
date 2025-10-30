from fastapi import APIRouter, HTTPException
from typing import List

from app.models.schemas import SuggestRequest, SuggestResponse, TaskSuggestion
from app.services.gemini_client import gemini_client
from app.services.storage import storage
from app.services.comprehensive_eda import get_eda_service
from app.services.task_taxonomy import task_taxonomy

router = APIRouter()

@router.post("/suggest", response_model=SuggestResponse)
async def suggest_tasks(request: SuggestRequest):
    """Generate task suggestions based on dataset context"""
    
    try:
        # Verify dataset exists
        df = storage.get_dataset(request.file_id)
        if df is None:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        # Prepare dataset context
        dataset_context = request.dataset_schema.model_dump()
        
        # If path is specified, use task taxonomy
        if request.path:
            print(f"[SUGGEST] Using task taxonomy for path: {request.path}")
            smart_suggestions = task_taxonomy.get_relevant_tasks(
                request.path,
                dataset_context,
                max_tasks=8
            )
        else:
            # Fallback to EDA service for backward compatibility
            eda_service = get_eda_service()
            smart_suggestions = eda_service.get_relevant_suggestions(dataset_context, max_suggestions=8)
        
        # Also get AI-powered suggestions from Gemini as fallback/supplement
        try:
            ai_result = gemini_client.generate_suggestions(dataset_context, request.user_goal)
            ai_suggestions = ai_result.get('suggestions', [])
            assumptions = ai_result.get('assumptions', [])
        except Exception as e:
            print(f"Gemini API error, using rule-based suggestions: {e}")
            ai_suggestions = []
            assumptions = ["Using rule-based intelligent suggestions based on dataset characteristics"]
        
        # Combine smart suggestions with AI suggestions (prefer smart suggestions)
        combined_suggestions = []
        seen_ids = set()
        
        # Add smart suggestions first
        for suggestion in smart_suggestions:
            if suggestion['id'] not in seen_ids:
                combined_suggestions.append(suggestion)
                seen_ids.add(suggestion['id'])
        
        # Add unique AI suggestions with validation
        for suggestion in ai_suggestions:
            if suggestion.get('id') not in seen_ids:
                # Fix invalid category values
                category = suggestion.get('category', 'eda')
                if '|' in category or category not in ['eda', 'cleaning', 'visualization', 'feature_engineering', 'modeling', 'statistical_testing']:
                    # Extract first valid category or default to 'eda'
                    if 'clean' in category.lower():
                        suggestion['category'] = 'cleaning'
                    elif 'visual' in category.lower():
                        suggestion['category'] = 'visualization'
                    elif 'feature' in category.lower():
                        suggestion['category'] = 'feature_engineering'
                    elif 'model' in category.lower() or 'ml' in category.lower():
                        suggestion['category'] = 'modeling'
                    elif 'stat' in category.lower():
                        suggestion['category'] = 'statistical_testing'
                    else:
                        suggestion['category'] = 'eda'
                
                combined_suggestions.append(suggestion)
                seen_ids.add(suggestion.get('id'))
        
        # Parse suggestions with error handling
        suggestions = []
        for s in combined_suggestions[:10]:
            try:
                suggestions.append(TaskSuggestion(**s))
            except Exception as e:
                print(f"Skipping invalid suggestion: {e}")
                continue
        
        return SuggestResponse(
            suggestions=suggestions,
            assumptions=assumptions
        )
    
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"ERROR in suggest: {error_details}")
        raise HTTPException(status_code=500, detail=f"Error generating suggestions: {str(e)}")
