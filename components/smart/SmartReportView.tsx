'use client';

import React, { useRef, useState } from 'react';
import { Download, Award, Target, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface SmartReportViewProps {
  reportData: {
    fullName: string;
    email: string;
    phone: string;
    age: number;
    gender: string;
    smartScore: number;
    benchmarkPercentile: number;
    readinessLevel: string;
    competencyScores: Record<string, number>;
    skillGapAnalysis: Array<{ domain: string; score: number; benchmark: number }>;
    learningRecommendations: string[];
    totalDurationSeconds: number;
  };
  onRestart?: () => void;
}

export default function SmartReportView({ reportData, onRestart }: SmartReportViewProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setDownloading(true);

    try {
      // Dynamically import html-to-image to avoid SSR issues
      const { toPng } = await import('html-to-image');
      const element = reportRef.current;
      
      // We wait a tiny bit to ensure any CSS animations are completed before capturing
      await new Promise(resolve => setTimeout(resolve, 500));

      const imgData = await toPng(element, {
        pixelRatio: 2,
        backgroundColor: '#ffffff', // Clean white background print
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });

      // Standard A4 PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      // We need element dimensions to maintain aspect ratio
      const rect = element.getBoundingClientRect();
      const pdfHeight = (rect.height * pdfWidth) / rect.width;
      
      let heightLeft = pdfHeight;
      let position = 0;

      // Add the first page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      // Handle multiple pages if the report is taller than one A4 page
      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      pdf.save(`SMART_Assessment_Report_${reportData.fullName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  const radarData = reportData.skillGapAnalysis.map((item) => ({
    subject: item.domain.replace(' Engineering', '').replace(' Fundamentals', '').replace(' Thinking', '').replace(' & Quality', ''),
    score: item.score,
    benchmark: item.benchmark,
  }));

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins}m ${remainingSecs}s`;
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700 text-slate-800">
      {/* Action buttons */}
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase">
          Assessment Completed
        </h2>
        <div className="flex items-center gap-3">
          {onRestart && (
            <button
              onClick={onRestart}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl py-3 px-5 flex items-center gap-2 cursor-pointer transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Retake Test
            </button>
          )}
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black text-xs uppercase tracking-wider rounded-xl py-3 px-6 flex items-center gap-2 cursor-pointer transition-all shadow-[0_4px_12px_-3px_rgba(10,34,92,0.3)]"
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Generating PDF...' : 'Download Report'}
          </button>
        </div>
      </div>

      {/* Main Report Container */}
      <div 
        ref={reportRef} 
        className="relative z-10 w-full space-y-6"
      >
        {/* Brand Banner Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <img src="/sona__1_-removebg-preview.png" alt="Sona Logo" className="h-6 object-contain" />
              <div className="w-px h-4 bg-slate-300"></div>
              <img src="/Scale Logo High Res (1).png" alt="Scale Logo" className="h-6 object-contain" />
              <div className="w-px h-4 bg-slate-300"></div>
              <img src="/SMART_Logo_New__1_-removebg-preview.png" alt="SMART Logo" className="h-8 object-contain" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl font-black tracking-[0.1em] text-slate-950 uppercase">SDE Readiness Report</span>
              <span className="text-[10px] font-black bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700 uppercase tracking-widest">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Foundational Engineering Competency Assessment
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-2 gap-x-8 gap-y-1.5 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Candidate</span>
              <span className="text-slate-800 font-black">{reportData.fullName}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Email</span>
              <span className="text-slate-800 font-black">{reportData.email}</span>
            </div>
            <div className="mt-1">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Duration</span>
              <span className="text-slate-800 font-black">{formatDuration(reportData.totalDurationSeconds)}</span>
            </div>
            <div className="mt-1">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Ready Level</span>
              <span className="text-blue-600 font-black">{reportData.readinessLevel.split(' (')[0]}</span>
            </div>
          </div>
        </div>

        {/* Scores & Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {/* Main Score Ring */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
              SMART Score Index
            </span>
            
            <div className="relative w-40 h-40 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-blue-500/5 animate-pulse"></div>
              
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  className="stroke-slate-200"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#2563eb"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * reportData.smartScore) / 1000}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black text-slate-900 leading-none tracking-tight">
                  {reportData.smartScore}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                  of 1000
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col items-center gap-1">
              <span className="text-[11px] font-black bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200 uppercase tracking-wider">
                {reportData.readinessLevel}
              </span>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:col-span-2 flex flex-col shadow-sm">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
              Competency Breakdown
            </span>
            <div className="w-full h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} 
                  />
                  <Radar
                    name="Candidate Score"
                    dataKey="score"
                    stroke="#2563eb"
                    fill="#2563eb"
                    fillOpacity={0.25}
                  />
                  <Radar
                    name="Industry Avg"
                    dataKey="benchmark"
                    stroke="#94a3b8"
                    fill="#94a3b8"
                    fillOpacity={0.08}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '11px', color: '#0f172a' }} 
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                    formatter={(value) => <span className="text-slate-500 font-bold uppercase tracking-wider">{value}</span>}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Skill Gap Analysis Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative z-10">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 block">
            Skills Gap & Industry Benchmarking
          </span>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={reportData.skillGapAnalysis}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="domain" 
                  tick={{ fill: '#475569', fontSize: 8, fontWeight: 'bold' }}
                  tickFormatter={(val) => val.split(' ')[0]} 
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fill: '#475569', fontSize: 10 }} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '11px', color: '#0f172a' }} 
                />
                <Legend 
                  wrapperStyle={{ fontSize: '10px' }}
                  formatter={(value) => <span className="text-slate-500 font-bold uppercase tracking-wider">{value === 'score' ? 'Your Score %' : 'Industry Average %'}</span>}
                />
                <Bar dataKey="score" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="benchmark" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recommendations & Actionable Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {/* Key Benchmarks */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Key Performance Indicators
              </span>
            </div>
            
            <div className="space-y-4 flex-1 flex flex-col justify-center">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs text-slate-500 font-semibold">Percentile Ranking</span>
                <span className="text-sm font-black text-blue-600">Top {100 - reportData.benchmarkPercentile}% of Candidates</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs text-slate-500 font-semibold">Engineering Foundations</span>
                <span className="text-sm font-black text-emerald-600">
                  {reportData.smartScore >= 500 ? 'Verified Competent' : 'Needs Reinforcement'}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs text-slate-500 font-semibold">Evaluation Mode</span>
                <span className="text-sm font-black text-slate-700">Adaptive (CAT) Simulation</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">Validation Benchmark</span>
                <span className="text-xs font-bold text-slate-400">IEEE / SDE 2026 Ready</span>
              </div>
            </div>
          </div>

          {/* Learning Recommendations */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Adaptive Study Plan Recommendations
              </span>
            </div>
            
            {reportData.learningRecommendations.length > 0 ? (
              <div className="space-y-3 flex-1 overflow-y-auto max-h-48 text-xs font-semibold text-slate-700 leading-relaxed pr-2">
                {reportData.learningRecommendations.map((rec, i) => (
                  <div key={i} className="flex gap-3 bg-slate-50 border border-slate-200/50 p-3.5 rounded-2xl">
                    <span className="text-blue-600 font-black">0{i+1}.</span>
                    <p>{rec}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 gap-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Perfect scores achieved. No learning gaps detected!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
