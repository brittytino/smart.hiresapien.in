'use client';

import React from 'react';
import { DOMAINS, Domain } from '@/lib/domains';

interface DomainNavbarProps {
  selectedDomain: Domain | null;
  onSelect: (domain: Domain) => void;
}

export default function DomainNavbar({ selectedDomain, onSelect }: DomainNavbarProps) {
  const sortedDomains = [...DOMAINS].sort((a, b) => {
    if (a.number === 'G') return 1;
    if (b.number === 'G') return -1;
    return a.number.localeCompare(b.number);
  });
  


  return (
    <div className="fixed bottom-8 right-8 z-100 flex items-center gap-2 bg-white/80 backdrop-blur-xl border border-slate-200/50 p-2 rounded-full shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] animate-in slide-in-from-right-10 duration-700 hover:scale-105 transition-transform">
      <div className="flex items-center gap-1.5 px-2">
         {sortedDomains.map((domain) => {
           const isActive = selectedDomain?.id === domain.id;
           return (
             <button
               key={domain.id}
               onClick={() => onSelect(domain)}
               title={domain.name}
               className={`group relative w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                 isActive 
                   ? 'bg-[#D62027] text-white shadow-lg shadow-[#D62027]/30 scale-110' 
                   : 'bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 hover:scale-105 border border-slate-100'
               }`}
             >
               {domain.number}
               
               {/* Tooltip on Hover */}
               <div className="absolute bottom-full mb-3 right-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                 <div className="bg-[#000000] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                   {domain.name}
                 </div>
                 <div className="w-2 h-2 bg-[#000000] rotate-45 mx-auto -mt-1 origin-center" />
               </div>
             </button>
           );
         })}
      </div>
    </div>
  );
}
