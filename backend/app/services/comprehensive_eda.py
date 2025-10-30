"""
Comprehensive EDA Service
Handles all exploratory data analysis, preprocessing, feature engineering,
statistical analysis, visualization, and machine learning tasks
"""

from typing import Dict, Any, List


class ComprehensiveEDAService:
    """Service for comprehensive data science analysis"""
    
    def __init__(self):
        self.feature_categories = self._initialize_feature_categories()
    
    def _initialize_feature_categories(self) -> Dict[str, List[Dict[str, Any]]]:
        """Initialize all available analysis features organized by category"""
        
        return {
            "exploratory_data_analysis": [
                {
                    "id": "eda_statistical_summary",
                    "title": "Comprehensive Statistical Summary",
                    "description": "Generate mean, median, mode, std, quartiles, min/max for all numeric columns",
                    "estimated_time": "1-2 minutes",
                    "priority": "high"
                },
                {
                    "id": "eda_data_quality",
                    "title": "Data Quality Assessment",
                    "description": "Identify data types, missing values, duplicates, and quality issues",
                    "estimated_time": "1-2 minutes",
                    "priority": "high"
                },
                {
                    "id": "eda_outlier_detection",
                    "title": "Outlier Detection (IQR, Z-score, Isolation Forest)",
                    "description": "Detect outliers using multiple methods with visualizations",
                    "estimated_time": "2-3 minutes",
                    "priority": "medium"
                },
                {
                    "id": "eda_distribution_analysis",
                    "title": "Distribution Analysis",
                    "description": "Analyze distributions (normal, skewed, bimodal) and suggest transformations",
                    "estimated_time": "2-3 minutes",
                    "priority": "medium"
                },
                {
                    "id": "eda_comprehensive_visualization",
                    "title": "Comprehensive Visualizations",
                    "description": "Create histograms, box plots, scatter plots, pair plots, and distribution curves",
                    "estimated_time": "3-4 minutes",
                    "priority": "medium"
                }
            ],
            
            "data_cleaning_preprocessing": [
                {
                    "id": "clean_missing_values",
                    "title": "Handle Missing Values",
                    "description": "Suggest and apply strategies: mean/median imputation, KNN, forward/backward fill",
                    "estimated_time": "2-3 minutes",
                    "priority": "high"
                },
                {
                    "id": "clean_duplicates",
                    "title": "Remove Duplicates",
                    "description": "Identify and remove/flag duplicate records with justification",
                    "estimated_time": "1-2 minutes",
                    "priority": "medium"
                },
                {
                    "id": "clean_outliers",
                    "title": "Treat Outliers",
                    "description": "Cap/floor, remove, or transform outliers based on context",
                    "estimated_time": "2-3 minutes",
                    "priority": "medium"
                },
                {
                    "id": "clean_data_types",
                    "title": "Fix Data Type Inconsistencies",
                    "description": "Handle dates, numerics as strings, categorical encoding",
                    "estimated_time": "2-3 minutes",
                    "priority": "high"
                },
                {
                    "id": "clean_text_standardization",
                    "title": "Standardize Text Fields",
                    "description": "Lowercase, trim whitespace, handle special characters",
                    "estimated_time": "1-2 minutes",
                    "priority": "low"
                }
            ],
            
            "feature_engineering": [
                {
                    "id": "feat_datetime_components",
                    "title": "Create Datetime Features",
                    "description": "Extract year, month, day, hour, day_of_week, is_weekend",
                    "estimated_time": "1-2 minutes",
                    "priority": "medium"
                },
                {
                    "id": "feat_interactions",
                    "title": "Generate Interaction Features",
                    "description": "Create products, ratios, polynomial terms for numeric pairs",
                    "estimated_time": "2-3 minutes",
                    "priority": "medium"
                },
                {
                    "id": "feat_aggregations",
                    "title": "Aggregate Features",
                    "description": "Group-by statistics (mean, sum, count by category)",
                    "estimated_time": "2-3 minutes",
                    "priority": "medium"
                },
                {
                    "id": "feat_binning",
                    "title": "Bin Continuous Variables",
                    "description": "Create meaningful categorical ranges from continuous variables",
                    "estimated_time": "1-2 minutes",
                    "priority": "low"
                },
                {
                    "id": "feat_domain_specific",
                    "title": "Extract Domain-Specific Features",
                    "description": "Create features based on column names and data patterns",
                    "estimated_time": "2-3 minutes",
                    "priority": "medium"
                }
            ],
            
            "data_transformation_encoding": [
                {
                    "id": "transform_scaling",
                    "title": "Normalize/Standardize Features",
                    "description": "Apply StandardScaler, MinMaxScaler, or RobustScaler",
                    "estimated_time": "1-2 minutes",
                    "priority": "medium"
                },
                {
                    "id": "transform_categorical_encoding",
                    "title": "Encode Categorical Variables",
                    "description": "One-hot, label, target, or frequency encoding",
                    "estimated_time": "2-3 minutes",
                    "priority": "high"
                },
                {
                    "id": "transform_skewness",
                    "title": "Transform Skewed Distributions",
                    "description": "Apply log, sqrt, or Box-Cox transformations",
                    "estimated_time": "2-3 minutes",
                    "priority": "medium"
                },
                {
                    "id": "transform_high_cardinality",
                    "title": "Handle High-Cardinality Categoricals",
                    "description": "Dimensionality reduction or group rare categories",
                    "estimated_time": "2-3 minutes",
                    "priority": "medium"
                }
            ],
            
            "statistical_analysis": [
                {
                    "id": "stats_correlation",
                    "title": "Correlation Analysis",
                    "description": "Pearson, Spearman, Kendall correlations with heatmap",
                    "estimated_time": "2-3 minutes",
                    "priority": "high"
                },
                {
                    "id": "stats_hypothesis_testing",
                    "title": "Hypothesis Testing",
                    "description": "t-tests, chi-square, ANOVA for group comparisons",
                    "estimated_time": "2-3 minutes",
                    "priority": "medium"
                },
                {
                    "id": "stats_significance",
                    "title": "Statistical Significance Testing",
                    "description": "P-value interpretation and confidence intervals",
                    "estimated_time": "2-3 minutes",
                    "priority": "medium"
                }
            ],
            
            "data_visualization": [
                {
                    "id": "viz_univariate",
                    "title": "Univariate Analysis",
                    "description": "Histograms, KDE, box plots, violin plots",
                    "estimated_time": "2-3 minutes",
                    "priority": "high"
                },
                {
                    "id": "viz_bivariate",
                    "title": "Bivariate Analysis",
                    "description": "Scatter plots with trend lines, hex bins, joint plots",
                    "estimated_time": "2-3 minutes",
                    "priority": "medium"
                },
                {
                    "id": "viz_multivariate",
                    "title": "Multivariate Visualization",
                    "description": "Correlation heatmaps, pair plots, parallel coordinates",
                    "estimated_time": "3-4 minutes",
                    "priority": "medium"
                },
                {
                    "id": "viz_temporal",
                    "title": "Temporal Analysis",
                    "description": "Time series plots, seasonal decomposition, trends",
                    "estimated_time": "2-3 minutes",
                    "priority": "medium"
                },
                {
                    "id": "viz_categorical",
                    "title": "Categorical Analysis",
                    "description": "Bar charts, count plots, stacked bars, pie charts",
                    "estimated_time": "2-3 minutes",
                    "priority": "medium"
                }
            ],
            
            "feature_selection": [
                {
                    "id": "fs_correlation_based",
                    "title": "Correlation-Based Selection",
                    "description": "Remove highly correlated features (>0.95)",
                    "estimated_time": "1-2 minutes",
                    "priority": "medium"
                },
                {
                    "id": "fs_variance_threshold",
                    "title": "Variance Threshold",
                    "description": "Remove low-variance or zero-variance features",
                    "estimated_time": "1-2 minutes",
                    "priority": "medium"
                },
                {
                    "id": "fs_statistical_tests",
                    "title": "Statistical Tests for Selection",
                    "description": "Chi-square, ANOVA, mutual information",
                    "estimated_time": "2-3 minutes",
                    "priority": "medium"
                },
                {
                    "id": "fs_rfe",
                    "title": "Recursive Feature Elimination",
                    "description": "RFE with cross-validation",
                    "estimated_time": "3-4 minutes",
                    "priority": "low"
                },
                {
                    "id": "fs_tree_based",
                    "title": "Tree-Based Feature Importance",
                    "description": "Random Forest or XGBoost importance",
                    "estimated_time": "2-3 minutes",
                    "priority": "high"
                },
                {
                    "id": "fs_lasso",
                    "title": "L1 Regularization (Lasso)",
                    "description": "Embedded feature selection with Lasso",
                    "estimated_time": "2-3 minutes",
                    "priority": "medium"
                }
            ],
            
            "ml_regression": [
                {
                    "id": "ml_reg_baseline",
                    "title": "Baseline Regression Models",
                    "description": "Linear Regression, Ridge, Lasso, ElasticNet",
                    "estimated_time": "2-3 minutes",
                    "priority": "high"
                },
                {
                    "id": "ml_reg_advanced",
                    "title": "Advanced Regression Models",
                    "description": "Random Forest, XGBoost, LightGBM, CatBoost",
                    "estimated_time": "3-5 minutes",
                    "priority": "high"
                },
                {
                    "id": "ml_reg_tuning",
                    "title": "Hyperparameter Tuning",
                    "description": "GridSearchCV or RandomizedSearchCV with CV",
                    "estimated_time": "5-10 minutes",
                    "priority": "medium"
                },
                {
                    "id": "ml_reg_evaluation",
                    "title": "Regression Evaluation",
                    "description": "RMSE, MAE, R², adjusted R², MAPE, residual analysis",
                    "estimated_time": "2-3 minutes",
                    "priority": "high"
                }
            ],
            
            "ml_classification": [
                {
                    "id": "ml_clf_baseline",
                    "title": "Baseline Classification Models",
                    "description": "Logistic Regression, Naive Bayes, KNN",
                    "estimated_time": "2-3 minutes",
                    "priority": "high"
                },
                {
                    "id": "ml_clf_advanced",
                    "title": "Advanced Classification Models",
                    "description": "Random Forest, Gradient Boosting, SVM",
                    "estimated_time": "3-5 minutes",
                    "priority": "high"
                },
                {
                    "id": "ml_clf_imbalance",
                    "title": "Handle Class Imbalance",
                    "description": "SMOTE, class weights, stratified sampling",
                    "estimated_time": "2-3 minutes",
                    "priority": "medium"
                },
                {
                    "id": "ml_clf_evaluation",
                    "title": "Classification Evaluation",
                    "description": "Accuracy, Precision, Recall, F1, ROC-AUC, confusion matrix",
                    "estimated_time": "2-3 minutes",
                    "priority": "high"
                }
            ],
            
            "ml_clustering": [
                {
                    "id": "ml_clust_kmeans",
                    "title": "K-Means Clustering",
                    "description": "K-Means with elbow method for optimal K",
                    "estimated_time": "2-3 minutes",
                    "priority": "high"
                },
                {
                    "id": "ml_clust_hierarchical",
                    "title": "Hierarchical Clustering",
                    "description": "Hierarchical clustering with dendrogram",
                    "estimated_time": "2-3 minutes",
                    "priority": "medium"
                },
                {
                    "id": "ml_clust_dbscan",
                    "title": "DBSCAN Clustering",
                    "description": "Density-based clustering and outlier detection",
                    "estimated_time": "2-3 minutes",
                    "priority": "medium"
                },
                {
                    "id": "ml_clust_evaluation",
                    "title": "Cluster Validation",
                    "description": "Silhouette score, Davies-Bouldin, Calinski-Harabasz",
                    "estimated_time": "2-3 minutes",
                    "priority": "medium"
                }
            ],
            
            "dimensionality_reduction": [
                {
                    "id": "dim_pca",
                    "title": "PCA Analysis",
                    "description": "Principal Component Analysis with explained variance",
                    "estimated_time": "2-3 minutes",
                    "priority": "high"
                },
                {
                    "id": "dim_tsne",
                    "title": "t-SNE Visualization",
                    "description": "2D/3D visualization of high-dimensional data",
                    "estimated_time": "3-5 minutes",
                    "priority": "medium"
                },
                {
                    "id": "dim_umap",
                    "title": "UMAP Reduction",
                    "description": "Faster, scalable dimensionality reduction",
                    "estimated_time": "2-3 minutes",
                    "priority": "medium"
                }
            ],
            
            "time_series": [
                {
                    "id": "ts_decomposition",
                    "title": "Time Series Decomposition",
                    "description": "Decompose trend, seasonality, and residuals",
                    "estimated_time": "2-3 minutes",
                    "priority": "high"
                },
                {
                    "id": "ts_stationarity",
                    "title": "Stationarity Testing",
                    "description": "ADF test, KPSS test",
                    "estimated_time": "1-2 minutes",
                    "priority": "medium"
                },
                {
                    "id": "ts_autocorrelation",
                    "title": "Autocorrelation Analysis",
                    "description": "ACF/PACF plots",
                    "estimated_time": "2-3 minutes",
                    "priority": "medium"
                },
                {
                    "id": "ts_arima",
                    "title": "ARIMA Forecasting",
                    "description": "ARIMA, SARIMA models",
                    "estimated_time": "3-5 minutes",
                    "priority": "high"
                },
                {
                    "id": "ts_prophet",
                    "title": "Prophet Forecasting",
                    "description": "Facebook Prophet for time series prediction",
                    "estimated_time": "2-4 minutes",
                    "priority": "medium"
                }
            ],
            
            "model_interpretation": [
                {
                    "id": "interp_feature_importance",
                    "title": "Feature Importance Analysis",
                    "description": "Rankings from tree-based models",
                    "estimated_time": "2-3 minutes",
                    "priority": "high"
                },
                {
                    "id": "interp_shap",
                    "title": "SHAP Values Analysis",
                    "description": "Global and local interpretability with SHAP",
                    "estimated_time": "3-5 minutes",
                    "priority": "medium"
                },
                {
                    "id": "interp_pdp",
                    "title": "Partial Dependence Plots",
                    "description": "Show feature effects on predictions",
                    "estimated_time": "2-3 minutes",
                    "priority": "medium"
                }
            ],
            
            "advanced_analytics": [
                {
                    "id": "adv_anomaly_detection",
                    "title": "Anomaly Detection",
                    "description": "Isolation Forest, One-Class SVM, Autoencoders",
                    "estimated_time": "3-5 minutes",
                    "priority": "medium"
                },
                {
                    "id": "adv_ab_testing",
                    "title": "A/B Test Analysis",
                    "description": "Statistical significance and effect size",
                    "estimated_time": "2-3 minutes",
                    "priority": "medium"
                }
            ]
        }
    
    def get_all_features(self) -> List[Dict[str, Any]]:
        """Get all available features flattened"""
        all_features = []
        for category, features in self.feature_categories.items():
            for feature in features:
                feature_copy = feature.copy()
                feature_copy['category'] = category
                all_features.append(feature_copy)
        return all_features
    
    def get_features_by_category(self, category: str) -> List[Dict[str, Any]]:
        """Get features for a specific category"""
        return self.feature_categories.get(category, [])
    
    def get_relevant_suggestions(
        self, 
        dataset_context: Dict[str, Any], 
        max_suggestions: int = 8
    ) -> List[Dict[str, Any]]:
        """
        Get relevant suggestions based on dataset context
        Uses smart logic to suggest most appropriate analyses
        """
        suggestions: List[Dict[str, Any]] = []

        # Map internal categories to Pydantic-allowed literals
        category_map = {
            'exploratory_data_analysis': 'eda',
            'data_cleaning_preprocessing': 'cleaning',
            'data_visualization': 'visualization',
            'feature_engineering': 'feature_engineering',
            'data_transformation_encoding': 'feature_engineering',
            'statistical_analysis': 'statistical_testing',
            'feature_selection': 'feature_engineering',
            'ml_regression': 'modeling',
            'ml_classification': 'modeling',
            'ml_clustering': 'modeling',
            'dimensionality_reduction': 'feature_engineering',
            'time_series': 'modeling',
            'model_interpretation': 'modeling',
            'advanced_analytics': 'modeling',
        }

        has_numeric = any(dtype in ['int64', 'float64']
                          for dtype in dataset_context.get('dtypes', {}).values())
        has_categorical = any(dtype == 'object'
                              for dtype in dataset_context.get('dtypes', {}).values())
        has_datetime = any('date' in col.lower() or 'time' in col.lower()
                           for col in dataset_context.get('columns', []))
        has_missing = any(count > 0
                          for count in dataset_context.get('null_counts', {}).values())
        num_rows = dataset_context.get('shape', [0])[0]
        num_cols = dataset_context.get('shape', [0, 0])[1]

        def add_with_category(source_category: str, features: List[Dict[str, Any]], limit: int = None):
            mapped = category_map.get(source_category, 'eda')
            count = 0
            for feat in features:
                if limit is not None and count >= limit:
                    break
                item = feat.copy()
                item['category'] = mapped
                suggestions.append(item)
                count += 1

        # Always suggest EDA overview (first 2)
        add_with_category('exploratory_data_analysis', self.get_features_by_category('exploratory_data_analysis'), limit=2)

        # Suggest cleaning if missing data
        if has_missing:
            add_with_category('data_cleaning_preprocessing', [self.get_features_by_category('data_cleaning_preprocessing')[0]])

        # Suggest appropriate visualizations
        if has_numeric:
            add_with_category('data_visualization', [self.get_features_by_category('data_visualization')[0]])
            add_with_category('statistical_analysis', [self.get_features_by_category('statistical_analysis')[0]])

        # Suggest time series if datetime columns exist
        if has_datetime and num_rows > 30:
            add_with_category('time_series', [self.get_features_by_category('time_series')[0]])

        # Suggest ML based on dataset size
        if num_rows > 100 and has_numeric:
            add_with_category('ml_regression', [self.get_features_by_category('ml_regression')[0]])
            add_with_category('ml_classification', [self.get_features_by_category('ml_classification')[0]])

        # Suggest clustering for exploration
        if num_rows > 50 and has_numeric:
            add_with_category('ml_clustering', [self.get_features_by_category('ml_clustering')[0]])

        # Return up to max_suggestions
        return suggestions[:max_suggestions]


# Singleton instance
_eda_service = None

def get_eda_service() -> ComprehensiveEDAService:
    """Get or create ComprehensiveEDAService singleton"""
    global _eda_service
    if _eda_service is None:
        _eda_service = ComprehensiveEDAService()
    return _eda_service
