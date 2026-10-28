import React from 'react';
import { Trophy, Clock, CheckCircle2, TrendingDown, ShieldCheck, Award } from 'lucide-react';

export default function Leaderboard({ bids, user, auction, onAwardBid }) {
  const isBuyer = user.role === 'buyer';
  const isAwarded = auction.status === 'awarded';

  if (!bids || bids.length === 0) {
    return (
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-8 text-center">
        <Clock className="w-10 h-10 text-neutral-500 mx-auto mb-2 opacity-50" />
        <h4 className="text-white font-semibold text-sm">No Active Bids Recorded</h4>
        <p className="text-neutral-400 text-xs mt-1">
          Waiting for participating suppliers to place initial quotes.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Competitive Leaderboard (L1/L2/L3)
          </h3>
          <p className="text-xs text-neutral-400">
            Real-time reverse auction ranking. L1 is the current leading candidate for contract award.
          </p>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Total Quotes</span>
          <div className="text-base font-extrabold text-emerald-400 font-mono">{bids.length}</div>
        </div>
      </div>

      <div className="space-y-3">
        {bids.map((bid, index) => {
          const isL1 = index === 0;
          const isL2 = index === 1;
          const isL3 = index === 2;
          const isMyBid = bid.supplierId === user._id;
          const isThisAwarded = auction.awardedBidId === bid._id;

          let rankBadge = (
            <span className="w-7 h-7 rounded-lg bg-neutral-800 text-neutral-400 font-mono font-bold text-xs flex items-center justify-center">
              #{index + 1}
            </span>
          );

          if (isL1) {
            rankBadge = (
              <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-xs flex items-center justify-center shadow-md shadow-emerald-500/20">
                L1
              </span>
            );
          } else if (isL2) {
            rankBadge = (
              <span className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40 font-mono font-bold text-xs flex items-center justify-center">
                L2
              </span>
            );
          } else if (isL3) {
            rankBadge = (
              <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold text-xs flex items-center justify-center">
                L3
              </span>
            );
          }

          return (
            <div
              key={bid._id}
              className={`p-4 rounded-xl border transition-all relative ${
                isThisAwarded
                  ? 'bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg'
                  : isL1
                  ? 'bg-emerald-950/20 border-emerald-500/30 shadow-sm'
                  : isMyBid
                  ? 'bg-neutral-800/40 border-neutral-700'
                  : 'bg-neutral-950/40 border-neutral-800/80 hover:border-neutral-700/80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {rankBadge}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white tracking-wide">
                        {bid.supplierName}
                      </span>
                      {isMyBid && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                          Your Fleet
                        </span>
                      )}
                      {isThisAwarded && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-neutral-950 flex items-center gap-1">
                          <Award className="w-3 h-3" /> Contract Won
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-neutral-400 flex items-center gap-2 mt-0.5">
                      <span>Timeline: <strong className="text-neutral-300">{bid.deliveryTimeline}</strong></span>
                      <span>•</span>
                      <span>{new Date(bid.bidTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-right">
                    <div className="text-base sm:text-lg font-black text-white font-mono tracking-tight">
                      ₹{bid.amount.toLocaleString()}
                    </div>
                    {index > 0 && (
                      <div className="text-[11px] text-rose-400 font-mono">
                        +₹{(bid.amount - bids[0].amount).toLocaleString()} behind L1
                      </div>
                    )}
                  </div>

                  {/* Award Button (Visible to Buyers for L1 position) */}
                  {isBuyer && !isAwarded && (
                    <button
                      onClick={() => onAwardBid(bid._id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isL1
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-md shadow-emerald-500/20 hover:scale-105'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      {isL1 ? 'Award L1' : 'Award'}
                    </button>
                  )}
                </div>
              </div>

              {bid.offerDetails && (
                <div className="mt-2.5 pt-2 border-t border-neutral-800/60 text-xs text-neutral-400">
                  <span className="text-neutral-500 font-medium">Specs: </span>
                  {bid.offerDetails}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
