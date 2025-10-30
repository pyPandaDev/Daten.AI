import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import GeminiSummaryCard from '../components/GeminiSummaryCard';
import { askDatasetQuestion } from '../services/api';

const SummaryPage = () => {
  const navigate = useNavigate();
  const { currentDataset, setCurrentStep } = useAppStore();

  useEffect(() => {
    setCurrentStep(2);
  }, [setCurrentStep]);

  if (!currentDataset) {
    navigate('/');
    return null;
  }

  const handleContinue = () => {
    setCurrentStep(3);
    navigate('/path-selection');
  };

  const handleAskQuestion = async (question: string): Promise<string> => {
    if (!currentDataset) {
      throw new Error('No dataset loaded');
    }

    try {
      const answer = await askDatasetQuestion(
        currentDataset.fileId,
        question,
        currentDataset.datasetSchema
      );
      return answer;
    } catch (error) {
      console.error('Dataset chat error:', error);
      throw error;
    }
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
            Dataset Summary
          </h1>
          <p className="text-gray-600">
            AI has analyzed your dataset. Review the insights below.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GeminiSummaryCard
            insights={currentDataset.geminiInsights || 'No insights available'}
            datasetName={currentDataset.filename}
            rows={currentDataset.datasetSchema.shape[0]}
            columns={currentDataset.datasetSchema.shape[1]}
            statisticsSummary={currentDataset.statisticsSummary}
            onAskQuestion={handleAskQuestion}
          />
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex justify-center"
        >
          <button
            onClick={handleContinue}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all inline-flex items-center space-x-2 group"
          >
            <span>Continue to Path Selection</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default SummaryPage;
