import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NeuralRippleProps {
  active: boolean;
  color?: string;
}

export const NeuralRipple: React.FC<NeuralRippleProps> = ({ active, color = "#6366f1" }) => {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 4, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vh] h-[50vh] rounded-full pointer-events-none z-[9999]"
          style={{ 
            background: `radial-gradient(circle, ${color}44 0%, transparent 70%)`,
            border: `2px solid ${color}22`
          }}
        />
      )}
    </AnimatePresence>
  );
};
