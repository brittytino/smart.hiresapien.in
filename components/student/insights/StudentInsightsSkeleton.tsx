'use client';

import React from 'react';

export function StudentInsightsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* 0.1 Domain radar spectrum skeleton */}
      <div className="bg-white rounded-[28px] p-6 md:p-8 border border-slate-200 shadow-sm no-hover">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <div className="h-2 w-32 bg-slate-100 rounded-full" />
            <div className="h-6 w-64 bg-slate-100 rounded-full" />
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          <div className="w-full lg:w-1/2 flex items-center justify-center h-64">
            <div className="w-48 h-48 rounded-full border-4 border-slate-50 border-dashed" />
          </div>
          <div className="w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-slate-50 rounded-2xl border border-slate-100" />
            ))}
          </div>
        </div>
      </div>

      {/* Live Assignment Skeleton */}
      <div className="bg-slate-50 rounded-[28px] p-6 md:p-8 border border-slate-100 flex flex-col lg:flex-row gap-10">
        <div className="flex-1 space-y-4">
          <div className="h-2 w-24 bg-slate-200 rounded-full" />
          <div className="h-10 w-full bg-slate-200 rounded-xl" />
          <div className="h-4 w-2/3 bg-slate-200 rounded-full" />
        </div>
        <div className="lg:w-100 h-48 bg-white rounded-2xl border border-slate-100" />
      </div>

      {/* Skill Spectrum Section Skeleton */}
      <div className="mt-12 space-y-6 pt-12 border-t border-slate-100">
        <div className="flex flex-col gap-1 mb-8">
           <div className="h-8 w-64 bg-slate-100 rounded-lg" />
           <div className="h-2 w-32 bg-slate-100 rounded-full mt-2" />
        </div>
        <div className="bg-white rounded-4xl p-8 md:p-12 border border-slate-100 shadow-sm h-100 flex items-center justify-center">
           <div className="w-64 h-64 rounded-full border-8 border-slate-50 border-double opacity-20" />
        </div>
      </div>
    </div>
  );
}
