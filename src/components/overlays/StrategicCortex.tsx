import React, { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Plus } from 'lucide-react';

// Lazy-load the 3D graph — saves ~1.3 MB from the initial bundle
const ForceGraph3D = lazy(() => import('react-force-graph-3d'));

interface StrategicCortexProps {
  graphData: any;
  mounted: boolean;
  simMode: boolean;
  getNodeColor: (node: any) => string;
  contextCrates: any[];
  launchContextCrate: (crate: any) => void;
  setShowVault: (show: boolean) => void;
  setShowGraph: (show: boolean) => void;
  setRagQuery: (query: string) => void;
}

export const StrategicCortex: React.FC<StrategicCortexProps> = ({
  graphData,
  mounted,
  simMode,
  getNodeColor,
  contextCrates,
  launchContextCrate,
  setShowVault,
  setShowGraph,
  setRagQuery
}) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl overflow-hidden">
      {/* Ambient Nebula Glows */}
      <div className="absolute top-1/3 left-1/4 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-1/3 right-1/4 w-[800px] h-[800px] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
      
      {/* Control Panel Overlay */}
      <div className="absolute top-10 left-10 z-[210] p-8 glass-bright border border-white/10 rounded-[2.5rem] w-80 shadow-[0_0_50px_rgba(99,102,241,0.15)] backdrop-blur-xl pointer-events-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
              <BrainCircuit className="w-6 h-6 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">Strategic Cortex</h2>
          </div>
          <p className="text-xs text-indigo-200/60 leading-relaxed mb-8">
            Real-time visualization of your neural contexts, workspace dependencies, and knowledge architecture.
          </p>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Nodes</span>
              <span className="text-sm font-mono text-indigo-400">{graphData.nodes.length}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Neural Links</span>
              <span className="text-sm font-mono text-cyan-400">{graphData.links.length}</span>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/5">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Telemetry Online
            </span>
          </div>
      </div>

      <button onClick={() => setShowGraph(false)} className="absolute top-10 right-10 z-[210] group flex items-center gap-3 px-6 py-3 glass rounded-2xl text-white hover:bg-white/10 transition-all border border-white/5 hover:border-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] pointer-events-auto">
          <span className="text-xs font-bold uppercase tracking-widest opacity-70 group-hover:opacity-100">Exit Cortex</span>
          <Plus className="w-6 h-6 rotate-45 opacity-70 group-hover:opacity-100 transition-transform group-hover:rotate-90" />
      </button>

      <div className="w-full h-full relative z-[205] cursor-move">
        {mounted && (
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-2 border-indigo-500/50 border-t-indigo-400 rounded-full animate-spin" />
                <span className="text-[10px] font-black text-indigo-400/60 uppercase tracking-widest">Loading Neural Graph...</span>
              </div>
            </div>
          }>
            <ForceGraph3D
              graphData={graphData}
              backgroundColor="#00000000"
              nodeRelSize={simMode ? 12 : 12}
              nodeColor={getNodeColor}
              nodeLabel="id"
              onNodeClick={(node: any) => {
                if (node.group === 'crate') {
                  const crate = contextCrates.find(c => c.name === node.id);
                  if (crate) launchContextCrate(crate);
                } else if (node.group === 'vault') {
                  setShowVault(true);
                  setRagQuery('Summarize ' + node.id);
                }
              }}
              linkColor={() => simMode ? "rgba(245, 158, 11, 0.4)" : "rgba(99, 102, 241, 0.4)"}
              linkWidth={2}
              nodeOpacity={0.9}
              linkOpacity={0.4}
            />
          </Suspense>
        )}
      </div>
    </motion.div>
  );
};
