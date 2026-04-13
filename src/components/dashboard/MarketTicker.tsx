import React from 'react';
import { cn } from '../../lib/utils';

interface MarketTickerProps {
  displayedMarket: any;
  marketIntel: any;
  zenMode: boolean;
}

export const MarketTicker: React.FC<MarketTickerProps> = ({
  displayedMarket,
  marketIntel,
  zenMode,
}) => {
  const tickerItems = displayedMarket?.ai_ticker || marketIntel?.ai_ticker || [];

  return (
    <div className={cn(
      "flex gap-12 items-center overflow-hidden w-full max-w-5xl py-4 border-y border-white/5 bg-black/20 backdrop-blur-md px-12 rounded-[5rem] mb-12 group cursor-pointer relative",
      zenMode && "zen-hide"
    )}>
      <div className="flex gap-12 items-center animate-marquee whitespace-nowrap group-hover:pause">
        {tickerItems.map((m: any, i: number) => (
          <div key={`app-ticker-${m.id}-${i}`} className="flex gap-4 items-center">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{m.id}</span>
            <span className="text-sm font-bold text-white tracking-tight">${(m.price ?? 0).toFixed(1)}</span>
            <span className={cn(
              "text-[10px] font-black tracking-widest uppercase",
              m.color === 'emerald' ? "text-emerald-500" : "text-rose-500"
            )}>
              {m.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
