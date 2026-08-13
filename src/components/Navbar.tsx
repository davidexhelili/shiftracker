// src/components/Navbar.tsx
import React from 'react';

export type ActiveTab = 'home' | 'earnings' | 'history';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  shiftsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  shiftsCount,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-40 px-2 py-1.5 pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-3 gap-1 items-center">
        {/* Tab 1: Home / Inserimento */}
        <button
          onClick={() => setActiveTab('home')}
          className={`w-full flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
            activeTab === 'home'
              ? 'text-emerald-400 font-bold bg-emerald-500/15'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-xl leading-none mb-1">🏠</span>
          <span className="text-[11px] leading-tight">Home</span>
        </button>

        {/* Tab 2: Guadagni */}
        <button
          onClick={() => setActiveTab('earnings')}
          className={`w-full flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
            activeTab === 'earnings'
              ? 'text-emerald-400 font-bold bg-emerald-500/15'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-xl leading-none mb-1">💰</span>
          <span className="text-[11px] leading-tight">Guadagni</span>
        </button>

        {/* Tab 3: Turni e Archivi */}
        <button
          onClick={() => setActiveTab('history')}
          className={`w-full flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
            activeTab === 'history'
              ? 'text-emerald-400 font-bold bg-emerald-500/15'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative inline-flex items-center justify-center mb-1">
            <span className="text-xl leading-none">📋</span>
            {shiftsCount > 0 && (
              <span className="absolute -top-1 -right-3 bg-emerald-500 text-slate-950 text-[10px] font-black rounded-full h-4 min-w-4 px-1 flex items-center justify-center border border-slate-900 shadow">
                {shiftsCount > 99 ? '99+' : shiftsCount}
              </span>
            )}
          </div>
          <span className="text-[11px] leading-tight">Turni & Archivi</span>
        </button>
      </div>
    </nav>
  );
};
