'use client';

import React from 'react';
import { Play } from 'lucide-react';

interface EvaluateButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
}

export default function EvaluateButton({ 
  onClick, 
  isLoading, 
  disabled, 
  variant = 'primary',
  className = ''
}: EvaluateButtonProps) {
  const baseStyles = "flex items-center gap-2 rounded-xl px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#D62027] text-white shadow-lg shadow-[#D62027]/20 hover:bg-[#b01a20]",
    secondary: "bg-black text-white shadow-lg shadow-black/10 hover:bg-zinc-800",
    outline: "bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50 shadow-sm"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <Play className="w-3.5 h-3.5 fill-current" />
      )}
      Evaluate
    </button>
  );
}
