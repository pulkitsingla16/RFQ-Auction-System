import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { db, initDatabase } from './lib/db';
import Header from './components/Header';
import Home from './pages/Home';
import CreateRFQ from './pages/CreateRFQ';
import AuctionPage from './pages/AuctionPage';
import { Code2, Heart, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    initDatabase();
    setCurrentUser(db.getCurrentUser());
  }, []);

  const handleUserSwitch = (user) => {
    db.setCurrentUser(user);
    setCurrentUser(user);
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-neutral-950">
      {/* Top Header */}
      <Header user={currentUser} onUserSwitch={handleUserSwitch} />

      {/* Main App Routes */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home user={currentUser} />} />
          <Route path="/create-rfq" element={<CreateRFQ user={currentUser} />} />
          <Route path="/auction/:id" element={<AuctionPage user={currentUser} />} />
        </Routes>
      </main>

      {/* Clean Footer by Pulkit Singla */}
      <footer className="border-t border-neutral-900 bg-neutral-950/80 px-4 py-8 mt-16 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white font-mono">REVISE OS</span>
            <span>•</span>
            <span>British-style Reverse Auction Infrastructure</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/pulkitsingla16"
              target="_blank"
              rel="noreferrer"
              className="text-neutral-400 hover:text-emerald-400 flex items-center gap-1.5 transition-colors font-medium"
            >
              <Code2 className="w-4 h-4" />
              github.com/pulkitsingla16
            </a>
            <span>•</span>
            <span className="text-neutral-400">
              Authored by <strong className="text-white">Pulkit Singla</strong>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
