import React from 'react';
import { ChevronRight, Play, Loader } from 'lucide-react';

interface NextStepsPanelProps {
  followups: string[];
  onExecuteStep: (step: string) => void;
  executingStep: string | null;
}

const NextStepsPanel: React.FC<NextStepsPanelProps> = ({
  followups,
  onExecuteStep,
  executingStep,
}) => {
  if (!followups || followups.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-2xl">💡</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Next Steps</h3>
          <p className="text-sm text-gray-600">
            Click any suggestion to run it automatically
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {followups.map((step, idx) => {
          const isExecuting = executingStep === step;
          
          return (
            <button
              key={idx}
              onClick={() => !isExecuting && onExecuteStep(step)}
              disabled={isExecuting}
              className="w-full group bg-white hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-400 rounded-lg p-4 transition-all flex items-center justify-between disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="flex items-start space-x-3 flex-1 text-left">
                <div className={`mt-1 flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${
                  isExecuting
                    ? 'bg-blue-600'
                    : 'bg-blue-100 group-hover:bg-blue-200'
                }`}>
                  {isExecuting ? (
                    <Loader className="h-4 w-4 text-white animate-spin" />
                  ) : (
                    <Play className="h-3 w-3 text-blue-600 group-hover:text-blue-700" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium leading-relaxed">
                    {step}
                  </p>
                  {isExecuting && (
                    <p className="text-sm text-blue-600 mt-1 animate-pulse">
                      Executing...
                    </p>
                  )}
                </div>
              </div>
              {!isExecuting && (
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 bg-blue-100 border border-blue-300 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <strong>Tip:</strong> Results will be appended below in a continuous flow
        </p>
      </div>
    </div>
  );
};

export default NextStepsPanel;
