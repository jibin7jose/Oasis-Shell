import React from 'react';
import { Database, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface InventoryMatrixProps {
  isVaultSealed: boolean;
  strategicInventory: any[];
  zenMode: boolean;
}

export const InventoryMatrix: React.FC<InventoryMatrixProps> = ({
  isVaultSealed,
  strategicInventory,
  zenMode,
}) => {
  return (
    <div className={cn(
      "glass p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden transition-all duration-700",
      isVaultSealed && "border-rose-500/50 shadow-[0_0_50px_-20px_rgba(244,63,94,0.3)]",
      zenMode && "zen-hide"
    )}>
      <AnimatePresence>
        {isVaultSealed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-rose-950/20 backdrop-blur-[2px] z-[20] flex items-center justify-center border border-rose-500/20"
          >
            <div className="flex flex-col items-center gap-2 animate-bounce">
              <Lock className="w-8 h-8 text-rose-500" />
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Sentinel Vault Locked</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Strategic Inventory</h3>
        </div>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">Liquid: $1.8M</span>
      </div>
      <div className="flex flex-col gap-4">
        {strategicInventory.map((item, i) => (
          <div key={`inventory-${item.id || item.name || i}`} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className={cn("w-2 h-2 rounded-full", `bg-${item.aura}-500 shadow-[0_0_8px_var(--${item.aura}-500)]`)} />
              <div>
                <div className="text-sm font-bold text-white">{item.name}</div>
                <div className="text-[10px] text-slate-500 uppercase font-black">{item.type}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-black text-emerald-400">{item.value}</div>
              <div className="text-[9px] text-slate-600 font-bold">Health: {item.health}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
