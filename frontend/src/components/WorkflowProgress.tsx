import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface WorkflowProgressProps {
  currentStep: 1 | 2 | 3 | 4 | 5;
}

const WorkflowProgress: React.FC<WorkflowProgressProps> = ({ currentStep }) => {
  const steps = [
    { number: 1, label: 'Home', icon: '🏠' },
    { number: 2, label: 'Upload', icon: '📤' },
    { number: 3, label: 'Summary', icon: '📊' },
    { number: 4, label: 'Model Selection', icon: '🎯' },
    { number: 5, label: 'Execute', icon: '⚡' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100"
    >
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            {/* Step Circle */}
            <div className="flex flex-col items-center space-y-3 flex-1">
              <motion.div
                initial={false}
                animate={{
                  scale: currentStep === step.number ? 1.15 : 1,
                  rotate: currentStep > step.number ? 360 : 0,
                }}
                transition={{
                  duration: 0.5,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                className={`relative h-16 w-16 rounded-full flex items-center justify-center font-bold text-lg shadow-lg ${
                  currentStep > step.number
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white'
                    : currentStep === step.number
                    ? 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white shadow-2xl'
                    : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                }`}
              >
                {currentStep > step.number ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Check className="h-8 w-8" />
                  </motion.div>
                ) : (
                  <motion.span
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-2xl"
                  >
                    {step.icon}
                  </motion.span>
                )}
                {currentStep === step.number && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.3, opacity: 0 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeOut"
                    }}
                  />
                )}
              </motion.div>
              <div className="text-center">
                <motion.p
                  initial={false}
                  animate={{
                    color: currentStep >= step.number ? '#1f2937' : '#9ca3af',
                    fontWeight: currentStep === step.number ? 700 : 600,
                  }}
                  transition={{ duration: 0.3 }}
                  className="text-sm"
                >
                  {step.label}
                </motion.p>
                {currentStep === step.number && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: 48 }}
                    transition={{ duration: 0.5 }}
                    className="mt-2 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full mx-auto"
                  />
                )}
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-1.5 mx-3 relative" style={{ maxWidth: '100px' }}>
                <div className="absolute inset-0 bg-gray-200 rounded-full"></div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: currentStep > step.number ? '100%' : '0%' }}
                  transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                  className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </motion.div>
  );
};

export default WorkflowProgress;
