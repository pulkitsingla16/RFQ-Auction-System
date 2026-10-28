import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../lib/db';
import { 
  PlusCircle, Gavel, ArrowUpRight, Clock, Award, ShieldCheck, 
  MapPin, Sparkles, RefreshCw, BarChart2 
} from 'lucide-react';

export default function Home({ user }) {
  const [auctions, setAuctions] = useState([]);
  const [rfqs, setRfqs] = useState([]);

  const refreshData = () => {
    setAuctions(db.getAuctions());
    setRfqs(db.getRFQs());
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleResetData = () => {
    if (window.confirm('Reset all sample auctions, bids, and audit logs to original defaults?')) {
      db.resetToSampleData();
      refreshData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Hero Banner */}
      <div className="relative rounded-3xl p-6 sm:p-10 overflow-hidden border border-neutral-800 bg-gradient-to-b from-neutral-900/90 to-neutral-950/80 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Designed & Engineered by Pulkit Singla
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            British-Style Reverse Auction OS
          </h1>

          <p className="text-sm sm:text-base text-neutral-400 max-w-2xl leading-relaxed">
            Enterprise procurement platform for high-velocity freight, transit, and cold-chain lanes.
            Features dynamic overtime extensions, real-time L1/L2/L3 leaderboards, and an AI advisory assistant.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/create-rfq"
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-400 text-neutral-950 hover:from-emerald-400 hover:to-teal-300 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Create Live RFQ
            </Link>

            <button
              onClick={handleResetData}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Sample Data
            </button>
          </div>
        </div>
      </div>

      {/* Live Auctions Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Gavel className="w-5 h-5 text-emerald-400" />
              Active Reverse Auctions
            </h2>
            <p className="text-xs text-neutral-400">
              Live bidding rooms with real-time overtime clock management
            </p>
          </div>

          <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-neutral-900 text-neutral-300 border border-neutral-800">
            {auctions.length} Rooms Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {auctions.map((auc) => {
            const rfq = rfqs.find((r) => r._id === auc.rfqId);
            const bids = db.getBids(auc._id);
            const l1Bid = bids.length > 0 ? bids[0] : null;

            return (
              <div
                key={auc._id}
                className="bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700/80 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono ${
                      auc.status === 'awarded'
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                        : auc.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {auc.status}
                    </span>

                    <span className="text-xs text-neutral-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Closes: {new Date(auc.bidCloseTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {rfq?.title || 'Reverse Logistics Auction'}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-neutral-300 bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800/80">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{rfq?.origin?.split(',')[0]}</span>
                    <span className="text-neutral-600">➔</span>
                    <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span className="truncate">{rfq?.destination?.split(',')[0]}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                    <div className="bg-neutral-950/40 p-2.5 rounded-xl border border-neutral-800/60">
                      <span className="text-neutral-500 block text-[11px]">Current L1 Winner</span>
                      <strong className="text-emerald-400 text-sm font-mono block mt-0.5">
                        {l1Bid ? `₹${l1Bid.amount.toLocaleString()}` : `₹${auc.reservePrice?.toLocaleString()}`}
                      </strong>
                    </div>

                    <div className="bg-neutral-950/40 p-2.5 rounded-xl border border-neutral-800/60">
                      <span className="text-neutral-500 block text-[11px]">Leading Carrier</span>
                      <strong className="text-neutral-300 text-xs truncate block mt-0.5">
                        {l1Bid ? l1Bid.supplierName : 'Waiting for bids'}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-neutral-800/80 flex items-center justify-between">
                  <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    {bids.length} Live Quotes Placed
                  </div>

                  <Link
                    to={`/auction/${auc._id}`}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-emerald-500 hover:text-neutral-950 text-white transition-all shadow-sm group-hover:translate-x-1"
                  >
                    Enter Room
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
