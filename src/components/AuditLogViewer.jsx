import React from 'react';
import { History, ShieldCheck, Zap, AlertCircle, ArrowUpRight } from 'lucide-react';

export default function AuditLogViewer({ logs }) {
  if (!logs || logs.length === 0) {
    return null;
  }

  return (
    <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            Compliance Audit Trail
          </h4>
          <p className="text-xs text-neutral-400">
            Immutable log of all bidding actions, extensions, and contract awards.
          </p>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
          {logs.length} Events
        </span>
      </div>

      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
        {logs.map((log) => {
          let eventIcon = <Zap className="w-3.5 h-3.5 text-emerald-400" />;
          let label = 'Bid Placed';

          if (log.eventType === 'extension_triggered') {
            eventIcon = <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />;
            label = 'British Extension Triggered';
          } else if (log.eventType === 'bid_awarded') {
            eventIcon = <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />;
            label = 'Contract Formally Awarded';
          } else if (log.eventType === 'auction_created') {
            eventIcon = <AlertCircle className="w-3.5 h-3.5 text-sky-400" />;
            label = 'Auction Initialized';
          }

          return (
            <div
              key={log._id}
              className="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80 flex items-start justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5">{eventIcon}</div>
                <div>
                  <div className="font-semibold text-neutral-200">{label}</div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    {log.details?.supplierName && (
                      <span>Supplier: <strong className="text-neutral-300">{log.details.supplierName}</strong> | </span>
                    )}
                    {log.details?.amount && (
                      <span>Quote: <strong className="text-emerald-400 font-mono">₹{log.details.amount.toLocaleString()}</strong></span>
                    )}
                    {log.details?.extendedByMinutes && (
                      <span>Extended by <strong className="text-amber-400">+{log.details.extendedByMinutes} min</strong></span>
                    )}
                    {log.details?.awardedTo && (
                      <span>Awarded to <strong className="text-teal-300">{log.details.awardedTo}</strong> for ₹{log.details.winningAmount?.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>

              <span className="text-[10px] text-neutral-500 font-mono shrink-0">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
