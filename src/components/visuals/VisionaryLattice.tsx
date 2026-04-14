import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LatticePoint {
  label: string;
  x_pct: number;
  y_pct: number;
  intensity: number;
  category: "CODE" | "MARKET" | "SYSTEM" | "ERROR";
}

interface VisionaryLatticeProps {
  points: LatticePoint[];
  show: boolean;
}

const VisionaryLattice: React.FC<VisionaryLatticeProps> = ({ points, show }) => {
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "ERROR": return "rgba(244, 63, 94,";
      case "MARKET": return "rgba(16, 185, 129,";
      case "CODE": return "rgba(99, 102, 241,";
      case "SYSTEM": return "rgba(168, 85, 247,";
      default: return "rgba(148, 163, 184,";
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[150] overflow-hidden">
      <AnimatePresence>
        {show && points.map((point, i) => (
          <motion.div
            key={`${point.label}-${i}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: point.intensity, 
              scale: 1,
              x: `${point.x_pct}vw`,
              y: `${point.y_pct}vh` 
            }}
            exit={{ opacity: 0, scale: 2 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: 0, top: 0 }}
          >
            {/* Heatmap Core */}
            <div 
              className="w-40 h-40 rounded-full blur-3xl opacity-20"
              style={{ background: `radial-gradient(circle, ${getCategoryColor(point.category)}1) 0%, transparent 70%)` }}
            />
            
            {/* Focus Ring */}
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div 
                className="w-8 h-8 rounded-full border-2 border-dashed"
                style={{ borderColor: `${getCategoryColor(point.category)}0.5)` }}
              />
            </motion.div>

            {/* Label */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span 
                className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md"
                style={{ 
                  backgroundColor: `${getCategoryColor(point.category)}0.2)`,
                  borderColor: `${getCategoryColor(point.category)}0.4)`,
                  color: "white" 
                }}
              >
                {point.label}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Lattice Grid Overlay */}
      {show && (
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <defs>
            <pattern id="lattice-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="rgba(99, 102, 241, 0.5)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lattice-grid)" />
        </svg>
      )}
    </div>
  );
};

export default VisionaryLattice;
