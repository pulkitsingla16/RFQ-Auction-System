import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../lib/db';
import { aiAssistant } from '../lib/aiAssistant';
import AuctionTimer from '../components/AuctionTimer';
import Leaderboard from '../components/Leaderboard';
import BidForm from '../components/BidForm';
import AuditLogViewer from '../components/AuditLogViewer';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, MapPin, Calendar, Truck, ShieldCheck, Sparkles, 
  TrendingDown, CheckCircle2, AlertTriangle, RefreshCw, Award
} from 'lucide-react';

export default function AuctionPage({ user }) {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [logs, setLogs] = useState([]);
  const [notification, setNotification] = useState(null);

  const loadData = () => {
    const data = db.getAuctionById(id);
    if (data) {
      setAuction(data);
      setBids(db.getBids(id));
      setLogs(db.getLogs(id));
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2500);
    return () => clearInterval(interval);
  }, [id]);

  const handleBidSubmitted = (bidData) => {
    try {
      const res = db.placeBid({
        auctionId: id,
        ...bidData
      });

      if (res.extensionTriggered) {
        setNotification({
          type: 'extension',
          message: `⚡ British-style Auto-Extension triggered! Close time extended to ${new Date(res.newCloseTime).toLocaleTimeString()}.`
        });
      } else {
        setNotification({
          type: 'success',
          message: `✅ Bid of ₹${bidData.amount.toLocaleString()} placed! You now hold the L1 position.`
        });
      }

      loadData();
      setTimeout(() => setNotification(null), 6000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAwardBid = (bidId) => {
    if (!window.confirm('Are you sure you want to award this contract to the selected supplier and close bidding?')) {
      return;
    }
    try {
      const result = db.awardContract(id, bidId);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setNotification({
        type: 'awarded',
        message: `🏆 Contract formally awarded to ${result.winningBid.supplierName} for ₹${result.winningBid.amount.toLocaleString()}!`
      });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (!auction) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Auction Not Found</h2>
        <p className="text-neutral-400 text-sm mb-6">The requested reverse auction ID does not exist in local storage.</p>
        <Link to="/" className="px-4 py-2 rounded-xl bg-emerald-500 text-neutral-950 font-bold text-sm">
          Return to Hub
        </Link>
      </div>
    );
  }

  const rfq = auction.rfq;
  const currentLowest = bids.length > 0 ? bids[0].amount : auction.reservePrice;
  const initialBudget = rfq?.estimatedBudget || 450000;
  const totalSavings = initialBudget - (currentLowest || initialBudget);
  const savingsPct = ((totalSavings / initialBudget) * 100).toFixed(1);

  // AI Health Check
  const aiHealth = aiAssistant.analyzeAuctionHealth({
    totalBids: bids.length,
    totalExtensionsCount: auction.totalExtensionsCount || 0,
    startingBudget: initialBudget,
    currentLowestBid: currentLowest
  });

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-6">
      {/* Top Header / Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Live Hub
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {rfq?.title || 'Reverse Logistics Auction'}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider font-mono ${
              auction.status === 'awarded'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                : auction.status === 'active'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-neutral-800 text-neutral-400'
            }`}>
              {auction.status}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            {rfq?.description}
          </p>
        </div>

        {/* Quick Route Pills */}
        <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 p-2 rounded-xl text-xs">
          <div className="flex items-center gap-1 text-neutral-300 font-medium">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>{rfq?.origin?.split(',')[0]}</span>
          </div>
          <span className="text-neutral-600">➔</span>
          <div className="flex items-center gap-1 text-neutral-300 font-medium">
            <MapPin className="w-3.5 h-3.5 text-teal-400" />
            <span>{rfq?.destination?.split(',')[0]}</span>
          </div>
        </div>
      </div>

      {/* Dynamic Notification Alert */}
      {notification && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
          notification.type === 'extension'
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            : notification.type === 'awarded'
            ? 'bg-teal-500/20 border-teal-500/40 text-teal-200'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-neutral-400 hover:text-white ml-2">✕</button>
        </div>
      )}

      {/* Auction Timer & Top KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AuctionTimer auction={auction} />
        </div>

        {/* KPI Panel */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">Current Winning Price (L1):</span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                ₹{currentLowest ? currentLowest.toLocaleString() : '---'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Buyer Target Budget:</span>
              <span className="text-neutral-300 font-mono">₹{initialBudget.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Procurement Savings:</span>
              <span className="text-teal-400 font-bold font-mono">
                ₹{Math.max(0, totalSavings).toLocaleString()} ({Math.max(0, savingsPct)}%)
              </span>
            </div>
          </div>

          {/* AI Market Competitiveness badge */}
          <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-neutral-400">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              AI Liquidity Score:
            </span>
            <span className="font-bold text-emerald-300 font-mono">{aiHealth.marketCompetitivenessScore}/100</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Leaderboard + Bid Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Leaderboard 
            bids={bids} 
            user={user} 
            auction={auction} 
            onAwardBid={handleAwardBid} 
          />

          <AuditLogViewer logs={logs} />
        </div>

        <div className="space-y-6">
          {auction.status === 'active' ? (
            <BidForm 
              auction={auction} 
              currentBids={bids} 
              user={user} 
              onBidSubmitted={handleBidSubmitted} 
            />
          ) : (
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 text-center">
              <Award className="w-10 h-10 text-teal-400 mx-auto mb-2" />
              <h4 className="text-white font-bold text-sm">
                {auction.status === 'awarded' ? 'Auction Awarded & Closed' : 'Auction Not Active'}
              </h4>
              <p className="text-neutral-400 text-xs mt-1">
                {auction.status === 'awarded' 
                  ? 'The contract negotiation is finalized and logged in the immutable audit trail.' 
                  : 'Bids can only be placed while the auction state is active.'}
              </p>
            </div>
          )}

          {/* AI Auction Health Insights Card */}
          <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-5 text-xs space-y-3">
            <div className="flex items-center gap-2 text-white font-bold">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>AI Procurement Advisory</span>
            </div>
            <p className="text-neutral-400 leading-relaxed">
              {aiHealth.recommendations}
            </p>
            <div className="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80 text-[11px] text-neutral-300 font-mono">
              Status: <strong className="text-emerald-400">{aiHealth.healthStatus}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
