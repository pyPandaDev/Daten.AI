"""
Task Taxonomy Service
Provides structured task recommendations for Data Analysis and Data Science paths
"""
from typing import List, Dict, Any, Literal


class TaskTaxonomy:
    """Manages task definitions and recommendations for different analysis paths"""
    
    def __init__(self):
        self.data_analysis_tasks = self._get_data_analysis_tasks()
        self.data_science_tasks = self._get_data_science_tasks()
    
    def _get_data_analysis_tasks(self) -> List[Dict[str, Any]]:
        """Tasks focused on descriptive, statistical, and visualization"""
        return [
            {
                "id": "data_overview",
                "title": "Dataset Overview & Summary Statistics",
                "description": "Get comprehensive statistics, data types, missing values, and basic info about your dataset",
                "category": "eda",
                "priority": "high",
                "estimated_time": "1-2 min",
                "keywords": ["overview", "summary", "statistics", "info", "describe"]
            },
            {
                "id": "missing_value_analysis",
                "title": "Missing Value Analysis",
                "description": "Identify and visualize missing values across all columns with heatmaps and bar charts",
                "category": "cleaning",
                "priority": "high",
                "estimated_time": "1-2 min",
                "keywords": ["missing", "null", "nan", "incomplete"]
            },
            {
                "id": "correlation_analysis",
                "title": "Correlation Analysis",
                "description": "Analyze relationships between numerical features with correlation matrix and heatmap",
                "category": "eda",
                "priority": "high",
                "estimated_time": "2-3 min",
                "keywords": ["correlation", "relationship", "heatmap", "associations"]
            },
            {
                "id": "distribution_plots",
                "title": "Distribution Analysis",
                "description": "Visualize distributions of numerical features with histograms and density plots",
                "category": "visualization",
                "priority": "high",
                "estimated_time": "2-3 min",
                "keywords": ["distribution", "histogram", "density", "spread"]
            },
            {
                "id": "categorical_analysis",
                "title": "Categorical Variable Analysis",
                "description": "Analyze categorical features with value counts, bar charts, and pie charts",
                "category": "visualization",
                "priority": "medium",
                "estimated_time": "2-3 min",
                "keywords": ["categorical", "counts", "categories", "groups"]
            },
            {
                "id": "outlier_detection",
                "title": "Outlier Detection",
                "description": "Identify outliers using box plots, IQR method, and statistical analysis",
                "category": "eda",
                "priority": "medium",
                "estimated_time": "2-3 min",
                "keywords": ["outlier", "anomaly", "extreme", "unusual"]
            },
            {
                "id": "time_series_analysis",
                "title": "Time Series Analysis",
                "description": "Analyze temporal patterns, trends, and seasonality in time-series data",
                "category": "visualization",
                "priority": "medium",
                "estimated_time": "3-4 min",
                "keywords": ["time", "temporal", "trend", "seasonality", "date"]
            },
            {
                "id": "pairplot_analysis",
                "title": "Feature Pair Plot Analysis",
                "description": "Visualize pairwise relationships between multiple features",
                "category": "visualization",
                "priority": "low",
                "estimated_time": "3-5 min",
                "keywords": ["pairplot", "scatter", "relationships", "matrix"]
            },
            {
                "id": "data_quality_report",
                "title": "Data Quality Report",
                "description": "Comprehensive data quality assessment including duplicates, inconsistencies, and validity",
                "category": "cleaning",
                "priority": "high",
                "estimated_time": "2-3 min",
                "keywords": ["quality", "duplicates", "validation", "clean"]
            },
            {
                "id": "statistical_tests",
                "title": "Statistical Hypothesis Testing",
                "description": "Perform statistical tests like t-tests, chi-square, ANOVA for data validation",
                "category": "statistical_testing",
                "priority": "low",
                "estimated_time": "3-4 min",
                "keywords": ["hypothesis", "test", "significance", "p-value", "statistical"]
            }
        ]
    
    def _get_data_science_tasks(self) -> List[Dict[str, Any]]:
        """Tasks focused on ML, modeling, and predictive analytics"""
        return [
            {
                "id": "data_preprocessing",
                "title": "Data Preprocessing Pipeline",
                "description": "Clean, encode, and prepare data for machine learning with automated preprocessing",
                "category": "cleaning",
                "priority": "high",
                "estimated_time": "2-3 min",
                "keywords": ["preprocessing", "encoding", "scaling", "cleaning", "prepare"]
            },
            {
                "id": "feature_engineering",
                "title": "Feature Engineering & Creation",
                "description": "Create new features, transform existing ones, and generate interaction terms",
                "category": "feature_engineering",
                "priority": "high",
                "estimated_time": "3-4 min",
                "keywords": ["feature", "engineering", "creation", "transformation"]
            },
            {
                "id": "feature_selection",
                "title": "Feature Selection & Importance",
                "description": "Identify most important features using various selection methods",
                "category": "feature_engineering",
                "priority": "high",
                "estimated_time": "2-3 min",
                "keywords": ["feature selection", "importance", "relevant", "reduce"]
            },
            {
                "id": "classification_model",
                "title": "Classification Model Building",
                "description": "Build and evaluate classification models (Random Forest, XGBoost, etc.)",
                "category": "modeling",
                "priority": "high",
                "estimated_time": "4-5 min",
                "keywords": ["classification", "predict", "category", "label", "class"]
            },
            {
                "id": "regression_model",
                "title": "Regression Model Building",
                "description": "Build and evaluate regression models for continuous target prediction",
                "category": "modeling",
                "priority": "high",
                "estimated_time": "4-5 min",
                "keywords": ["regression", "predict", "continuous", "value", "forecast"]
            },
            {
                "id": "clustering_analysis",
                "title": "Clustering & Segmentation",
                "description": "Perform unsupervised clustering to discover patterns and groups in data",
                "category": "modeling",
                "priority": "medium",
                "estimated_time": "3-4 min",
                "keywords": ["clustering", "kmeans", "segmentation", "groups", "unsupervised"]
            },
            {
                "id": "dimensionality_reduction",
                "title": "Dimensionality Reduction (PCA/t-SNE)",
                "description": "Reduce feature space while preserving variance using PCA or t-SNE",
                "category": "feature_engineering",
                "priority": "medium",
                "estimated_time": "3-4 min",
                "keywords": ["pca", "tsne", "dimensionality", "reduction", "compress"]
            },
            {
                "id": "model_comparison",
                "title": "Model Comparison & Selection",
                "description": "Compare multiple ML models and select the best performing one",
                "category": "modeling",
                "priority": "high",
                "estimated_time": "5-6 min",
                "keywords": ["compare", "models", "evaluation", "selection", "benchmark"]
            },
            {
                "id": "hyperparameter_tuning",
                "title": "Hyperparameter Optimization",
                "description": "Optimize model hyperparameters using grid search or random search",
                "category": "modeling",
                "priority": "medium",
                "estimated_time": "5-7 min",
                "keywords": ["hyperparameter", "tuning", "optimization", "grid search"]
            },
            {
                "id": "cross_validation",
                "title": "Cross-Validation & Model Evaluation",
                "description": "Perform k-fold cross-validation and comprehensive model evaluation",
                "category": "modeling",
                "priority": "high",
                "estimated_time": "3-4 min",
                "keywords": ["cross validation", "evaluation", "metrics", "performance"]
            },
            {
                "id": "anomaly_detection",
                "title": "Anomaly Detection",
                "description": "Detect anomalies and outliers using ML techniques like Isolation Forest",
                "category": "modeling",
                "priority": "medium",
                "estimated_time": "3-4 min",
                "keywords": ["anomaly", "outlier", "detection", "isolation forest"]
            },
            {
                "id": "time_series_forecasting",
                "title": "Time Series Forecasting",
                "description": "Build forecasting models for time-series data (ARIMA, Prophet, LSTM)",
                "category": "modeling",
                "priority": "medium",
                "estimated_time": "5-6 min",
                "keywords": ["forecast", "time series", "prediction", "arima", "prophet"]
            }
        ]
    
    def get_tasks_by_path(self, path: Literal["analysis", "datascience"]) -> List[Dict[str, Any]]:
        """Get all tasks for a specific path"""
        if path == "analysis":
            return self.data_analysis_tasks
        elif path == "datascience":
            return self.data_science_tasks
        else:
            return []
    
    def get_relevant_tasks(
        self,
        path: Literal["analysis", "datascience"],
        dataset_context: Dict[str, Any],
        max_tasks: int = 8
    ) -> List[Dict[str, Any]]:
        """
        Get contextually relevant tasks based on dataset characteristics
        """
        tasks = self.get_tasks_by_path(path)
        
        # Score tasks based on relevance
        scored_tasks = []
        for task in tasks:
            score = self._calculate_task_relevance(task, dataset_context, path)
            scored_tasks.append((task, score))
        
        # Sort by score (descending) and return top N
        scored_tasks.sort(key=lambda x: x[1], reverse=True)
        return [task for task, score in scored_tasks[:max_tasks]]
    
    def _calculate_task_relevance(
        self,
        task: Dict[str, Any],
        dataset_context: Dict[str, Any],
        path: str
    ) -> float:
        """
        Calculate how relevant a task is to the given dataset
        Returns a score between 0 and 1
        """
        score = 0.5  # Base score
        
        # Get dataset characteristics
        num_rows = dataset_context.get('shape', [0, 0])[0]
        num_cols = dataset_context.get('shape', [0, 0])[1]
        null_counts = dataset_context.get('null_counts', {})
        dtypes = dataset_context.get('dtypes', {})
        
        # Count different column types
        num_numeric = sum(1 for dtype in dtypes.values() if 'int' in dtype or 'float' in dtype)
        num_categorical = sum(1 for dtype in dtypes.values() if 'object' in dtype or 'category' in dtype)
        has_datetime = any('datetime' in dtype for dtype in dtypes.values())
        has_missing = any(count > 0 for count in null_counts.values())
        missing_percentage = sum(null_counts.values()) / (num_rows * num_cols) if num_rows * num_cols > 0 else 0
        
        # Task-specific relevance scoring
        task_id = task.get('id', '')
        
        # Always relevant tasks
        if task_id in ['data_overview', 'data_quality_report', 'data_preprocessing']:
            score += 0.4
        
        # Missing value tasks
        if task_id in ['missing_value_analysis'] and has_missing:
            score += 0.3 + (missing_percentage * 0.2)
        
        # Correlation tasks (need numeric columns)
        if task_id in ['correlation_analysis', 'pairplot_analysis'] and num_numeric >= 2:
            score += 0.3
        
        # Distribution tasks
        if task_id in ['distribution_plots', 'outlier_detection'] and num_numeric >= 1:
            score += 0.25
        
        # Categorical tasks
        if task_id in ['categorical_analysis'] and num_categorical >= 1:
            score += 0.3
        
        # Time series tasks
        if task_id in ['time_series_analysis', 'time_series_forecasting'] and has_datetime:
            score += 0.4
        
        # Classification/regression tasks (need sufficient rows and target column)
        if task_id in ['classification_model', 'regression_model'] and num_rows >= 100:
            score += 0.2
            if num_cols >= 3:  # Need features + target
                score += 0.2
        
        # Clustering tasks
        if task_id in ['clustering_analysis'] and num_numeric >= 2 and num_rows >= 50:
            score += 0.3
        
        # Feature engineering tasks
        if task_id in ['feature_engineering', 'feature_selection'] and num_cols >= 3:
            score += 0.25
        
        # Dimensionality reduction
        if task_id in ['dimensionality_reduction'] and num_cols >= 5:
            score += 0.3
        
        return min(score, 1.0)  # Cap at 1.0


# Global taxonomy instance
task_taxonomy = TaskTaxonomy()
