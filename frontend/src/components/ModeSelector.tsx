import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Hand, Sparkles, X } from 'lucide-react';

interface ModeSelectorProps {
  selectedPath: 'analysis' | 'datascience';
  onSelectMode: (mode: 'manual' | 'automatic') => void;
  onClose?: () => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ selectedPath, onSelectMode, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden relative"
      >
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 h-10 w-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
          >
            <X className="h-6 w-6" />
          </button>
        )}
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-center space-x-3">
            <Sparkles className="h-8 w-8 animate-pulse" />
            <div>
              <h2 className="text-2xl font-bold">Choose Execution Mode</h2>
              <p className="text-blue-100 text-sm">
                How would you like to proceed with {selectedPath === 'analysis' ? 'Data Analysis' : 'Data Science'}?
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <p className="text-gray-600 mb-6 text-center">
            Select your preferred workflow for analyzing your dataset
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Manual Mode */}
            <motion.button
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectMode('manual')}
              className="group bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-300 rounded-xl p-6 text-left transition-all shadow-lg hover:shadow-2xl"
            >
              <div className="h-16 w-16 bg-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Hand className="h-9 w-9 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Manual Mode</h3>
              <p className="text-sm text-gray-600 mb-4">
                Review and select specific tasks you want to execute
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Choose individual tasks</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Customize parameters</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Control execution order</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Step-by-step analysis</span>
                </li>
              </ul>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <span className="text-xs font-semibold text-blue-700">Best for: Specific analysis needs</span>
              </div>
            </motion.button>

            {/* Automatic Mode */}
            <motion.button
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectMode('automatic')}
              className="group bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-2 border-purple-300 rounded-xl p-6 text-left transition-all shadow-lg hover:shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full">
                AI POWERED
              </div>
              <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="h-9 w-9 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Automatic Mode</h3>
              <p className="text-sm text-gray-600 mb-4">
                Let AI run all possible tasks automatically
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span>All tasks executed automatically</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span>Complete analysis in one go</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span>AI-optimized workflow</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span>Comprehensive insights</span>
                </li>
              </ul>
              <div className="mt-4 pt-4 border-t border-purple-200">
                <span className="text-xs font-semibold text-purple-700">Best for: Complete automated analysis</span>
              </div>
            </motion.button>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 flex items-start space-x-2">
              <span className="text-lg">💡</span>
              <span>
                <strong>Tip:</strong> Choose <strong>Automatic</strong> for a comprehensive analysis of all possibilities,
                or <strong>Manual</strong> if you want to focus on specific tasks.
              </span>
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ModeSelector;
