import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { useSystemStore } from "../../lib/systemStore";
import { invokeSafe, listenSafe } from "../../lib/tauri";
import { CollectiveNode } from "../../lib/contracts";

export const CollectivePanel: React.FC = () => {
  const { 
    collectiveNodes, 
    setCollectiveNodes, 
    setNotification 
  } = useSystemStore();

  const loadCollectiveNodes = async () => {
    try {
      const nodes = await invokeSafe("get_collective_nodes") as CollectiveNode[];
      setCollectiveNodes(nodes);
    } catch (e) {
      console.error("Failed to load collective nodes:", e);
    }
  };

  useEffect(() => {
    // Initial fetch
    loadCollectiveNodes();

    // Polling interval
    const interval = setInterval(loadCollectiveNodes, 30000);

    // Real-time updates listener
    const unlistenPromise = listenSafe('collective-update', (event: { payload: CollectiveNode }) => {
      const prev = useSystemStore.getState().collectiveNodes;
      const index = prev.findIndex((n: CollectiveNode) => n.id === event.payload.id);
      if (index > -1) {
        const updated = [...prev];
        updated[index] = event.payload;
        setCollectiveNodes(updated);
      } else {
        setCollectiveNodes([...prev, event.payload]);
      }
    });

    return () => {
      clearInterval(interval);
      unlistenPromise.then(unlisten => unlisten && unlisten());
    };
  }, []);

  const handleRegisterNode = async () => {
    try {
      const res = await invokeSafe("register_remote_node", { 
        ip: "127.0.0.1", 
        port: 1420, 
        hostname: "LocalFoundry-Alpha" 
      }) as string;
      setNotification(res);
      loadCollectiveNodes();
    } catch (err) {
      setNotification(`Registration Fault: ${err}`);
    }
  };

  return (
    <div className="glass-bright p-8 rounded-[3rem] border border-indigo-500/10 shadow-3xl shadow-black/40">
      <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-6 flex items-center gap-2">
        <Globe size={14} className="animate-pulse" /> Distributed Collective
      </h3>
      <div className="space-y-4">
        {collectiveNodes.length === 0 && (
          <p className="text-[10px] text-slate-500 italic uppercase">Searching for remote Foundry nodes...</p>
        )}
        {collectiveNodes.map((node) => (
          <motion.div 
            key={node.id} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-between"
          >
            <div>
              <p className="text-[10px] font-bold text-white leading-none mb-1">{node.hostname}</p>
              <p className="text-[8px] text-slate-500 font-mono">{node.ip}:{node.port}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${node.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-500'}`} />
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{node.status}</span>
            </div>
          </motion.div>
        ))}
        <button
          onClick={handleRegisterNode}
          className="w-full py-3 rounded-xl bg-white/5 border border-white/5 text-[8px] font-black text-slate-500 uppercase tracking-widest hover:bg-white/10 transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
        >
          Scan for Peer Nodes
        </button>
      </div>
    </div>
  );
};
