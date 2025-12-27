
import React from 'react';

interface HeaderProps {
  isPro: boolean;
  onOpenPanel: () => void;
  onHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ isPro, onOpenPanel, onHome }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
        <div 
          onClick={onHome}
          className="cursor-pointer group"
        >
          <h1 className="text-2xl font-black text-green-600 tracking-tighter group-hover:scale-105 transition-transform">
            MAÑANA
          </h1>
          <p className="hidden sm:block text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Clases listas
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isPro ? (
            <button 
              onClick={onOpenPanel}
              className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-full"
            >
              <span className="text-sm">👑</span>
              <span className="text-xs font-bold text-yellow-700">MIEMBRO PRO</span>
            </button>
          ) : (
            <button 
              onClick={onOpenPanel}
              className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              🚀 SUBIR A PRO
            </button>
          )}
          
          <button 
            onClick={onOpenPanel}
            className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
