import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedStepProps {
  children: ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  duration?: number;
}

const AnimatedStep = ({ 
  children, 
  direction = 'up', 
  delay = 0,
  duration = 0.6 
}: AnimatedStepProps) => {
  const directionOffset = {
    left: { x: -50, y: 0 },
    right: { x: 50, y: 0 },
    up: { x: 0, y: 30 },
    down: { x: 0, y: -30 },
  };

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        ...directionOffset[direction]
      }}
      animate={{ 
        opacity: 1, 
        x: 0, 
        y: 0 
      }}
      exit={{ 
        opacity: 0,
        scale: 0.95
      }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1], // Custom easing for smooth motion
      }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedStep;
