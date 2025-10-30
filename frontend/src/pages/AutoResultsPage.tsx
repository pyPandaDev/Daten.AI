import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Sparkles } from 'lucide-react';

interface TaskDetail {
  id: string;
  title: string;
  description: string;
  category: string;
}

interface LocationState {
  fileId?: string;
  filename: string;
  executedTaskIds: string[];
  taskDetails?: TaskDetail[];
  totalTasks: number;
  selectedPath?: 'analysis' | 'datascience';
}

const AutoResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const [executedTaskIds, setExecutedTaskIds] = useState<string[]>([]);
  const [taskDetails, setTaskDetails] = useState<TaskDetail[]>([]);
  const [filename, setFilename] = useState<string>('');
  const [totalTasks, setTotalTasks] = useState<number>(0);
  const [selectedPath, setSelectedPath] = useState<'analysis' | 'datascience'>('analysis');

  useEffect(() => {
    // Get data from navigation state or sessionStorage
    if (state?.executedTaskIds) {
      setExecutedTaskIds(state.executedTaskIds);
      setTaskDetails(state.taskDetails || []);
      setFilename(state.filename || 'dataset');
      setTotalTasks(state.totalTasks || state.executedTaskIds.length);
      setSelectedPath(state.selectedPath || 'analysis');
    } else {
      // Fallback to sessionStorage
      const storedIds = sessionStorage.getItem('autoExecutedTasks');
      const storedFilename = sessionStorage.getItem('autoExecutionFilename');
      const storedDetails = sessionStorage.getItem('autoTaskDetails');
      
      if (storedIds) {
        const ids = JSON.parse(storedIds);
        setExecutedTaskIds(ids);
        setTaskDetails(storedDetails ? JSON.parse(storedDetails) : []);
        setFilename(storedFilename || 'dataset');
        setTotalTasks(ids.length);
      }
    }
  }, [state]);

  const handleViewTask = (taskId: string) => {
    navigate(`/execution/${taskId}`);
  };

  const handleGoBack = () => {
    sessionStorage.removeItem('autoExecutedTasks');
    sessionStorage.removeItem('autoExecutionFileId');
    sessionStorage.removeItem('autoExecutionFilename');
    navigate(-1);
  };

  if (executedTaskIds.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300">No results found. Going back...</p>
          <button onClick={handleGoBack} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-slate-800/90 backdrop-blur-lg border-b border-slate-700 sticky top-0 z-10 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleGoBack}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition group"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back</span>
            </button>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-400" />
              <span className="text-lg font-semibold text-white">
                Automatic Analysis Complete
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Banner */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8 shadow-xl shadow-purple-500/30"
        >
          <div className="flex items-center justify-center space-x-4 mb-4">
            <Sparkles className="h-12 w-12 animate-pulse" />
            <h1 className="text-3xl font-bold">All Tasks Completed Successfully!</h1>
          </div>
          <p className="text-center text-lg opacity-90">
            AI successfully executed {totalTasks} tasks on <strong>{filename}</strong>
          </p>
        </motion.div>

        {/* Task Results Grid */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Completed Tasks</h2>
          <p className="text-gray-300 mb-6">
            Click on any task below to view detailed results, visualizations, and insights.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {executedTaskIds.map((taskId, index) => {
              const taskDetail = taskDetails.find(t => t.id === taskId);
              const categoryColors: Record<string, string> = {
                'Data Exploration': 'from-blue-900/40 to-blue-800/40 border-blue-700/50 hover:border-blue-500',
                'Visualization': 'from-purple-900/40 to-purple-800/40 border-purple-700/50 hover:border-purple-500',
                'Statistical Analysis': 'from-green-900/40 to-green-800/40 border-green-700/50 hover:border-green-500',
                'Data Quality': 'from-red-900/40 to-red-800/40 border-red-700/50 hover:border-red-500',
                'Machine Learning': 'from-indigo-900/40 to-indigo-800/40 border-indigo-700/50 hover:border-indigo-500',
                'default': 'from-blue-900/40 to-purple-900/40 border-blue-700/50 hover:border-blue-500'
              };
              const colorClass = taskDetail?.category ? (categoryColors[taskDetail.category] || categoryColors.default) : categoryColors.default;
              
              return (
                <motion.button
                  key={taskId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleViewTask(taskId)}
                  className={`group bg-gradient-to-br ${colorClass} hover:from-blue-800/50 hover:to-purple-800/50 border-2 rounded-xl p-6 text-left transition-all hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105`}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold group-hover:bg-blue-500 transition shadow-lg">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white group-hover:text-blue-300 line-clamp-1">
                        {taskDetail?.title || `Task ${index + 1}`}
                      </h3>
                      {taskDetail?.category && (
                        <span className="text-xs text-blue-300 font-medium">{taskDetail.category}</span>
                      )}
                    </div>
                  </div>
                  {taskDetail?.description && (
                    <p className="text-sm text-gray-300 mb-3 line-clamp-2">{taskDetail.description}</p>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span>Completed</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Additional Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-blue-900/30 border border-blue-700/50 rounded-xl p-6"
        >
          <h3 className="font-semibold text-white mb-3">📊 What's Next?</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 font-bold">•</span>
              <span>Click on any task above to view detailed results and visualizations</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 font-bold">•</span>
              <span>Export results as PDF or CSV from individual task pages</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 font-bold">•</span>
              <span>Ask questions about your results using the AI chat assistant</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 font-bold">•</span>
              <span>Start a new analysis by clicking "Back to Home"</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default AutoResultsPage;
