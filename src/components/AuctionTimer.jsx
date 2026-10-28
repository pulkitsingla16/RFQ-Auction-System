import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

export default function AuctionTimer({ auction }) {
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0, isExpired: false, totalSeconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const now = Date.now();
      const close = new Date(auction.bidCloseTime).getTime();
      const diff = close - now;

      if (diff <= 0) {
        setTimeLeft({ minutes: 0, seconds: 0, isExpired: true, totalSeconds: 0 });
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft({ minutes, seconds, isExpired: false, totalSeconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [auction.bidCloseTime]);

  const triggerWindowSeconds = (auction.triggerWindowMinutes || 2) * 60;
  const isOvertimeRisk = !timeLeft.isExpired && timeLeft.totalSeconds <= triggerWindowSeconds;

  return (
    <div className={`p-5 rounded-2xl border transition-all ${
      timeLeft.isExpired
        ? 'bg-neutral-900 border-neutral-800'
        : isOvertimeRisk
        ? 'bg-gradient-to-r from-amber-950/40 via-neutral-900 to-rose-950/30 border-amber-500/50 ring-2 ring-amber-500/20 animate-pulse'
        : 'bg-neutral-900/80 border-neutral-800'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className={`w-4 h-4 ${isOvertimeRisk ? 'text-amber-400' : 'text-emerald-400'}`} />
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              {timeLeft.isExpired ? 'Auction Concluded' : isOvertimeRisk ? 'British Overtime Trigger Zone' : 'Bidding Window Remaining'}
            </span>
          </div>

          <p className="text-xs text-neutral-400">
            {isOvertimeRisk
              ? `⚡ Any valid bid submitted now will extend the clock by +${auction.extensionDurationMinutes} minutes!`
              : `Dynamic extensions activate when a quote is submitted in the final ${auction.triggerWindowMinutes} minutes.`}
          </p>
        </div>

        {/* Digital Countdown Timer */}
        <div className="flex items-center gap-2">
          <div className="bg-neutral-950 px-3 py-2 rounded-xl border border-neutral-800 text-center min-w-[58px]">
            <span className="text-2xl font-black text-white font-mono leading-none block">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-semibold mt-1 block">Min</span>
          </div>

          <span className="text-xl font-bold text-neutral-500 font-mono">:</span>

          <div className="bg-neutral-950 px-3 py-2 rounded-xl border border-neutral-800 text-center min-w-[58px]">
            <span className={`text-2xl font-black font-mono leading-none block ${isOvertimeRisk ? 'text-amber-400' : 'text-emerald-400'}`}>
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-semibold mt-1 block">Sec</span>
          </div>
        </div>
      </div>

      {auction.totalExtensionsCount > 0 && (
        <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
          <span className="flex items-center gap-1.5 text-amber-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Extensions Triggered: <strong>{auction.totalExtensionsCount} times</strong>
          </span>
          <span className="text-[11px] text-neutral-500">
            Forced Cap: {new Date(auction.forcedCloseTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}
    </div>
  );
}
