import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: number;
}

const steps = [
  { id: 1, name: 'Upload' },
  { id: 2, name: 'Summary' },
  { id: 3, name: 'Path' },
  { id: 4, name: 'Mode' },
  { id: 5, name: 'Execute' },
];

const ProgressIndicator = ({ currentStep }: ProgressIndicatorProps) => {
  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex-1 flex items-center">
              {/* Step Circle */}
              <div className="relative flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all
                    ${
                      currentStep > step.id
                        ? 'bg-green-500 text-white'
                        : currentStep === step.id
                        ? 'bg-blue-500 text-white ring-4 ring-blue-500/30'
                        : 'bg-gray-200 text-gray-500'
                    }
                  `}
                >
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step.id
                  )}
                </motion.div>
                <span
                  className={`
                    mt-2 text-xs font-medium
                    ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'}
                  `}
                >
                  {step.name}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 relative" style={{ marginTop: '-24px' }}>
                  <div className="absolute inset-0 bg-gray-300"></div>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: currentStep > step.id ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 origin-left"
                  ></motion.div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
