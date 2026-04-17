import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, HelpCircle, Activity, Terminal, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ForgeNode as IForgeNode } from '../../lib/contracts';

interface ForgeNodeProps {
  node: IForgeNode;
  onDrag: (id: string, x: number, y: number) => void;
  isSelected?: boolean;
}

const getNodeIcon = (type: string) => {
  switch (type) {
    case 'trigger': return <Zap className="w-4 h-4 text-amber-400" />;
    case 'logic': return <Activity className="w-4 h-4 text-indigo-400" />;
    case 'action': return <Shield className="w-4 h-4 text-emerald-400" />;
    default: return <Settings className="w-4 h-4 text-slate-400" />;
  }
};

export const ForgeNode: React.FC<ForgeNodeProps> = ({ node, onDrag, isSelected }) => {
  return (
    <motion.div
      drag
      dragMomentum={false}
      onDrag={(_, info) => onDrag(node.id, info.point.x, info.point.y)}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "absolute w-48 glass-bright rounded-2xl border p-4 cursor-grab active:cursor-grabbing shadow-2xl transition-all",
        isSelected ? "border-indigo-500 shadow-indigo-500/20" : "border-white/10 hover:border-white/20",
        node.type === 'trigger' ? "bg-amber-500/5" : node.type === 'logic' ? "bg-indigo-500/5" : "bg-emerald-500/5"
      )}
      style={{ left: node.position.x, top: node.position.y }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={cn(
            "p-2 rounded-lg border",
            node.type === 'trigger' ? "bg-amber-500/20 border-amber-500/30" : 
            node.type === 'logic' ? "bg-indigo-500/20 border-indigo-500/30" : 
            "bg-emerald-500/20 border-emerald-500/30"
        )}>
          {getNodeIcon(node.type)}
        </div>
        <div>
          <h4 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">{node.label}</h4>
          <span className="text-[8px] text-slate-500 uppercase font-bold">{node.type}</span>
        </div>
      </div>

      <div className="space-y-2">
        {node.data.command && (
            <div className="bg-black/40 rounded-lg p-2 border border-white/5 font-mono text-[8px] text-indigo-400 truncate">
                {node.data.command}
            </div>
        )}
        {node.data.condition && (
            <div className="text-[8px] text-slate-400 italic font-medium px-1">
                if ({node.data.condition})
            </div>
        )}
      </div>

      {/* Ports */}
      <div className="absolute top-1/2 -left-1.5 w-3 h-3 bg-slate-900 border border-white/20 rounded-full" />
      <div className="absolute top-1/2 -right-1.5 w-3 h-3 bg-slate-900 border border-white/20 rounded-full" />
    </motion.div>
  );
};
