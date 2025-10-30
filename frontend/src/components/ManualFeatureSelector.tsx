import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, BarChart3, Search, Wrench, Shield, 
  TrendingUp, Brain, Download, ChevronDown, ChevronUp,
  Play, Sparkles, Activity, Code
} from 'lucide-react';
import { DatasetSchema } from '../services/api';

interface Feature {
  id: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  params?: FeatureParam[];
}

interface FeatureParam {
  name: string;
  type: 'select' | 'number' | 'text' | 'checkbox' | 'multiselect';
  label: string;
  options?: string[];
  default?: any;
  required?: boolean;
}

interface ManualFeatureSelectorProps {
  onExecuteFeature: (feature: Feature, params: any) => void;
  onExecuteMultiple: (features: Array<{ feature: Feature; params: any }>) => void;
  isExecuting: boolean;
  selectedPath: 'analysis' | 'datascience';
  fileId: string;
  datasetSchema: DatasetSchema;
}

const ManualFeatureSelector: React.FC<ManualFeatureSelectorProps> = ({ 
  onExecuteFeature, 
  onExecuteMultiple,
  isExecuting,
  selectedPath,
  fileId,
  datasetSchema
}) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('preview');
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [featureParams, setFeatureParams] = useState<any>({});
  const [selectedFeatures, setSelectedFeatures] = useState<Array<{ feature: Feature; params: any }>>([]);
  const [multiSelectMode, setMultiSelectMode] = useState(true); // Default to multi-select


  const featureCategories = [
    {
      id: 'preview',
      name: '📂 Data Preview & Summary',
      icon: FileText,
      color: 'blue',
      pathType: 'analysis', // Data Analysis feature
      features: [
        { 
          id: 'head_tail', 
          name: 'Head & Tail', 
          description: 'Show first and last rows of the dataset',
          params: [
            { name: 'n_rows', type: 'number', label: 'Number of rows', default: 5, required: true }
          ]
        },
        { id: 'shape', name: 'Dataset Shape', description: 'Display rows & columns count' },
        { id: 'missing_values', name: 'Missing Values Analysis', description: 'Count & percentage of missing values' },
        { id: 'duplicate_rows', name: 'Duplicate Rows', description: 'Count duplicates with removal option',
          params: [
            { name: 'action', type: 'select', label: 'Action', options: ['Count Only', 'Remove Duplicates'], default: 'Count Only' }
          ]
        },
        { id: 'datatype_info', name: 'Data Type Info', description: 'Column types & conversion suggestions' },
        { id: 'memory_usage', name: 'Memory Usage', description: 'Dataset memory analysis' },
      ]
    },
    {
      id: 'visualization',
      name: '📊 Data Visualization',
      icon: BarChart3,
      color: 'purple',
      pathType: 'analysis', // Data Analysis feature
      features: [
        { 
          id: 'histogram', 
          name: 'Histogram', 
          description: 'Distribution of numeric columns',
          params: [
            { name: 'column', type: 'text', label: 'Column Name', required: true },
            { name: 'bins', type: 'number', label: 'Number of Bins', default: 30 }
          ]
        },
        { 
          id: 'kde_plot', 
          name: 'KDE Plot', 
          description: 'Kernel Density Estimation plot',
          params: [
            { name: 'column', type: 'text', label: 'Column Name', required: true }
          ]
        },
        { 
          id: 'pie_chart', 
          name: 'Pie Chart', 
          description: 'Categorical distribution',
          params: [
            { name: 'column', type: 'text', label: 'Column Name', required: true }
          ]
        },
        { 
          id: 'scatter_plot', 
          name: 'Scatter Plot', 
          description: 'Relationship between two variables',
          params: [
            { name: 'x_column', type: 'text', label: 'X-axis Column', required: true },
            { name: 'y_column', type: 'text', label: 'Y-axis Column', required: true }
          ]
        },
        { 
          id: 'box_plot', 
          name: 'Box Plot', 
          description: 'Distribution and outliers',
          params: [
            { name: 'column', type: 'text', label: 'Column Name', required: true }
          ]
        },
        { 
          id: 'bar_chart', 
          name: 'Bar Chart', 
          description: 'Categorical comparison',
          params: [
            { name: 'column', type: 'text', label: 'Column Name', required: true }
          ]
        },
        { id: 'heatmap', name: 'Correlation Heatmap', description: 'Correlation matrix visualization' },
        { id: 'pairplot', name: 'Pair Plot', description: 'Multivariate relationships' },
        { 
          id: 'time_series', 
          name: 'Time Series Chart', 
          description: 'Trend analysis over time',
          params: [
            { name: 'date_column', type: 'text', label: 'Date Column', required: true },
            { name: 'value_column', type: 'text', label: 'Value Column', required: true }
          ]
        },
      ]
    },
    {
      id: 'eda',
      name: '🔎 Exploratory Data Analysis',
      icon: Search,
      color: 'green',
      pathType: 'analysis', // Data Analysis feature
      features: [
        { id: 'correlation_matrix', name: 'Correlation Matrix', description: 'Identify relationships between variables' },
        { 
          id: 'outlier_detection', 
          name: 'Outlier Detection', 
          description: 'Z-score, IQR, and boxplot analysis',
          params: [
            { name: 'method', type: 'select', label: 'Method', options: ['Z-Score', 'IQR', 'Both'], default: 'IQR' },
            { name: 'threshold', type: 'number', label: 'Threshold', default: 3 }
          ]
        },
        { id: 'distribution_analysis', name: 'Distribution Analysis', description: 'Normality, skewness, kurtosis' },
        { id: 'categorical_summary', name: 'Categorical Summary', description: 'Frequency tables for categorical columns' },
        { id: 'numeric_summary', name: 'Numeric Summary', description: 'Mean, median, std, min, max statistics' },
      ]
    },
    {
      id: 'cleaning',
      name: '🧹 Cleaning & Transformation',
      icon: Wrench,
      color: 'orange',
      pathType: 'datascience', // Data Science feature
      features: [
        { 
          id: 'handle_missing', 
          name: 'Handle Missing Values', 
          description: 'Fill with mean/median/mode or drop',
          params: [
            { name: 'strategy', type: 'select', label: 'Strategy', options: ['Mean', 'Median', 'Mode', 'Drop Rows', 'Drop Columns'], default: 'Mean', required: true },
            { name: 'columns', type: 'text', label: 'Columns (comma-separated, leave empty for all)' }
          ]
        },
        { id: 'remove_duplicates', name: 'Remove Duplicates', description: 'Remove duplicate rows from dataset' },
        { 
          id: 'convert_datatype', 
          name: 'Convert Data Type', 
          description: 'Convert column types',
          params: [
            { name: 'column', type: 'text', label: 'Column Name', required: true },
            { name: 'target_type', type: 'select', label: 'Target Type', options: ['int', 'float', 'string', 'datetime'], required: true }
          ]
        },
        { 
          id: 'handle_outliers', 
          name: 'Handle Outliers', 
          description: 'Remove or clip outliers',
          params: [
            { name: 'method', type: 'select', label: 'Method', options: ['Remove', 'Clip', 'Cap'], default: 'Clip' },
            { name: 'columns', type: 'text', label: 'Columns (comma-separated)' }
          ]
        },
        { 
          id: 'rename_columns', 
          name: 'Rename Columns', 
          description: 'Rename dataset columns',
          params: [
            { name: 'mapping', type: 'text', label: 'Mapping (old:new, old2:new2)', required: true }
          ]
        },
        { 
          id: 'drop_columns', 
          name: 'Drop Columns', 
          description: 'Remove columns from dataset',
          params: [
            { name: 'columns', type: 'text', label: 'Columns to drop (comma-separated)', required: true }
          ]
        },
        { 
          id: 'string_cleaning', 
          name: 'String Cleaning', 
          description: 'Trim, lowercase, remove symbols',
          params: [
            { name: 'column', type: 'text', label: 'Column Name', required: true },
            { name: 'operations', type: 'multiselect', label: 'Operations', options: ['Trim', 'Lowercase', 'Uppercase', 'Remove Special Chars'] }
          ]
        },
        { 
          id: 'date_processing', 
          name: 'Date Processing', 
          description: 'Extract year, month, day, weekday',
          params: [
            { name: 'column', type: 'text', label: 'Date Column', required: true },
            { name: 'extract', type: 'multiselect', label: 'Extract', options: ['Year', 'Month', 'Day', 'Weekday', 'Quarter'] }
          ]
        },
        { 
          id: 'feature_creation', 
          name: 'Create New Feature', 
          description: 'Create columns from existing ones',
          params: [
            { name: 'new_column', type: 'text', label: 'New Column Name', required: true },
            { name: 'formula', type: 'text', label: 'Formula (e.g., col1 + col2)', required: true }
          ]
        },
      ]
    },
    {
      id: 'quality',
      name: '🧐 Data Quality Check',
      icon: Shield,
      color: 'red',
      pathType: 'datascience', // Data Science feature
      features: [
        { id: 'detect_anomalies', name: 'Detect Anomalies', description: 'Identify noise and unusual patterns' },
        { id: 'inconsistent_entries', name: 'Inconsistent Entries', description: 'Detect format differences' },
        { 
          id: 'validate_rules', 
          name: 'Validate Data Rules', 
          description: 'Check for invalid data (age < 0, etc.)',
          params: [
            { name: 'rules', type: 'text', label: 'Rules (e.g., age > 0, price >= 0)', required: true }
          ]
        },
        { id: 'unique_check', name: 'Unique ID Validation', description: 'Check for unique constraints' },
      ]
    },
    {
      id: 'ml',
      name: '🤖 Machine Learning',
      icon: Brain,
      color: 'indigo',
      pathType: 'datascience', // Data Science feature
      features: [
        { 
          id: 'feature_engineering', 
          name: 'Feature Engineering', 
          description: 'Create and select optimal features',
          params: [
            { name: 'method', type: 'select', label: 'Method', options: ['Auto', 'Manual Selection', 'PCA', 'Feature Importance'], default: 'Auto' }
          ]
        },
        { 
          id: 'train_model', 
          name: 'Train ML Model', 
          description: 'Build supervised/unsupervised models',
          params: [
            { name: 'model_type', type: 'select', label: 'Model Type', options: ['Regression', 'Classification', 'Clustering'], required: true },
            { name: 'target_column', type: 'text', label: 'Target Column (for supervised)', required: false }
          ]
        },
        { 
          id: 'model_evaluation', 
          name: 'Model Evaluation', 
          description: 'Evaluate model performance with metrics',
        },
        { 
          id: 'hyperparameter_tuning', 
          name: 'Hyperparameter Tuning', 
          description: 'Optimize model parameters',
          params: [
            { name: 'method', type: 'select', label: 'Method', options: ['Grid Search', 'Random Search', 'Bayesian Optimization'], default: 'Grid Search' }
          ]
        },
        { id: 'prediction', name: 'Make Predictions', description: 'Generate predictions on new data' },
      ]
    },
    {
      id: 'statistical',
      name: '⚡ Statistical Insights',
      icon: TrendingUp,
      color: 'pink',
      pathType: 'datascience', // Data Science feature
      features: [
        { 
          id: 'correlation_test', 
          name: 'Correlation Test', 
          description: 'Pearson, Spearman correlation',
          params: [
            { name: 'method', type: 'select', label: 'Method', options: ['Pearson', 'Spearman', 'Kendall'], default: 'Pearson' }
          ]
        },
        { 
          id: 'hypothesis_test', 
          name: 'Hypothesis Testing', 
          description: 't-test, chi-square test',
          params: [
            { name: 'test_type', type: 'select', label: 'Test Type', options: ['t-test', 'chi-square', 'ANOVA'], required: true }
          ]
        },
        { id: 'confidence_intervals', name: 'Confidence Intervals', description: 'Calculate mean confidence intervals' },
        { id: 'anova_test', name: 'ANOVA Test', description: 'Multi-group difference test' },
      ]
    },
    {
      id: 'ai',
      name: '✨ AI-Powered Features',
      icon: Sparkles,
      color: 'purple',
      pathType: 'both', // Available for both paths
      features: [
        { 
          id: 'ask_question', 
          name: 'Ask Dataset Question', 
          description: 'Chat-style Q&A about your data',
          params: [
            { name: 'question', type: 'text', label: 'Your Question', required: true }
          ]
        },
        { id: 'explain_trends', name: 'Explain Trends', description: 'AI explains patterns and anomalies' },
        { id: 'auto_insights', name: 'Auto-Generate Insights', description: 'Comprehensive insights summary' },
        { id: 'keyword_insights', name: 'Keyword Insights', description: 'Top features and patterns' },
        { id: 'suggest_viz', name: 'Suggest Visualizations', description: 'AI recommends best charts' },
        { id: 'insights_report', name: 'Generate Insights Report', description: 'PDF report with all insights' },
      ]
    },
    {
      id: 'advanced',
      name: '💡 Advanced Features',
      icon: Code,
      color: 'teal',
      pathType: 'both', // Available for both paths
      features: [
        { id: 'pivot_table', name: 'Pivot Table', description: 'Interactive pivot table builder' },
        { 
          id: 'groupby', 
          name: 'GroupBy Explorer', 
          description: 'Group statistics with charts',
          params: [
            { name: 'group_column', type: 'text', label: 'Group By Column', required: true },
            { name: 'agg_column', type: 'text', label: 'Aggregate Column', required: true },
            { name: 'agg_func', type: 'select', label: 'Function', options: ['sum', 'mean', 'count', 'min', 'max'], default: 'mean' }
          ]
        },
        { 
          id: 'sql_query', 
          name: 'SQL Query Mode', 
          description: 'Query dataset using SQL',
          params: [
            { name: 'query', type: 'text', label: 'SQL Query', required: true }
          ]
        },
        { id: 'notebook_mode', name: 'Notebook Mode', description: 'Inline code + output execution' },
        { 
          id: 'nl_chart', 
          name: 'Natural Language Chart', 
          description: 'Create charts from text (e.g., "Plot sales by month")',
          params: [
            { name: 'prompt', type: 'text', label: 'Chart Description', required: true }
          ]
        },
        { 
          id: 'custom_formula', 
          name: 'Custom Formula Builder', 
          description: 'Excel-style formula input',
          params: [
            { name: 'formula', type: 'text', label: 'Formula', required: true }
          ]
        },
      ]
    },
    {
      id: 'export',
      name: '📁 Export & Sharing',
      icon: Download,
      color: 'gray',
      pathType: 'both', // Available for both paths
      features: [
        { 
          id: 'export_cleaned', 
          name: 'Export Cleaned Dataset', 
          description: 'Download as CSV or Excel',
          params: [
            { name: 'format', type: 'select', label: 'Format', options: ['CSV', 'Excel', 'JSON'], default: 'CSV' }
          ]
        },
        { 
          id: 'export_report', 
          name: 'Export Analysis Report', 
          description: 'Download as PDF or HTML',
          params: [
            { name: 'format', type: 'select', label: 'Format', options: ['PDF', 'HTML'], default: 'PDF' }
          ]
        },
        { id: 'copy_insights', name: 'Copy Insights', description: 'One-click copy to clipboard' },
        { id: 'share_session', name: 'Share Session', description: 'Generate shareable link' },
      ]
    },
  ];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleFeatureSelect = (feature: Feature, category: string) => {
    if (multiSelectMode) {
      // Check if already selected
      const isAlreadySelected = selectedFeatures.some(sf => sf.feature.id === feature.id);
      if (isAlreadySelected) {
        setSelectedFeatures(selectedFeatures.filter(sf => sf.feature.id !== feature.id));
      } else {
        // Add to selected features with default params
        const defaultParams: any = {};
        feature.params?.forEach(param => {
          if (param.default !== undefined) {
            defaultParams[param.name] = param.default;
          }
        });
        setSelectedFeatures([...selectedFeatures, { feature: { ...feature, category }, params: defaultParams }]);
      }
    } else {
      setSelectedFeature({ ...feature, category });
      setFeatureParams({});
    }
  };

  const handleParamChange = (paramName: string, value: any) => {
    setFeatureParams({ ...featureParams, [paramName]: value });
  };

  const handleExecute = () => {
    if (selectedFeature) {
      onExecuteFeature(selectedFeature, featureParams);
    }
  };

  const handleExecuteMultiple = () => {
    if (selectedFeatures.length > 0) {
      onExecuteMultiple(selectedFeatures);
    }
  };

  const isFeatureSelected = (featureId: string) => {
    return selectedFeatures.some(sf => sf.feature.id === featureId);
  };


  const getCategoryColor = (color: string) => {
    const colors: any = {
      blue: 'from-blue-500 to-blue-600',
      purple: 'from-purple-500 to-purple-600',
      green: 'from-green-500 to-green-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600',
      indigo: 'from-indigo-500 to-indigo-600',
      pink: 'from-pink-500 to-pink-600',
      teal: 'from-teal-500 to-teal-600',
      gray: 'from-gray-500 to-gray-600',
    };
    return colors[color] || colors.blue;
  };

  // Filter categories based on selected path
  const filteredCategories = featureCategories.filter(category => {
    const pathType = (category as any).pathType;
    if (!pathType) return true; // If no pathType specified, show it
    if (pathType === 'both') return true; // Show for both paths
    return pathType === selectedPath; // Show only if matches selected path
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Feature Categories List */}
      <div className="lg:col-span-2 space-y-3">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Manual Mode - Select Features</h2>
            <p className="text-sm text-gray-600 mt-1">
              {selectedPath === 'analysis' 
                ? 'Select from comprehensive data analysis features including visualization, EDA, and statistical insights' 
                : 'Select from advanced data science features including ML workflows, feature engineering, and model building'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setMultiSelectMode(!multiSelectMode);
                if (!multiSelectMode) {
                  setSelectedFeatures([]);
                  setSelectedFeature(null);
                }
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                multiSelectMode
                  ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400'
              }`}
            >
              {multiSelectMode ? 'Multi Select' : 'Single Select'}
            </button>
            {multiSelectMode && selectedFeatures.length > 0 && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 border border-blue-300 rounded-lg">
                <span className="text-sm font-semibold text-blue-700">
                  {selectedFeatures.length} selected
                </span>
              </div>
            )}
          </div>
        </div>


        {filteredCategories.map((category) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.id)}
              className={`w-full px-5 py-4 flex items-center justify-between bg-gradient-to-r ${getCategoryColor(category.color)} text-white hover:opacity-90 transition-opacity`}
            >
              <div className="flex items-center space-x-3">
                <category.icon className="h-5 w-5" />
                <span className="font-bold text-lg">{category.name}</span>
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-semibold">
                  {category.features.length}
                </span>
              </div>
              {expandedCategory === category.id ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>

            {/* Features List */}
            {expandedCategory === category.id && (
              <div className="p-4 space-y-2 bg-gray-50">
                {category.features.map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => handleFeatureSelect(feature as Feature, category.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                      multiSelectMode && isFeatureSelected(feature.id)
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : selectedFeature?.id === feature.id
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {multiSelectMode && (
                        <div className="flex-shrink-0 mt-0.5">
                          <div className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all ${
                            isFeatureSelected(feature.id)
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300 bg-white'
                          }`}>
                            {isFeatureSelected(feature.id) && (
                              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{feature.name}</h4>
                        <p className="text-xs text-gray-600 mt-0.5">{feature.description}</p>
                      </div>
                      {!multiSelectMode && selectedFeature?.id === feature.id && (
                        <div className="ml-3 h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Play className="h-3 w-3 text-white fill-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Feature Configuration Panel */}
      <div className="lg:col-span-1">
        <div className="sticky top-24">
          {multiSelectMode && selectedFeatures.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl border border-gray-200 shadow-lg p-6"
            >
              <div className="flex items-start space-x-3 mb-4">
                <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">Selected Features</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedFeatures.length} feature{selectedFeatures.length > 1 ? 's' : ''} ready to execute</p>
                </div>
              </div>

              {/* Selected Features List */}
              <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
                {selectedFeatures.map((sf, idx) => (
                  <div key={sf.feature.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="flex-shrink-0 h-6 w-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{sf.feature.name}</p>
                        <p className="text-xs text-gray-600 truncate">{sf.feature.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedFeatures(selectedFeatures.filter(f => f.feature.id !== sf.feature.id))}
                      className="ml-2 h-7 w-7 bg-white hover:bg-red-50 border border-gray-300 hover:border-red-300 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                    >
                      <span className="text-gray-600 hover:text-red-600 text-sm font-bold">×</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Execute All Button */}
              <button
                onClick={handleExecuteMultiple}
                disabled={isExecuting}
                className="w-full px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isExecuting ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Executing...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    <span>Execute {selectedFeatures.length} Feature{selectedFeatures.length > 1 ? 's' : ''}</span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                AI will generate insights for each selected feature
              </p>
            </motion.div>
          ) : selectedFeature ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl border-2 border-blue-200 shadow-lg p-6"
            >
              <div className="flex items-start space-x-3 mb-4">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">{selectedFeature.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedFeature.description}</p>
                </div>
              </div>

              {/* Parameters */}
              {selectedFeature.params && selectedFeature.params.length > 0 && (
                <div className="space-y-4 mb-6">
                  <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Configuration</h4>
                  {selectedFeature.params.map((param) => (
                    <div key={param.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {param.label}
                        {param.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      
                      {param.type === 'select' && (
                        <select
                          value={featureParams[param.name] || param.default || ''}
                          onChange={(e) => handleParamChange(param.name, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {param.options?.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      )}

                      {param.type === 'number' && (
                        <input
                          type="number"
                          value={featureParams[param.name] || param.default || ''}
                          onChange={(e) => handleParamChange(param.name, parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      )}

                      {param.type === 'text' && (
                        <input
                          type="text"
                          value={featureParams[param.name] || ''}
                          onChange={(e) => handleParamChange(param.name, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={param.label}
                        />
                      )}

                      {param.type === 'multiselect' && (
                        <div className="space-y-2">
                          {param.options?.map((option) => (
                            <label key={option} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={(featureParams[param.name] || []).includes(option)}
                                onChange={(e) => {
                                  const current = featureParams[param.name] || [];
                                  const updated = e.target.checked
                                    ? [...current, option]
                                    : current.filter((v: string) => v !== option);
                                  handleParamChange(param.name, updated);
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Execute Button */}
              <button
                onClick={handleExecute}
                disabled={isExecuting}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isExecuting ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Executing...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    <span>Execute Feature</span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                Results will appear in a new execution page
              </p>
            </motion.div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
              <div className="h-20 w-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Activity className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">No Feature Selected</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Select a feature from the categories on the left to configure and execute it
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManualFeatureSelector;
