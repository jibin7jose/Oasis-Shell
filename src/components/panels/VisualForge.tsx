import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MousePointer2, GitBranch, Plus, Save, Play, Trash2, X, Zap, Activity, Shield } from 'lucide-react';
import { ForgeNode } from './ForgeNode';
import { ForgeNode as IForgeNode, ForgeEdge as IForgeEdge } from '../../lib/contracts';
import { cn } from '../../lib/utils';

interface VisualForgeProps {
  initialNodes?: IForgeNode[];
  initialEdges?: IForgeEdge[];
  onSave: (nodes: IForgeNode[], edges: IForgeEdge[]) => void;
  onClose: () => void;
}

export const VisualForge: React.FC<VisualForgeProps> = ({ 
  initialNodes = [], 
  initialEdges = [], 
  onSave,
  onClose 
}) => {
  const [nodes, setNodes] = useState<IForgeNode[]>(initialNodes);
  const [edges, setEdges] = useState<IForgeEdge[]>(initialEdges);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDrag = (id: string, x: number, y: number) => {
    // Offset by canvas position if needed, but framer-motion drag gives relative or absolute points
    // For simplicity, we adjust the state
    setNodes(prev => prev.map(n => n.id === id ? { ...n, position: { x, y } } : n));
  };

  const addNode = (type: 'trigger' | 'logic' | 'action') => {
    const id = `node-${Date.now()}`;
    const newNode: IForgeNode = {
      id,
      type,
      label: type === 'trigger' ? 'Neural Pulse' : type === 'logic' ? 'Branch Logic' : 'Invoke System',
      position: { x: 100, y: 100 },
      data: type === 'action' ? { command: "echo 'Neural Command'" } : type === 'logic' ? { condition: "CPU > 80" } : { outcome: "On Pulse" }
    };
    setNodes([...nodes, newNode]);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-4 z-[1000] glass-bright border border-indigo-500/30 rounded-[2rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
    >
      {/* HUD Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-3xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/40">
            <GitBranch className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-widest leading-none">The Foundry Forge</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-1">Visual Logic Manifestation Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => onSave(nodes, edges)}
            className="px-6 py-2 bg-indigo-500 text-white text-[10px] font-black rounded-full hover:bg-indigo-400 transition-all flex items-center gap-2 uppercase tracking-[0.2em]"
          >
            <Save size={14} /> Etch Manifest
          </button>
          <button 
            onClick={onClose}
            className="p-3 bg-white/5 text-slate-400 hover:text-white rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Editor Canvas */}
      <div className="flex-1 relative bg-[radial-gradient(#ffffff10_1px,transparent_1px)] bg-[size:40px_40px]" ref={canvasRef}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {edges.map(edge => {
            const source = nodes.find(n => n.id === edge.source);
            const target = nodes.find(n => n.id === edge.target);
            if (!source || !target) return null;
            
            // Simple cubic bezier curve calculation
            const sX = source.position.x + 192; // + width
            const sY = source.position.y + 40;  // mid
            const tX = target.position.x;
            const tY = target.position.y + 40;
            
            return (
              <path
                key={edge.id}
                d={`M ${sX} ${sY} C ${sX + 50} ${sY}, ${tX - 50} ${tY}, ${tX} ${tY}`}
                stroke="#6366f1"
                strokeWidth="2"
                fill="none"
                strokeDasharray="5,5"
                className="opacity-40"
              />
            );
          })}
        </svg>

        {nodes.map(node => (
          <ForgeNode 
            key={node.id} 
            node={node} 
            onDrag={handleDrag} 
          />
        ))}

        {/* Floating Tool Palette */}
        <div className="absolute left-8 bottom-8 flex flex-col gap-3">
          <button 
            onClick={() => addNode('trigger')}
            className="w-12 h-12 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-2xl flex items-center justify-center hover:bg-amber-500 hover:text-black transition-all group"
            title="Add Trigger"
          >
            <Zap size={20} />
          </button>
          <button 
            onClick={() => addNode('logic')}
            className="w-12 h-12 bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 rounded-2xl flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all group"
            title="Add Branch"
          >
            <Activity size={20} />
          </button>
          <button 
            onClick={() => addNode('action')}
            className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-2xl flex items-center justify-center hover:bg-emerald-500 hover:text-black transition-all group"
            title="Add Action"
          >
            <Shield size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
