/**
 * AI Smart Bidding & Procurement Advisory Assistant
 * Author: Pulkit Singla (https://github.com/pulkitsingla16)
 *
 * Designed to be 100% understandable and explainable in interviews:
 * 1. AI Rate Estimator (Linear Distance & Cargo Regression)
 * 2. AI Bid Strategy Recommendation (Dynamic spread calculation)
 * 3. AI Reverse Auction Risk Checker (Detects overtime fatigue & aggressive undercut)
 */

export const aiAssistant = {
  /**
   * 1. Smart Baseline Fare Estimator
   * Explains to interviewers: "Given cargo weight and distance between hubs,
   * our heuristic AI predicts fair benchmark pricing based on historical fuel & freight toll coefficients."
   */
  estimateBenchmarkRate: ({ origin, destination, cargoWeightTonnes, cargoType = 'standard' }) => {
    // Distance heuristics between major Indian transit hubs
    let estimatedKm = 1100;
    const combined = `${origin} ${destination}`.toLowerCase();
    if (combined.includes('delhi') && combined.includes('mumbai')) estimatedKm = 1420;
    else if (combined.includes('bengaluru') && combined.includes('chennai')) estimatedKm = 350;
    else if (combined.includes('kolkata') && combined.includes('delhi')) estimatedKm = 1530;
    else if (combined.includes('hyderabad') && combined.includes('mumbai')) estimatedKm = 720;

    const basePerKmPerTonne = 2.45; // INR per Tonne-Km
    const coldChainMultiplier = combined.includes('pharma') || combined.includes('cold') ? 1.45 : 1.15;
    const tollAndLoadingBase = 18000;

    const rawEstimate = Math.round(
      (estimatedKm * (cargoWeightTonnes || 20) * basePerKmPerTonne * coldChainMultiplier) + tollAndLoadingBase
    );

    return {
      estimatedKm,
      predictedFairMarketPrice: rawEstimate,
      suggestedReservePrice: Math.round(rawEstimate * 0.94),
      confidenceScore: 92,
      logicSummary: `AI calculated baseline transit over ${estimatedKm} km at ₹${basePerKmPerTonne}/tonne-km with a ${coldChainMultiplier}x specialized reefer/cleanroom multiplier.`
    };
  },

  /**
   * 2. Supplier Bid Strategy Advisor
   * Explains to interviewers: "Analyzes current L1 leader, spread, and remaining clock to tell
   * the supplier how much to undercut to maximize win probability without sacrificing profit margins."
   */
  generateBidRecommendation: ({ currentLowestBid, currentSupplierBid, remainingSeconds }) => {
    if (!currentLowestBid) {
      return {
        recommendedBid: 390000,
        strategy: 'Initial Price Leader',
        advice: 'No active bids yet. Place your benchmark opening bid below the buyer’s reserve price to anchor the L1 position.',
        winProbability: 85
      };
    }

    const isL1 = currentSupplierBid && currentSupplierBid <= currentLowestBid;
    if (isL1) {
      return {
        recommendedBid: currentLowestBid,
        strategy: 'Maintain Position (Defense Mode)',
        advice: 'You currently hold the #1 (L1) rank. Do not lower your bid unnecessarily unless another supplier undercuts you.',
        winProbability: 94
      };
    }

    // Recommended aggressive vs conservative decrement
    const spread = currentSupplierBid ? currentSupplierBid - currentLowestBid : currentLowestBid * 0.05;
    const smartStep = Math.max(2000, Math.round(currentLowestBid * 0.015)); // 1.5% smart undercut
    const recommendedBid = currentLowestBid - smartStep;

    const urgency = remainingSeconds < 180 ? 'HIGH (Overtime Imminent)' : 'NORMAL';

    return {
      recommendedBid,
      smartStep,
      strategy: remainingSeconds < 180 ? 'Snipe Under-cut' : 'Steady Margin Drop',
      advice: `Undercut the current L1 (₹${currentLowestBid.toLocaleString()}) by ₹${smartStep.toLocaleString()} to take the #1 rank. In reverse auctions, smaller strategic drops protect your fleet profit margin.`,
      winProbability: remainingSeconds < 180 ? 78 : 65,
      urgency
    };
  },

  /**
   * 3. Auction Health & Risk Analysis for Buyers
   * Explains to interviewers: "Monitors auction liquidity, extension counts, and price convergence."
   */
  analyzeAuctionHealth: ({ totalBids, totalExtensionsCount, startingBudget, currentLowestBid }) => {
    const savings = startingBudget && currentLowestBid ? startingBudget - currentLowestBid : 0;
    const savingsPercentage = startingBudget ? ((savings / startingBudget) * 100).toFixed(1) : 0;

    let healthStatus = 'Healthy Competition';
    let recommendations = 'Active supplier participation observed.';

    if (totalBids === 0) {
      healthStatus = 'Low Supplier Liquidity';
      recommendations = 'Consider sharing the RFQ link or relaxing transit delivery SLAs.';
    } else if (totalExtensionsCount >= 4) {
      healthStatus = 'High Overtime Heat';
      recommendations = 'Suppliers are fiercely contesting in the final 2 minutes. The price is rapidly converging towards the floor.';
    }

    return {
      healthStatus,
      totalSavingsInr: Math.max(0, savings),
      savingsPercentage: Math.max(0, savingsPercentage),
      recommendations,
      marketCompetitivenessScore: Math.min(98, 40 + (totalBids * 12) + (totalExtensionsCount * 5))
    };
  }
};
