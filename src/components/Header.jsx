import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { db } from '../lib/db';
import { Gavel, PlusCircle, LayoutDashboard, UserCheck, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';

export default function Header({ user, onUserSwitch }) {
  const location = useLocation();
  const allUsers = db.getUsers();

  const handleRoleSelect = (e) => {
    const selected = allUsers.find((u) => u._id === e.target.value);
    if (selected) {
      onUserSwitch(selected);
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-neutral-950/80 border-b border-neutral-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-neutral-950 font-black shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Gavel className="w-5 h-5 text-neutral-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white font-mono">REVISE</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                v2.0 OS
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 tracking-wide font-medium flex items-center gap-1">
              Reverse Auction Engine by{' '}
              <a
                href="https://github.com/pulkitsingla16"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:text-emerald-300 underline font-semibold flex items-center gap-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                Pulkit Singla
                <ExternalLink className="w-2.5 h-2.5 inline" />
              </a>
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-neutral-900/60 p-1 rounded-xl border border-neutral-800">
          <Link
            to="/"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              location.pathname === '/'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-400" />
            Live Hub
          </Link>

          <Link
            to="/create-rfq"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              location.pathname === '/create-rfq'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-teal-400" />
            Create RFQ
          </Link>
        </nav>

        {/* User Switcher / Simulator for Interview Demos */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400 bg-neutral-900/80 border border-neutral-800 px-3 py-1.5 rounded-xl">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Simulate:</span>
            <select
              value={user._id}
              onChange={handleRoleSelect}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <optgroup label="Buyer (Admin / Creator)">
                <option value="user_pulkit_buyer">Pulkit Singla (Buyer / Procurement Head)</option>
              </optgroup>
              <optgroup label="Suppliers (Bidders)">
                <option value="supp_apex">Apex TransWorld (Supplier)</option>
                <option value="supp_bluejet">BlueJet Intermodal (Supplier)</option>
                <option value="supp_zenith">Zenith Swift Haulers (Supplier)</option>
              </optgroup>
            </select>
          </div>

          {/* Current User Badge */}
          <div className="flex items-center gap-2.5 bg-neutral-900 border border-neutral-800 py-1 px-2.5 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs border border-emerald-500/30">
              {user.fullName.charAt(0)}
            </div>
            <div className="hidden lg:block text-left text-xs">
              <div className="text-white font-semibold flex items-center gap-1">
                {user.fullName}
                {user.role === 'buyer' && (
                  <ShieldCheck className="w-3 h-3 text-emerald-400" title="Buyer Authority" />
                )}
              </div>
              <div className="text-[10px] text-neutral-400 capitalize">{user.role} role</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
