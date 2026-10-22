import React, { useState, useEffect } from 'react';
import { Wifi, Signal, Battery, Sparkles } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const [timeStr, setTimeStr] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full px-5 py-2 flex items-center justify-between text-xs font-semibold text-slate-300 select-none z-30">
      {/* Time & Android micro indicators */}
      <div className="flex items-center space-x-1.5">
        <span className="font-mono text-xs text-white">{timeStr}</span>
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
      </div>

      {/* Dynamic Camera Punch Hole Notch */}
      <div className="w-20 h-4 bg-black/90 rounded-full flex items-center justify-center border border-slate-800/80 shadow-inner">
        <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700/60" />
      </div>

      {/* Status icons: 5G, Wi-Fi, Battery */}
      <div className="flex items-center space-x-2 text-slate-300 text-[11px]">
        <span className="text-[10px] font-mono font-bold text-cyan-400">5G</span>
        <Signal className="w-3.5 h-3.5" />
        <Wifi className="w-3.5 h-3.5" />
        <div className="flex items-center space-x-0.5">
          <Battery className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] font-mono">92%</span>
        </div>
      </div>
    </div>
  );
};
