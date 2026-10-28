import React, { useState } from 'react';
import { aiAssistant } from '../lib/aiAssistant';
import { Sparkles, TrendingDown, ShieldAlert, Award, ArrowDownRight, CheckCircle2 } from 'lucide-react';

export default function BidForm({ auction, currentBids, user, onBidSubmitted }) {
  const [amount, setAmount] = useState('');
  const [offerDetails, setOfferDetails] = useState('');
  const [deliveryTimeline, setDeliveryTimeline] = useState('24 Hours');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAiAdvisor, setShowAiAdvisor] = useState(true);

  const currentLowest = currentBids.length > 0 ? currentBids[0].amount : (auction.reservePrice || 400000);
  const myLowestBid = currentBids.find((b) => b.supplierId === user._id)?.amount;

  // AI Recommendation
  const aiAdvice = aiAssistant.generateBidRecommendation({
    currentLowestBid: currentLowest,
    currentSupplierBid: myLowestBid,
    remainingSeconds: 600
  });

  const handleApplyAiBid = () => {
    setAmount(aiAdvice.recommendedBid.toString());
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError('Please provide a valid bid amount above ₹0.');
      return;
    }

    if (numericAmount >= currentLowest) {
      setError(`Reverse Auction Rule: Your bid must undercut current lowest (₹${currentLowest.toLocaleString()}).`);
      return;
    }

    setLoading(true);
    try {
      onBidSubmitted({
        amount: numericAmount,
        offerDetails: offerDetails.trim() || 'Express transit guarantee with ISO-standard tie-downs.',
        deliveryTimeline
      });
      setAmount('');
      setOfferDetails('');
    } catch (err) {
      setError(err.message || 'Failed to place bid.');
    } finally {
      setLoading(false);
    }
  };

  const isBuyer = user.role === 'buyer';

  if (isBuyer) {
    return (
      <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center mb-3 border border-amber-500/20">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h4 className="text-white font-semibold text-base mb-1">Buyer Observation Mode</h4>
        <p className="text-neutral-400 text-xs max-w-sm mx-auto mb-4 leading-relaxed">
          You are currently logged in as <strong>{user.fullName} (Buyer)</strong>. Buyers monitor incoming bids and award contracts. To place test bids, switch to a Supplier using the simulator dropdown in the top header.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm relative overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-emerald-400" />
            Submit Competitive Bid
          </h3>
          <p className="text-xs text-neutral-400">
            Reverse auction: Lowest compliant price captures the L1 contract position.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAiAdvisor(!showAiAdvisor)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          {showAiAdvisor ? 'Hide AI Assist' : 'AI Bid Advisor'}
        </button>
      </div>

      {/* AI Smart Advisor Banner */}
      {showAiAdvisor && (
        <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-teal-950/30 border border-emerald-500/30 relative">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono uppercase tracking-wider">
                  AI Strategy: {aiAdvice.strategy}
                </span>
                <span className="text-[11px] text-neutral-400 font-medium">
                  Win Probability: <strong className="text-emerald-400">{aiAdvice.winProbability}%</strong>
                </span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed pt-1">
                {aiAdvice.advice}
              </p>
            </div>

            <button
              type="button"
              onClick={handleApplyAiBid}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-neutral-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20 transition-all hover:scale-105"
            >
              Apply ₹{aiAdvice.recommendedBid.toLocaleString()}
              <ArrowDownRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              Bid Amount (INR ₹)
            </label>
            <span className="text-[11px] text-neutral-400">
              Target to beat: <strong className="text-white">₹{(currentLowest - 1).toLocaleString()}</strong>
            </span>
          </div>

          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-mono font-bold">
              ₹
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`e.g. ${currentLowest - 2000}`}
              className="w-full pl-8 pr-4 py-2.5 bg-neutral-950/80 border border-neutral-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-neutral-600"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Guaranteed Transit Timeline
            </label>
            <select
              value={deliveryTimeline}
              onChange={(e) => setDeliveryTimeline(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-950/80 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="20 Hours (Ultra-Express)">20 Hours (Ultra-Express)</option>
              <option value="24 Hours (Express)">24 Hours (Express)</option>
              <option value="28 Hours (Standard)">28 Hours (Standard)</option>
              <option value="36 Hours (Economy)">36 Hours (Economy)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Specialized Service Add-On
            </label>
            <input
              type="text"
              value={offerDetails}
              onChange={(e) => setOfferDetails(e.target.value)}
              placeholder="e.g. Air-ride suspension, telematics live feed"
              className="w-full px-3 py-2 bg-neutral-950/80 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500 placeholder:text-neutral-600"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-400 text-neutral-950 hover:from-emerald-400 hover:to-teal-300 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? 'Transmitting Bid...' : `Submit Undercut Bid (${user.company || user.fullName})`}
        </button>
      </form>
    </div>
  );
}
