import React from 'react';
import { Sparkles, ShieldCheck, RotateCcw } from 'lucide-react';

interface HeaderProps {
  onRestart?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onRestart }) => {
  return (
    <header className="bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <span className="text-xl sm:text-2xl font-black tracking-tight font-heading select-none">
              <span className="text-[#1d1f3e]">POOL</span>
              <span className="text-[#1aabbb]">Hero</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="text-slate-300">·</span>
            <span className="text-slate-600 font-semibold">Der Helfer bei Pool-Problemen</span>
            <span className="text-slate-300">·</span>
            <span className="text-[#159ba9] font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#1aabbb]" />
              Interaktive Wasseranalyse
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {onRestart && (
            <button
              type="button"
              onClick={onRestart}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-200/70 text-xs font-semibold transition-all cursor-pointer"
              title="Neu starten"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#159ba9]" />
              <span className="hidden sm:inline">Neu starten</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-50/70 text-[#159ba9] text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Kostenlose Diagnose</span>
          </div>
        </div>
      </div>
    </header>
  );
};


