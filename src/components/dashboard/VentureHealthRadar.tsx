import React from "react";
import { motion } from "framer-motion";

interface RadarPoint {
  label: string;
  value: number; // 0 to 100
}

interface VentureHealthRadarProps {
  data: RadarPoint[];
  size?: number;
}

export const VentureHealthRadar: React.FC<VentureHealthRadarProps> = ({ 
  data, 
  size = 300 
}) => {
  const center = size / 2;
  const radius = (size / 2) * 0.8;
  const angleStep = (Math.PI * 2) / data.length;

  const getCoordinates = (value: number, index: number) => {
    const r = (value / 100) * radius;
    const angle = index * angleStep - Math.PI / 2;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const points = data.map((d, i) => getCoordinates(d.value, i));
  const pathData = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <div className="relative flex items-center justify-center p-4">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background Grid */}
        {[20, 40, 60, 80, 100].map((tick) => (
          <circle
            key={tick}
            cx={center}
            cy={center}
            r={(tick / 100) * radius}
            fill="none"
            stroke="white"
            strokeOpacity={0.05}
            strokeWidth={1}
          />
        ))}

        {/* Axis Lines */}
        {data.map((d, i) => {
          const p = getCoordinates(100, i);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              stroke="white"
              strokeOpacity={0.1}
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Data Shape */}
        <motion.path
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          d={pathData}
          fill="rgba(var(--accent-primary-rgb), 0.2)"
          stroke="var(--accent-primary)"
          strokeWidth={2}
          className="transition-all duration-1000 ease-in-out"
        />

        {/* Data Points */}
        {points.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={4}
            fill="var(--accent-primary)"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 }}
          />
        ))}

        {/* Labels */}
        {data.map((d, i) => {
          const p = getCoordinates(115, i);
          return (
            <text
              key={i}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              className="text-[9px] font-black uppercase tracking-[0.2em] fill-slate-500"
            >
              {d.label}
            </text>
          );
        })}
      </svg>

      {/* Center Pulse */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-12 h-12 rounded-full blur-xl"
          style={{ backgroundColor: 'var(--accent-primary)' }}
        />
      </div>
    </div>
  );
};
