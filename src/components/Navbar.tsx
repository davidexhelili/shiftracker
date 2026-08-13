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
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-40 px-4 py-2">
      <div className="max-w-md mx-auto flex justify-around items-center">
        {/* Tab 1: Home / Inserimento */}
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all ${
            activeTab === 'home'
              ? 'text-emerald-400 font-bold bg-emerald-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-xl">🏠</span>
          <span className="text-[11px]">Home</span>
        </button>

        {/* Tab 2: Guadagni */}
        <button
          onClick={() => setActiveTab('earnings')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all ${
            activeTab === 'earnings'
              ? 'text-emerald-400 font-bold bg-emerald-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-xl">💰</span>
          <span className="text-[11px]">Guadagni</span>
        </button>

        {/* Tab 3: Turni e Archivi */}
        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all relative ${
            activeTab === 'history'
              ? 'text-emerald-400 font-bold bg-emerald-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-xl">📋</span>
          <span className="text-[11px]">Turni & Archivi</span>
          {shiftsCount > 0 && (
            <span className="absolute top-0 right-3 bg-emerald-500 text-slate-950 text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center">
              {shiftsCount > 99 ? '99+' : shiftsCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};
