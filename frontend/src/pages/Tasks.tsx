import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { getSuggestions, runTask } from '../services/api';
import AiRecommendationsPanel from '../components/sections/AiRecommendationsPanel';
import TaskEditor from '../components/TaskEditor';
import AutomaticModeLoading from '../components/AutomaticModeLoading';
import DataChatPanel from '../components/DataChatPanel';
import ManualFeatureSelector from '../components/ManualFeatureSelector';
import { askDatasetQuestion } from '../services/api';

const TasksPage = () => {
  const navigate = useNavigate();
  const {
    currentDataset,
    selectedPath,
    selectedMode,
    suggestions,
    setSuggestions,
    setIsLoadingSuggestions,
    isLoadingSuggestions,
    setCurrentExecutionId,
    addExecutedTaskId,
    setCurrentStep,
  } = useAppStore();

  const [showTaskEditor, setShowTaskEditor] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isAutoExecuting, setIsAutoExecuting] = useState(false);
  const [autoProgress, setAutoProgress] = useState({ completed: 0, total: 0, currentTask: '' });

  // Redirect if no dataset
  if (!currentDataset || !selectedPath || !selectedMode) {
    navigate('/');
    return null;
  }

  // Load suggestions on mount and set current step
  useEffect(() => {
    setCurrentStep(4);
    // Always load suggestions for automatic mode (fresh analysis each time)
    if (selectedMode === 'automatic') {
      loadSuggestions();
    }
  }, [setCurrentStep, selectedMode]);

  const loadSuggestions = async () => {
    setIsLoadingSuggestions(true);

    try {
      // Build intelligent context based on dataset characteristics
      const numericCols = Object.entries(currentDataset.datasetSchema.dtypes)
        .filter(([_, dtype]) => dtype.includes('int') || dtype.includes('float')).length;
      const categoricalCols = Object.entries(currentDataset.datasetSchema.dtypes)
        .filter(([_, dtype]) => dtype.includes('object') || dtype.includes('string')).length;
      const totalRows = currentDataset.datasetSchema.shape[0];
      const totalCols = currentDataset.datasetSchema.shape[1];
      const missingValues = Object.values(currentDataset.datasetSchema.null_counts).reduce((a, b) => a + b, 0);

      const contextPrompt =
        selectedPath === 'analysis'
          ? `AUTOMATIC MODE - DATA ANALYSIS: Analyze this dataset and select the BEST 5-7 tasks that will provide the most valuable insights.

Dataset Info:
- Total Rows: ${totalRows}, Total Columns: ${totalCols}
- Numeric Columns: ${numericCols}, Categorical Columns: ${categoricalCols}
- Missing Values: ${missingValues}
- Columns: ${currentDataset.datasetSchema.columns.join(', ')}

Select tasks from: descriptive statistics, data visualization (histograms, scatter plots, heatmaps, box plots, bar charts), correlation analysis, outlier detection, missing value analysis, distribution analysis, categorical summaries. 

Prioritize tasks that:
1. Reveal key patterns and relationships
2. Identify data quality issues
3. Provide actionable visualizations
4. Are most relevant to this specific dataset structure

Return ONLY the most impactful tasks that work together to give a complete analysis.`
          : `AUTOMATIC MODE - DATA SCIENCE: Analyze this dataset and select the BEST 5-8 tasks for a complete ML pipeline.

Dataset Info:
- Total Rows: ${totalRows}, Total Columns: ${totalCols}
- Numeric Columns: ${numericCols}, Categorical Columns: ${categoricalCols}
- Missing Values: ${missingValues}
- Columns: ${currentDataset.datasetSchema.columns.join(', ')}

Select tasks from: data cleaning, missing value handling, outlier treatment, feature engineering, feature selection, data normalization, train-test split, model training (regression/classification/clustering), hyperparameter tuning, model evaluation, predictions.

Prioritize tasks that:
1. Prepare data for ML (cleaning, preprocessing)
2. Engineer meaningful features
3. Build and evaluate appropriate models
4. Are most relevant to this dataset's characteristics

Return a logical sequence of tasks that form a complete ML workflow.`;

      const response = await getSuggestions(
        currentDataset.fileId,
        currentDataset.datasetSchema,
        contextPrompt,
        selectedPath
      );

      setSuggestions(response.suggestions);

      // If automatic mode, start auto execution immediately
      if (selectedMode === 'automatic') {
        handleAutomaticExecution(response.suggestions);
      }
    } catch (error: any) {
      console.error('Error loading suggestions:', error);
      alert(`Error: ${error.message || 'Failed to load suggestions'}`);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSelectTask = async (task: any) => {
    setIsExecuting(true);

    try {
      const response = await runTask(
        currentDataset.fileId,
        task.id,
        task.title,
        currentDataset.datasetSchema
      );

      setCurrentExecutionId(response.task_execution_id);
      navigate(`/execution/${response.task_execution_id}`);
    } catch (error: any) {
      console.error('Execution error:', error);
      alert(`Error: ${error.message || 'Failed to start task'}`);
      setIsExecuting(false);
    }
  };

  const handleAutomaticExecution = async (tasks: any[]) => {
    console.log('[AUTO-EXEC] Starting automatic execution with', tasks.length, 'tasks');
    setIsAutoExecuting(true);
    setAutoProgress({ completed: 0, total: tasks.length, currentTask: 'Initializing...' });

    try {
      const executedIds: string[] = [];
      const taskDetails: Array<{ id: string; title: string; description: string; category: string }> = [];

      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        setAutoProgress({ completed: i, total: tasks.length, currentTask: task.title });

        try {
          const response = await runTask(
            currentDataset.fileId,
            task.id,
            task.title,
            currentDataset.datasetSchema
          );
          executedIds.push(response.task_execution_id);
          taskDetails.push({
            id: response.task_execution_id,
            title: task.title,
            description: task.description,
            category: task.category
          });
          addExecutedTaskId(response.task_execution_id);
        } catch (error) {
          console.error(`Error executing task ${task.title}:`, error);
        }
      }

      setAutoProgress({
        completed: tasks.length,
        total: tasks.length,
        currentTask: 'All tasks completed!',
      });

      // Navigate to results
      setTimeout(() => {
        navigate('/auto-results', {
          state: {
            executedTaskIds: executedIds,
            taskDetails: taskDetails,
            totalTasks: tasks.length,
            filename: currentDataset.filename,
            selectedPath: selectedPath
          },
        });
      }, 2000);
    } catch (error: any) {
      console.error('Auto execution error:', error);
      alert(`Error: ${error.message || 'Automatic execution failed'}`);
      setIsAutoExecuting(false);
    }
  };

  const handleAskQuestion = async (question: string): Promise<string> => {
    const response: any = await askDatasetQuestion(
      currentDataset.fileId,
      question,
      currentDataset.datasetSchema
    );
    return typeof response === 'string' ? response : response?.response || 'No response';
  };

  const handleExecuteFeature = async (feature: any, params: any) => {
    setIsExecuting(true);

    try {
      const taskTitle = feature.name;

      const response = await runTask(
        currentDataset.fileId,
        feature.id,
        taskTitle,
        currentDataset.datasetSchema,
        params
      );

      setCurrentExecutionId(response.task_execution_id);
      navigate(`/execution/${response.task_execution_id}`);
    } catch (error: any) {
      console.error('Feature execution error:', error);
      alert(`Error: ${error.message || 'Failed to execute feature'}`);
      setIsExecuting(false);
    }
  };

  const handleExecuteMultiple = async (features: Array<{ feature: any; params: any }>) => {
    setIsExecuting(true);

    try {
      const executedIds: string[] = [];

      for (let i = 0; i < features.length; i++) {
        const { feature, params } = features[i];
        
        try {
          const response = await runTask(
            currentDataset.fileId,
            feature.id,
            feature.name,
            currentDataset.datasetSchema,
            params
          );
          executedIds.push(response.task_execution_id);
          addExecutedTaskId(response.task_execution_id);
        } catch (error) {
          console.error(`Error executing feature ${feature.name}:`, error);
        }
      }

      // Navigate to the first execution or results page
      if (executedIds.length > 0) {
        navigate(`/execution/${executedIds[0]}`);
      }
    } catch (error: any) {
      console.error('Multi-feature execution error:', error);
      alert(`Error: ${error.message || 'Failed to execute features'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Loading State - Only for Automatic Mode */}
        {isLoadingSuggestions && selectedMode === 'automatic' && (
          <div className="text-center py-16">
            <div className="inline-flex flex-col items-center space-y-4 px-10 py-8 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-2 border-blue-700/50 rounded-2xl">
              <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-center">
                <span className="text-blue-300 font-bold text-xl block mb-2">🤖 AI is Analyzing Your Dataset...</span>
                <span className="text-blue-400 text-sm">Selecting the best tasks for {selectedPath === 'analysis' ? 'data analysis' : 'data science workflow'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Manual Mode - Show Manual Feature Selector Immediately */}
        {selectedMode === 'manual' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ManualFeatureSelector
              onExecuteFeature={handleExecuteFeature}
              onExecuteMultiple={handleExecuteMultiple}
              isExecuting={isExecuting}
              selectedPath={selectedPath}
              fileId={currentDataset.fileId}
              datasetSchema={currentDataset.datasetSchema}
            />
          </motion.div>
        )}

        {/* Automatic Mode Loading - Full Screen */}
        <AnimatePresence>
          {isAutoExecuting && (
            <AutomaticModeLoading
              selectedPath={selectedPath}
              totalTasks={autoProgress.total}
              completedTasks={autoProgress.completed}
              currentTask={autoProgress.currentTask}
            />
          )}
        </AnimatePresence>

        {/* Task Editor Modal */}
        {showTaskEditor && (
          <TaskEditor
            suggestions={suggestions}
            onUpdateSuggestions={(updated) => {
              setSuggestions(updated);
              setShowTaskEditor(false);
            }}
            onClose={() => setShowTaskEditor(false)}
          />
        )}

        {/* Executing State */}
        {isExecuting && (
          <div className="text-center py-16">
            <div className="inline-flex items-center space-x-4 px-10 py-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-2 border-blue-700/50 rounded-2xl">
              <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-blue-300 font-bold text-lg">Starting execution...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
