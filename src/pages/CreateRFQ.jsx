import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/db';
import { aiAssistant } from '../lib/aiAssistant';
import { PlusCircle, Sparkles, MapPin, Calendar, Clock, DollarSign, ShieldCheck, ArrowRight } from 'lucide-react';

export default function CreateRFQ({ user }) {
  const navigate = useNavigate();

  // Form states
  const [title, setTitle] = useState('500-Ton Intermodal Freight Transit');
  const [origin, setOrigin] = useState('New Delhi ICD Tughlakabad');
  const [destination, setDestination] = useState('JNPT Port, Mumbai');
  const [cargoWeightTonnes, setCargoWeightTonnes] = useState(40);
  const [cargoType, setCargoType] = useState('cold-chain');
  const [description, setDescription] = useState('Temperature-controlled containers (-20°C). 24/7 telematics tracking required.');
  const [estimatedBudget, setEstimatedBudget] = useState(420000);
  const [currency, setCurrency] = useState('INR');

  // British Auction Parameters
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [triggerWindowMinutes, setTriggerWindowMinutes] = useState(3);
  const [extensionDurationMinutes, setExtensionDurationMinutes] = useState(2);
  const [forcedOvertimeMinutes, setForcedOvertimeMinutes] = useState(60);

  const [aiBenchmark, setAiBenchmark] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRunAiEstimator = () => {
    const result = aiAssistant.estimateBenchmarkRate({
      origin,
      destination,
      cargoWeightTonnes: Number(cargoWeightTonnes),
      cargoType
    });
    setAiBenchmark(result);
    setEstimatedBudget(result.predictedFairMarketPrice);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      // 1. Create RFQ
      const rfq = db.createRFQ({
        title,
        origin,
        destination,
        cargoWeightTonnes: Number(cargoWeightTonnes),
        description,
        estimatedBudget: Number(estimatedBudget),
        currency,
        pickupDate: new Date(Date.now() + 86400000 * 3).toISOString()
      });

      // 2. Create Reverse Auction with British Parameters
      const now = Date.now();
      const bidStartTime = new Date(now).toISOString();
      const bidCloseTime = new Date(now + durationMinutes * 60000).toISOString();
      const forcedCloseTime = new Date(now + (durationMinutes + Number(forcedOvertimeMinutes)) * 60000).toISOString();

      const auction = db.createAuction({
        rfqId: rfq._id,
        reservePrice: Number(estimatedBudget),
        bidStartTime,
        bidCloseTime,
        forcedCloseTime,
        triggerWindowMinutes: Number(triggerWindowMinutes),
        extensionDurationMinutes: Number(extensionDurationMinutes)
      });

      navigate(`/auction/${auction._id}`);
    } catch (err) {
      setError(err.message || 'Failed to initialize RFQ and Auction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <PlusCircle className="w-7 h-7 text-emerald-400" />
          Deploy Request for Quotation (RFQ)
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Specify transit lane criteria and configure British-style reverse auction rules.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Logistics Specs */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">
            1. Freight Lane & Cargo Parameters
          </h3>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              RFQ Title / Lane Identifier
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Origin Facility
              </label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-400" /> Destination Port / Hub
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Weight (Tonnes)
              </label>
              <input
                type="number"
                value={cargoWeightTonnes}
                onChange={(e) => setCargoWeightTonnes(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Cargo Classification
              </label>
              <select
                value={cargoType}
                onChange={(e) => setCargoType(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="cold-chain">Pharma Cold-Chain (-20°C)</option>
                <option value="standard">Standard Dry Van / Bulk</option>
                <option value="hazmat">Chemical / Hazardous</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Reserve Target Budget (₹ INR)
              </label>
              <input
                type="number"
                value={estimatedBudget}
                onChange={(e) => setEstimatedBudget(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* AI Benchmark Tool Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleRunAiEstimator}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Calculate AI Lane Benchmark Rate
            </button>
          </div>

          {aiBenchmark && (
            <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-emerald-500/30 text-xs text-neutral-300 space-y-1">
              <div className="text-emerald-400 font-bold flex items-center justify-between">
                <span>AI Predicted Fair Benchmark: ₹{aiBenchmark.predictedFairMarketPrice.toLocaleString()}</span>
                <span>Confidence: {aiBenchmark.confidenceScore}%</span>
              </div>
              <p className="text-neutral-400 text-[11px]">{aiBenchmark.logicSummary}</p>
            </div>
          )}
        </div>

        {/* Step 2: British Auction Rules */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-teal-400">
            2. British Reverse Auction Dynamics
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Duration (Min)
              </label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                required
              />
              <span className="text-[10px] text-neutral-500">Initial bidding window</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Trigger Window (Min)
              </label>
              <input
                type="number"
                value={triggerWindowMinutes}
                onChange={(e) => setTriggerWindowMinutes(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                required
              />
              <span className="text-[10px] text-neutral-500">Last X min triggers extension</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Extension Added (Min)
              </label>
              <input
                type="number"
                value={extensionDurationMinutes}
                onChange={(e) => setExtensionDurationMinutes(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                required
              />
              <span className="text-[10px] text-neutral-500">Time appended per trigger</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Forced Overtime Cap (Min)
              </label>
              <input
                type="number"
                value={forcedOvertimeMinutes}
                onChange={(e) => setForcedOvertimeMinutes(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                required
              />
              <span className="text-[10px] text-neutral-500">Hard close ceiling</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-400 text-neutral-950 hover:from-emerald-400 hover:to-teal-300 transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.99] flex items-center justify-center gap-2"
        >
          {loading ? 'Launching Reverse Auction...' : 'Deploy Live RFQ & Start Bidding Clock'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
