'use client';

import React from 'react';
import { DOMAINS, Domain } from '@/lib/domains';
import { ChevronRight } from 'lucide-react';

export default function DomainSelector({ onSelect }: { onSelect: (domain: Domain) => void }) {
  const sortedDomains = [...DOMAINS].sort((a, b) => {
    if (a.number === 'G') return 1;
    if (b.number === 'G') return -1;
    return a.number.localeCompare(b.number);
  });

  return (
    <div className="w-full">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {sortedDomains.map((domain) => (
          <button
            key={domain.id}
            onClick={() => onSelect(domain)}
            className="group relative flex flex-col bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 text-center transition-all duration-500 hover:border-[#D62027] hover:shadow-[0_45px_90px_-25px_rgba(230,39,39,0.12)] hover:-translate-y-2 active:scale-[0.98] overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute inset-0 bg-linear-to-br from-[#D62027]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 w-full flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-[#000000] text-white font-black text-2xl shadow-xl group-hover:bg-[#D62027] transition-colors duration-500 flex items-center justify-center mb-6">
                {domain.number}
              </div>
              
              <h3 className="text-2xl font-black text-[#000000] tracking-tight uppercase mb-2 group-hover:text-[#D62027] transition-colors duration-300">
                {domain.name}
              </h3>
              
              <span className="text-[10px] font-black tracking-[0.25em] text-[#D62027] uppercase mb-10">
                {domain.assessmentType}
              </span>

              <div className="w-full mb-12">
                <div className="flex items-center justify-center gap-3 mb-5">
                   <div className="h-px bg-slate-100 flex-1" />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
                     Core Topics
                   </span>
                   <div className="h-px bg-slate-100 flex-1" />
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {Array.from(
                    new Set(domain.skills.map((skill) => skill.split(' - ')[0].trim()))
                  ).sort((a, b) => a.localeCompare(b)).map((skill) => (
                    <span
                      key={skill}
                      className="px-4 py-2 bg-slate-50/50 border border-slate-100 text-[#000000] text-[10px] font-bold rounded-xl shadow-sm group-hover:bg-white group-hover:border-[#D62027]/20 transition-all duration-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-auto w-full inline-flex items-center justify-center gap-2 text-white font-black text-xs uppercase tracking-widest bg-[#D62027] px-8 py-4 rounded-2xl hover:bg-[#cc1f1f] transition-all shadow-lg group-hover:scale-[1.03] group-hover:shadow-[#D62027]/20">
                <span>Start Contributing</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
