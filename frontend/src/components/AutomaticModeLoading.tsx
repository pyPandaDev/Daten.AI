import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle, Loader } from 'lucide-react';

interface AutomaticModeLoadingProps {
  selectedPath: 'analysis' | 'datascience';
  totalTasks: number;
  currentTask?: string;
  completedTasks?: number;
}

const AutomaticModeLoading: React.FC<AutomaticModeLoadingProps> = ({
  selectedPath,
  totalTasks,
  currentTask,
  completedTasks = 0,
}) => {
  const [messages, setMessages] = useState<string[]>([]);

  const loadingMessages = selectedPath === 'analysis'
    ? [
        'Analyzing dataset structure...',
        'Generating statistical summaries...',
        'Creating data visualizations...',
        'Detecting correlations and patterns...',
        'Identifying outliers and anomalies...',
        'Building comprehensive report...',
      ]
    : [
        'Preparing data for ML workflows...',
        'Engineering features...',
        'Selecting optimal algorithms...',
        'Training predictive models...',
        'Evaluating model performance...',
        'Generating ML insights...',
      ];

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < loadingMessages.length) {
        setMessages((prev) => [...prev, loadingMessages[index]]);
        index++;
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const progress = (completedTasks / totalTasks) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-blue-900/95 via-purple-900/95 to-pink-900/95 backdrop-blur-xl z-50 flex items-center justify-center p-4"
    >
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl w-full">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-4"
          >
            <div className="h-20 w-20 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-2">AI Analysis in Progress</h2>
          <p className="text-blue-200">
            AI is running all {selectedPath === 'analysis' ? 'Data Analysis' : 'Data Science'} tasks automatically
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-semibold">Overall Progress</span>
            <span className="text-white font-bold">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
            />
          </div>
          <div className="mt-3 text-blue-200 text-sm">
            {completedTasks} of {totalTasks} tasks completed
          </div>
        </motion.div>

        {/* Current Task */}
        {currentTask && (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center space-x-3">
              <Loader className="h-5 w-5 text-yellow-400 animate-spin" />
              <span className="text-white font-medium">{currentTask}</span>
            </div>
          </motion.div>
        )}

        {/* Activity Log */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 max-h-64 overflow-y-auto custom-scrollbar"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
            <span>Activity Log</span>
          </h3>
          <div className="space-y-3">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3"
                >
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-blue-100 text-sm">{message}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Fun Loading Messages */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-6"
        >
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-blue-200 text-sm"
          >
            ✨ Sit back and relax while AI does the heavy lifting...
          </motion.p>
        </motion.div>

        {/* Animated Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: "100vh", x: Math.random() * window.innerWidth, opacity: 0 }}
              animate={{
                y: "-100vh",
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
              className="absolute w-1 h-1 bg-white rounded-full"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AutomaticModeLoading;
