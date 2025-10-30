import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import PathSelector from '../components/PathSelector';
import ModeSelector from '../components/ModeSelector';

const PathSelectionPage = () => {
  const navigate = useNavigate();
  const { currentDataset, setPath, setMode, selectedPath, setCurrentStep } = useAppStore();
  const [showModeSelector, setShowModeSelector] = useState(false);

  useEffect(() => {
    setCurrentStep(3);
  }, [setCurrentStep]);

  if (!currentDataset) {
    navigate('/');
    return null;
  }

  const handleSelectPath = (path: 'analysis' | 'datascience') => {
    setPath(path);
    setShowModeSelector(true);
  };

  const handleSelectMode = (mode: 'manual' | 'automatic') => {
    setMode(mode);
    setShowModeSelector(false);
    navigate('/tasks');
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Choose Your Path
          </h1>
          <p className="text-gray-600">
            Select whether you want to perform data analysis or data science tasks
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <PathSelector
            onSelectPath={handleSelectPath}
            datasetInfo={{
              filename: currentDataset.filename,
              rows: currentDataset.datasetSchema.shape[0],
              columns: currentDataset.datasetSchema.shape[1],
            }}
            isLoadingSuggestions={false}
            selectedPath={selectedPath || undefined}
          />
        </motion.div>

        {/* Mode Selector Modal */}
        {showModeSelector && selectedPath && (
          <ModeSelector
            selectedPath={selectedPath}
            onSelectMode={handleSelectMode}
            onClose={() => setShowModeSelector(false)}
          />
        )}
      </div>
    </div>
  );
};

export default PathSelectionPage;
