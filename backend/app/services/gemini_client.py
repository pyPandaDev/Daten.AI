import os
import json
import time
import random
from typing import Dict, Any, List
import google.generativeai as genai

class GeminiClient:
    """Client for interacting with Google Gemini API"""
    
    def __init__(self):
        api_keys_str = os.getenv("GEMINI_API_KEY")
        if not api_keys_str:
            raise ValueError("GEMINI_API_KEY environment variable not set")
        
        # Support multiple API keys separated by commas for rotation
        self.api_keys = [key.strip() for key in api_keys_str.split(',') if key.strip()]
        if not self.api_keys:
            raise ValueError("No valid API keys found in GEMINI_API_KEY")
        
        # Use first key initially
        self.current_key_index = 0
        genai.configure(api_key=self.api_keys[self.current_key_index])
        model_name = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-exp")
        
        self.model = genai.GenerativeModel(
            model_name=model_name,
            generation_config={
                "temperature": 0.7,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 8192,
            }
        )
        self.max_retries = 3
        self.retry_delay = 1
    
    def _rotate_api_key(self):
        """Rotate to the next API key in the list"""
        if len(self.api_keys) > 1:
            self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
            genai.configure(api_key=self.api_keys[self.current_key_index])
            print(f"[GEMINI] Rotated to API key {self.current_key_index + 1}/{len(self.api_keys)}")
            return True
        return False
    
    def generate_suggestions(self, dataset_context: Dict[str, Any], user_goal: str = None) -> Dict[str, Any]:
        """Generate task suggestions based on dataset context"""
        
        prompt = self._build_suggestion_prompt(dataset_context, user_goal)
        
        for attempt in range(self.max_retries):
            try:
                response = self.model.generate_content(prompt)
                result = self._parse_json_response(response.text)
                return result
            except Exception as e:
                error_str = str(e)
                print(f"Error generating suggestions (attempt {attempt + 1}/{self.max_retries}): {e}")
                
                # Check if it's a quota or invalid API key error
                if "429" in error_str or "quota" in error_str.lower() or "API_KEY_INVALID" in error_str:
                    if self._rotate_api_key():
                        print(f"[GEMINI] Retrying with rotated API key...")
                        continue
                
                if attempt < self.max_retries - 1:
                    time.sleep(self.retry_delay * (attempt + 1))
                else:
                    return self._get_fallback_suggestions()
    
    def generate_execution_plan(self, dataset_context: Dict[str, Any], task: Dict[str, Any]) -> Dict[str, Any]:
        """Generate execution plan and Python code for a task"""
        
        prompt = self._build_execution_prompt(dataset_context, task)
        
        for attempt in range(self.max_retries):
            try:
                response = self.model.generate_content(prompt)
                result = self._parse_json_response(response.text)
                return result
            except Exception as e:
                error_str = str(e)
                print(f"Error generating execution plan (attempt {attempt + 1}/{self.max_retries}): {e}")
                
                # Check if it's a quota or invalid API key error
                if "429" in error_str or "quota" in error_str.lower() or "API_KEY_INVALID" in error_str:
                    if self._rotate_api_key():
                        print(f"[GEMINI] Retrying with rotated API key...")
                        continue
                
                if attempt < self.max_retries - 1:
                    time.sleep(self.retry_delay * (attempt + 1))
                else:
                    raise Exception(f"Failed to generate execution plan after {self.max_retries} attempts: {str(e)}")
    
    def _build_suggestion_prompt(self, dataset_context: Dict[str, Any], user_goal: str = None) -> str:
        """Build prompt for task suggestions"""
        
        goal_text = f"\nUser Goal: {user_goal}" if user_goal else ""
        
        prompt = f"""You are an expert data scientist. Create CONCISE, FOCUSED code for this SPECIFIC task.

Dataset: {dataset_context.get('shape', [0, 0])[0]} rows, {dataset_context.get('shape', [0, 0])[1]} columns
Columns: {', '.join(dataset_context.get('columns', [])[:10])}

Task: Suggest 5-8 actionable tasks for analysis.

IMPORTANT: Keep response SHORT and focused ONLY on this task.

Generate a JSON response with the following structure:
{{
  "suggestions": [
    {{
      "id": "unique_id",
      "title": "Short task title",
      "description": "Brief description of what this task does",
      "category": "eda|cleaning|visualization|feature_engineering|modeling|statistical_testing",
      "estimated_time": "2-3 minutes",
      "priority": "high|medium|low"
    }}
  ],
  "assumptions": ["List any assumptions about the data"]
}}

Focus on practical, executable tasks across different categories. Return ONLY valid JSON, no additional text."""

        return prompt
    
    def _build_execution_prompt(self, dataset_context: Dict[str, Any], task: Dict[str, Any]) -> str:
        """Build prompt for execution plan and code generation"""
        
        system_prompt = """Role: You are a data science copilot that generates executable Python code for data analysis.

CRITICAL - The execution environment has these pre-imported modules ALREADY AVAILABLE:
- pandas as pd
- numpy as np
- matplotlib.pyplot as plt
- seaborn as sns
- sklearn (scikit-learn)
- scipy
- io
- base64

DO NOT import these again - they are ALREADY imported!

The DataFrame 'df' is ALREADY LOADED and AVAILABLE with the user's data.

Rules:
1. DataFrame 'df' exists, imports done (pandas, numpy, matplotlib, seaborn)
2. Check data types first: df.select_dtypes(include=['number']) for numeric
3. Output format: PLOT_BASE64, TABLE_START/END, METRIC
4. Keep code under 100 lines
5. Focus ONLY on the requested task
6. MATPLOTLIB CRITICAL: DO NOT use 'ha', 'va' parameters in tick_params() - they are INVALID
   - For text alignment, use ax.set_xticklabels() or ax.set_yticklabels() instead
   - Use rotation=45 in tick_params for label rotation
   - Example: ax.tick_params(axis='x', rotation=45) - valid
   - Example: ax.tick_params(ha='center') - INVALID, will cause error
7. Avoid recursion errors: do not use deep nesting or circular references"""

        # Build comprehensive dataset context
        context_parts = [
            f"Columns: {', '.join(dataset_context['columns'])}",
            f"Data Types: {json.dumps(dataset_context['dtypes'], indent=2)}",
            f"Shape: {dataset_context['shape']} (rows x columns)",
            f"Sample Data (first 10 rows): {json.dumps(dataset_context['sample_rows'], indent=2)}"
        ]
        
        # Add summary statistics if available
        if 'summary_stats' in dataset_context and dataset_context['summary_stats']:
            context_parts.append(f"Numerical Summary Statistics: {json.dumps(dataset_context['summary_stats'], indent=2)}")
        
        # Add categorical information if available
        if 'categorical_info' in dataset_context and dataset_context['categorical_info']:
            context_parts.append(f"Categorical Columns Info: {json.dumps(dataset_context['categorical_info'], indent=2)}")
        
        dataset_context_str = "\n".join([f"- {part}" for part in context_parts])
        
        prompt = f"""{system_prompt}

Dataset Context (READ CAREFULLY - Use these EXACT column names in your code):
{dataset_context_str}

CRITICAL: Use the ACTUAL column names listed above. DO NOT use generic names like 'column_name'.
Example: If columns are ['age', 'salary', 'name'], use df['age'], df['salary'], df['name']
The summary statistics and categorical info above will help you write more accurate and meaningful code.

Task:
- Title: {task['title']}
- Description: {task.get('description', '')}
- Parameters: {json.dumps(task.get('parameters', {}), indent=2)}

Generate a JSON response with the following structure:
{{
  "plan": ["Step 1", "Step 2", "..."],
  "assumptions": ["Assumption 1 if any"],
  "python_code": "complete executable Python script as a string",
  "summary": "3-6 sentence executive summary",
  "followups": ["Suggested next task 1", "Suggested next task 2"]
}}

IMPORTANT CODE PATTERNS:

1. The python_code must be complete and executable with df already defined
2. DO NOT import pandas, numpy, matplotlib, seaborn - they are ALREADY imported!
3. For plots, use EXACTLY this pattern:
```python
# NOTE: plt, io, base64 are ALREADY imported - do NOT import again!

# STEP 1: ALWAYS identify column types first
numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()

# STEP 2: Create plot based on available columns
fig, ax = plt.subplots(figsize=(10, 6))

# For boxplot - MUST check numeric columns exist
if numeric_cols and len(numeric_cols) > 0:
    df[numeric_cols].boxplot(ax=ax)
    ax.set_title("Distribution of Numeric Columns")
else:
    # Alternative: bar chart for categorical data
    if categorical_cols:
        df[categorical_cols[0]].value_counts().head(10).plot(kind='bar', ax=ax)
        ax.set_title("Distribution of Categorical Column")

ax.set_xlabel("Variables")
ax.set_ylabel("Values")

# Convert to base64 - CRITICAL: define plot_base64 here
buf = io.BytesIO()
fig.savefig(buf, format='png', dpi=100, bbox_inches='tight')
buf.seek(0)
plot_base64 = base64.b64encode(buf.read()).decode('utf-8')
plt.close(fig)

# Print the plot - CRITICAL: must use this exact format
print(f"PLOT_BASE64:{{{{plot_base64}}}}")
```

4. For tables, print in a parseable format:
```python
print("TABLE_START:table_name")
print(df.head().to_json(orient='records'))
print("TABLE_END")
```

5. For metrics, print in this format:
```python
# CRITICAL: Use single braces in f-strings for variable evaluation!
# Example: Calculate a metric first, then print it
total_rows = len(df)
print(f"METRIC:Total Rows:{{total_rows}}")

# Another example
mean_value = df['column_name'].mean()
print(f"METRIC:Mean Value:{{mean_value}}")

# DO NOT use double braces {{{{variable}}}} - that will print literal text!
# CORRECT: print(f"METRIC:Name:{{variable}}")
# WRONG: print(f"METRIC:Name:{{{{variable}}}}")  # This prints {{variable}} literally
```

Return ONLY valid JSON, no additional text."""

        return prompt
    
    def _parse_json_response(self, response_text: str) -> Dict[str, Any]:
        """Parse JSON from response text with robust error handling"""
        # Try to extract JSON from markdown code blocks
        if "```json" in response_text:
            start = response_text.find("```json") + 7
            end = response_text.find("```", start)
            if end != -1:
                response_text = response_text[start:end].strip()
        elif "```" in response_text:
            start = response_text.find("```") + 3
            end = response_text.find("```", start)
            if end != -1:
                response_text = response_text[start:end].strip()
        
        # Try to parse JSON
        try:
            return json.loads(response_text)
        except json.JSONDecodeError as e:
            print(f"[GEMINI] JSON parse error: {e}")
            print(f"[GEMINI] Response text (first 500 chars): {response_text[:500]}")
            
            # Try to fix common JSON issues
            try:
                # Remove trailing commas
                fixed_text = response_text.replace(',]', ']').replace(',}', '}')
                # Try parsing again
                return json.loads(fixed_text)
            except:
                pass
            
            # Last resort: return error
            print(f"[GEMINI] Could not extract valid code from response")
            return {
                'plan': ['Parse AI response'],
                'assumptions': ['AI response format issue'],
                'python_code': '# Error: Could not parse AI response. Please try again.',
                'summary': 'Failed to parse AI response. The response may have been too long or contained formatting errors.',
                'followups': ['Try running the analysis again', 'Check your GEMINI_API_KEY']
            }
    
    def _get_fallback_suggestions(self) -> Dict[str, Any]:
        """Return fallback suggestions if API fails"""
        return {
            "suggestions": [
                {
                    "id": "eda_overview",
                    "title": "Exploratory Data Analysis Overview",
                    "description": "Get basic statistics, data types, and distribution of all columns",
                    "category": "eda",
                    "estimated_time": "1-2 minutes",
                    "priority": "high"
                },
                {
                    "id": "missing_data",
                    "title": "Analyze Missing Data",
                    "description": "Identify and visualize missing values across all columns",
                    "category": "cleaning",
                    "estimated_time": "2-3 minutes",
                    "priority": "high"
                },
                {
                    "id": "correlation_analysis",
                    "title": "Correlation Analysis",
                    "description": "Compute and visualize correlations between numeric variables",
                    "category": "eda",
                    "estimated_time": "2-3 minutes",
                    "priority": "medium"
                }
            ],
            "assumptions": ["Dataset is suitable for analysis", "Data is properly formatted"]
        }

# Global client instance
gemini_client = GeminiClient()
