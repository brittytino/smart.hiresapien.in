'use client';

import React from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Crosshair,
  KeyRound,
  Lightbulb,
  Printer,
  ShieldCheck,
  Target,
  TrendingUp,
  User,
  Zap,
} from 'lucide-react';
import {
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  ZAxis,
  ReferenceLine,
  LabelList,
} from 'recharts';

const globalPrintStyles = `
  @media print {
    @page {
      size: A4;
      margin: 10mm;
    }
    body {
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      background-color: white !important;
      font-size: 10pt;
    }
    .print-hidden {
      display: none !important;
    }
    .print-break-inside-avoid {
      break-inside: avoid;
    }
    .print-no-shadow {
      box-shadow: none !important;
    }
    .print-border {
      border: 1px solid #e2e8f0 !important;
    }
    .print-text-black {
      color: black !important;
    }
    .print-bg-zinc {
      background-color: #f4f4f5 !important;
    }
    .print-max-w-none {
      max-width: none !important;
      padding: 0 !important;
    }
    header, navigation, .sticky, button.print-hidden {
      display: none !important;
    }
  }
`;

function cn(...inputs: Array<string | undefined | null | boolean>) {
  return inputs.filter(Boolean).join(' ');
}

// Truncate to two decimal places without rounding
function truncateToTwoDecimals(value: number) {
  return Math.trunc((Number(value) || 0) * 100) / 100;
}

function formatTwoDecimals(value: number) {
  return truncateToTwoDecimals(value).toFixed(2);
}

const DOMAIN_COLOR_MAP: Record<string, string> = {
  cognitiveintelligence: '#FF4B8C',
  businessintelligence: '#3B82F6',
  problemsolving: '#A855F7',
  communication: '#F97316',
  leadership: '#10B981',
  digitalbusiness: '#06B6D4',
};

function normalizeDomainName(value: string): string {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getDomainHexColor(domainName: string): string {
  const normalized = normalizeDomainName(domainName);
  return DOMAIN_COLOR_MAP[normalized] || '#64748B';
}

function getShortName(name: string): string {
  if (!name) return '';
  const parts = name.split(/[^A-Za-z0-9]+/);
  if (parts.length > 1) {
    return parts.map(p => p[0]).join('').toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return `rgba(100, 116, 139, ${alpha})`;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const Card = ({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => (
  <div
    className={cn(
      'bg-white rounded-4xl border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden',
      className
    )}
    onClick={onClick}
  >
    {children}
  </div>
);

const SectionHeader = ({ title, description }: { title: string; description?: string }) => (
  <div className="mb-8">
    <div className="flex items-center gap-4 mb-2">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-[-0.05em] text-[#0f172a] uppercase">
          {title}
        </h2>
        {description && (
          <p className="text-[10px] sm:text-xs font-black tracking-[0.25em] text-[#94a3b8] uppercase mt-1">
            {description}
          </p>
        )}
      </div>
    </div>
  </div>
);

const ProgressBar = ({
  percentage,
  colorClass = 'bg-red-600',
  heightClass = 'h-2',
}: {
  percentage: number;
  colorClass?: string;
  heightClass?: string;
}) => (
  <div className={cn('w-full bg-slate-100 rounded-full overflow-hidden', heightClass)}>
    <div
      className={cn('h-full rounded-full transition-all duration-1000 ease-out', colorClass)}
      style={{ width: `${percentage}%` }}
    />
  </div>
);

const Badge = ({
  children,
  variant = 'default',
  className,
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'solid-green' | 'solid-red';
  className?: string;
}) => {
  const variants = {
    default: 'bg-emerald-600 text-white', // Ready (Green)
    success: 'bg-blue-600 text-white',    // Exceptional (Blue)
    warning: 'bg-amber-500 text-white',   // Almost Ready (Amber)
    danger: 'bg-red-600 text-white',      // Developing (Red)
    'solid-green': 'bg-[#1e4620] text-white',
    'solid-red': 'bg-[#6b3030] text-white',
  };
  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#0f172a] p-6 rounded-2xl shadow-xl border border-slate-800 min-w-65 max-w-[320px]">
        <p className="font-black tracking-[-0.05em] text-white text-lg mb-2">{data.name}</p>
        {data.description && (
          <p className="text-xs text-[#94a3b8] mb-4 pb-4 border-b border-slate-800 leading-relaxed font-medium">
            {data.description}
          </p>
        )}
        {!data.description && <div className="mb-4 pb-4 border-b border-slate-800" />}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center gap-4">
            <span className="text-[#94a3b8] flex items-center gap-2 font-medium">
              <Target className="w-4 h-4" /> PRI Score
            </span>
            <span className="font-bold text-white">
              {data.score} <span className="text-slate-500 font-medium">/ {data.max}</span>
            </span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-[#94a3b8] flex items-center gap-2 font-medium">
              <Crosshair className="w-4 h-4" /> Accuracy
            </span>
            <span className="font-bold text-white">{formatTwoDecimals(data.percentage)}%</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-[#94a3b8] flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4" /> Correct/Total
            </span>
            <span className="font-bold text-white">
              {data.correct} <span className="text-slate-500 font-medium">/ {data.total}</span>
            </span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-[#94a3b8] flex items-center gap-2 font-medium">
              <Clock className="w-4 h-4" /> Time Ratio
            </span>
            <Badge
              variant={data.ratio > 1 ? 'warning' : 'solid-green'}
              className="text-[10px] font-black tracking-[0.25em] uppercase"
            >
              {data.ratio}x
            </Badge>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const ActionPlanCard = ({
  priority,
  title,
  steps,
  color,
}: {
  priority: string;
  title: string;
  steps: string[];
  color: 'red' | 'amber' | 'emerald';
}) => {
  const colorStyles = {
    red: { cardBorder: 'border-red-100', badgeBg: 'bg-red-600', badgeText: 'text-white', icon: 'text-red-500' },
    amber: { cardBorder: 'border-amber-100', badgeBg: 'bg-amber-500', badgeText: 'text-white', icon: 'text-amber-500' },
    emerald: { cardBorder: 'border-emerald-100', badgeBg: 'bg-emerald-600', badgeText: 'text-white', icon: 'text-emerald-500' },
  };
  const style = colorStyles[color];

  return (
    <div className={cn('bg-white border rounded-2xl p-6 shadow-sm', style.cardBorder)}>
      <div className="flex items-center gap-2 mb-4">
        <span
          className={cn(
            'px-3 py-1 rounded-full text-[10px] font-black tracking-[0.25em] uppercase',
            style.badgeBg,
            style.badgeText
          )}
        >
          {priority}
        </span>
      </div>
      <h5 className="text-sm font-bold text-[#0f172a] mb-3">{title}</h5>
      <ul className="space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="text-xs text-slate-600 font-medium flex items-start gap-2">
            <ArrowRight className={cn('w-3.5 h-3.5 mt-0.5 shrink-0', style.icon)} />
            <span>{step}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const DomainCard = ({ domain }: { domain: any }) => {
  const domainHexColor = domain.hexColor || '#64748B';
  const domainTint = hexToRgba(domainHexColor, 0.1);
  const hasDescription = Boolean(String(domain.description || '').trim());
  const hasInsights = Boolean(String(domain.insights || '').trim());
  const hasStrengths = Array.isArray(domain.strengths) && domain.strengths.length > 0;
  const hasImprovements = Array.isArray(domain.improvements) && domain.improvements.length > 0;
  const hasActionPlan =
    (Array.isArray(domain.actionPlan?.high?.steps) && domain.actionPlan.high.steps.length > 0) ||
    (Array.isArray(domain.actionPlan?.medium?.steps) && domain.actionPlan.medium.steps.length > 0) ||
    (Array.isArray(domain.actionPlan?.low?.steps) && domain.actionPlan.low.steps.length > 0);

  return (
  <div
    className="relative rounded-4xl border border-gray-100 border-l-[6px] overflow-hidden bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]"
    style={{ borderLeftColor: domainHexColor }}
  >
    <div className="p-8 border-b border-gray-100" style={{ backgroundColor: domainTint }}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-3.5 h-3.5 text-[#94a3b8]" />
            <span className="text-[10px] font-black tracking-[0.25em] text-[#94a3b8] uppercase">
              Exam held on {domain.date}
            </span>
          </div>
          <h3 className="text-2xl font-black tracking-[-0.05em]" style={{ color: domainHexColor }}>{domain.name}</h3>
          {hasDescription && <p className="text-sm text-slate-600 mt-2 font-medium">{domain.description}</p>}
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-3xl font-black tracking-[-0.05em] text-black">
              {domain.score}
              <span className="text-[#94a3b8] text-xl font-bold">/{domain.max}</span>
            </div>
            <div className="text-[10px] font-black tracking-[0.25em] text-[#94a3b8] uppercase mt-1">
              {formatTwoDecimals(domain.percentage)} Accuracy
            </div>
          </div>
          <Badge
            variant={domain.percentage >= 90 ? 'success' : domain.percentage >= 80 ? 'default' : domain.percentage >= 60 ? 'warning' : 'danger'}
            className="text-[10px] font-black tracking-[0.25em] uppercase px-4 py-2"
          >
            {domain.label}
          </Badge>
        </div>
      </div>
    </div>
    <div className="p-8 space-y-10">
      <div className="flex flex-wrap items-center gap-8 text-sm">
        <div className="flex items-center gap-3">
          <Crosshair className="w-5 h-5 text-[#94a3b8]" />
          <span className="text-[10px] font-black tracking-[0.25em] text-[#94a3b8] uppercase">
            Accuracy:
          </span>
          <span className="font-bold text-black">{formatTwoDecimals(domain.percentage)}%</span>
        </div>
        <div className="w-px h-6 bg-gray-100 hidden sm:block" />
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-[#94a3b8]" />
          <span className="text-[10px] font-black tracking-[0.25em] text-[#94a3b8] uppercase">
            Time Taken:
          </span>
          <span className="font-bold text-[#0f172a]">{domain.time}</span>
        </div>
        <div className="w-px h-6 bg-gray-100 hidden sm:block" />
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-[#94a3b8]" />
          <span className="text-[10px] font-black tracking-[0.25em] text-[#94a3b8] uppercase">
            Time Ratio:
          </span>
          <span className="font-bold text-[#0f172a]">{domain.ratio}x</span>
        </div>
      </div>
      {hasInsights && <div className="bg-[#f8f9fa] rounded-2xl p-6 border border-gray-100 flex gap-5">
        <div className="p-3 rounded-xl shrink-0 h-fit" style={{ backgroundColor: domainTint, color: domainHexColor }}>
          <Lightbulb className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-[10px] font-black tracking-[0.25em] text-[#94a3b8] uppercase mb-2">
            Domain Insights
          </h4>
          <p className="text-sm text-[#0f172a] leading-relaxed font-medium">{domain.insights}</p>
        </div>
      </div>}
      {(hasStrengths || hasImprovements) && <div className="grid md:grid-cols-2 gap-8">
        {hasStrengths && <div>
          <h4 className="text-[10px] font-black tracking-[0.25em] text-[#94a3b8] uppercase mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Key Strengths
          </h4>
          <ul className="space-y-3">
            {domain.strengths.map((strength: string, i: number) => (
              <li key={i} className="text-sm text-[#0f172a] font-medium flex items-start gap-3">
                <span className="text-emerald-500 mt-0.5 font-bold">•</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
          </div>}
          {hasImprovements && <div>
          <h4 className="text-[10px] font-black tracking-[0.25em] text-[#94a3b8] uppercase mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Areas for Improvement
          </h4>
          <ul className="space-y-3">
            {domain.improvements.map((improvement: string, i: number) => (
              <li key={i} className="text-sm text-[#0f172a] font-medium flex items-start gap-3">
                <span className="text-amber-500 mt-0.5 font-bold">•</span>
                <span>{improvement}</span>
              </li>
            ))}
          </ul>
          </div>}
        </div>}
      <div>
        <h4 className="text-[10px] font-black tracking-[0.25em] text-[#94a3b8] uppercase mb-6">
          Sub-Skill Breakdown
        </h4>
        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f8f9fa]">
              <tr className="text-[10px] font-black tracking-[0.25em] text-[#94a3b8] uppercase border-b border-gray-100">
                <th className="py-4 px-6">Skill Area</th>
                <th className="py-4 px-6">Accuracy</th>
                <th className="py-4 px-6">Time Efficiency</th>
                <th className="py-4 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {domain.subSkills?.map((skill: any, i: number) => (
                <tr key={i} className="transition-colors">
                  <td className="py-4 px-6 font-bold text-[#0f172a]">{skill.skill}</td>
                  <td className="py-4 px-6 text-slate-600 font-medium">{formatTwoDecimals(skill.accuracy)}%</td>
                  <td className="py-4 px-6 text-slate-600 font-medium">{skill.timeEfficiency || '1.0'}x</td>
                  <td className="py-4 px-6">
                    <span
                      className={cn(
                        'inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-[0.25em] uppercase text-white',
                        (skill.status || '').toUpperCase() === 'EXCEPTIONAL'
                          ? 'bg-blue-600'
                        : (skill.status || '').toUpperCase() === 'READY'
                          ? 'bg-emerald-600'
                          : (skill.status || '').toUpperCase() === 'ALMOST READY'
                            ? 'bg-amber-500'
                            : (skill.status || '').toUpperCase() === 'DEVELOPING'
                              ? 'bg-red-600'
                              : 'bg-slate-600'
                      )}
                    >
                      {skill.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {hasActionPlan && <div className="pt-8 border-t border-gray-100">
        <h4 className="text-[10px] font-black tracking-[0.25em] text-[#94a3b8] uppercase mb-6 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#D62027]" />
          Action Plan
        </h4>
        <div className="grid md:grid-cols-3 gap-4">
          <ActionPlanCard
            priority="HIGH PRIORITY"
            title={domain.actionPlan?.high?.title || ''}
            steps={domain.actionPlan?.high?.steps || []}
            color="red"
          />
          <ActionPlanCard
            priority="MEDIUM PRIORITY"
            title={domain.actionPlan?.medium?.title || ''}
            steps={domain.actionPlan?.medium?.steps || []}
            color="amber"
          />
          <ActionPlanCard
            priority="LOW PRIORITY"
            title={domain.actionPlan?.low?.title || ''}
            steps={domain.actionPlan?.low?.steps || []}
            color="emerald"
          />
        </div>
      </div>}
    </div>
  </div>
  );
};

export default function PriReportView({
  reportData,
  variant = 'page',
  onBack,
  canRegenerate = false,
  onRegenerate,
  regenerating = false,
  canViewFailedDetails = false,
}: {
  reportData: any;
  variant?: 'page' | 'embedded';
  onBack?: () => void;
  canRegenerate?: boolean;
  onRegenerate?: () => void;
  regenerating?: boolean;
  canViewFailedDetails?: boolean;
}) {
  const STUDENT = reportData?.studentInfo;
  const OVERALL = reportData?.overallMetrics;
  const RAW_DOMAINS = reportData?.domains || [];
  const DOMAINS = RAW_DOMAINS.map((domain: any, index: number) => {
    const hexColor = getDomainHexColor(domain?.name || '');
    // Deterministic jitter to separate overlapping dots
    // Small offsets in Ratio (X) and Percentage (Y) based on index
    const jitterX = ((index % 3) - 1) * 0.01; // -0.01, 0, 0.01
    const jitterY = (index % 2 === 0 ? 0.8 : -0.8); // +0.8 or -0.8%
    
    return {
      ...domain,
      shortName: domain.shortName || getShortName(domain.name || ''),
      jitteredRatio: (Number(domain.ratio) || 0) + jitterX,
      jitteredPercentage: (Number(domain.percentage) || 0) + jitterY,
      hexColor,
      fill: hexColor,
    };
  });
  const SUMMARY_INSIGHT = reportData?.summaryInsight || '';
  const PSYCHOMETRIC = Array.isArray(reportData?.psychometric) ? reportData.psychometric : [];
  const passedTraitsCount = PSYCHOMETRIC.filter((trait: any) => trait?.status === 'PASS').length;
  
  // Requirement: Pass if overallStatus !== 'fail' and priGatewayPassed === true
  const psychometricPassed = reportData?.overallStatus !== 'fail' && (reportData?.priGatewayPassed !== false);
  
  const isPsychometricFailedForViewer = !psychometricPassed && !canViewFailedDetails;
  const INSIGHTS_DIAGNOSTICS = reportData?.insightsDiagnostics;
  const showInsightsDiagnostics = Boolean(INSIGHTS_DIAGNOSTICS) && INSIGHTS_DIAGNOSTICS?.status !== 'ok';

  if (!STUDENT) {
    return null;
  }

  const wrapperClass =
    variant === 'page'
      ? 'min-h-screen bg-[#f8f9fa] text-[#1a1a1a] font-sans selection:bg-red-100 selection:text-red-900 pb-24 relative overflow-hidden'
      : 'bg-white text-[#1a1a1a] font-sans rounded-4xl border border-zinc-100 overflow-hidden relative';

  return (
    <div className={wrapperClass}>
      {/* Subtle Matrix/Grid Background Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]" 
        style={{ 
          backgroundImage: `
            linear-gradient(to right, #64748b 1px, transparent 1px),
            linear-gradient(to bottom, #64748b 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      

      {variant === 'page' && <style dangerouslySetInnerHTML={{ __html: globalPrintStyles }} />}

      {variant === 'page' && (
        <>
          <header className="bg-white border-b border-gray-100 sticky top-0 z-10 print:hidden">
            <div className="max-w-7xl mx-auto pl-2.5 pr-4 sm:pr-6 lg:pr-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {onBack && (
                  <button
                    onClick={onBack}
                    className="flex items-center gap-2 group px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-all text-slate-500 hover:text-slate-900"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 group-hover:bg-white border border-transparent group-hover:border-slate-200 transition-colors shadow-sm">
                      <ChevronRight className="w-5 h-5 rotate-180" />
                    </div>
                    <span className="text-[10px] font-black tracking-widest uppercase hidden sm:inline-block">Back</span>
                  </button>
                )}
                <img 
                  src="/grad360.png" 
                  alt="Grad360 Logo" 
                  className="h-10 sm:h-10 w-auto object-contain" 
                />
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="hidden sm:inline-block text-[10px] font-black tracking-[0.25em] text-[#94a3b8] uppercase mt-1">
                  Placement Readiness Platform
                </span>
                <div className="h-4 w-px bg-slate-300 hidden sm:block" />
                <span className="text-[10px] font-black tracking-[0.25em] text-[#94a3b8] uppercase mt-1">
                  Report ID: {STUDENT.id}
                </span>
                <button
                  onClick={() => window.print()}
                  className="ml-2 flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors print:hidden"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline-block">Print</span>
                </button>
              </div>
            </div>
          </header>

          <div className="hidden print:flex items-center justify-between py-6 pl-2.5 pr-8 border-b-2 border-zinc-200">
            <img 
              src="/grad360.png" 
              alt="Grad360 Logo" 
              className="h-10 w-auto object-contain mb-2 print:h-12" 
            />
            <span className="text-[10px] font-black tracking-[0.25em] text-[#94a3b8] uppercase mt-1">
              Placement Readiness Platform · Official Report
            </span>
          </div>
        </>
      )}

      <main className={cn('max-w-7xl mx-auto pl-2.5 pr-4 sm:pr-6 lg:pr-8 py-8 space-y-8', variant === 'page' ? 'print:p-0 print:py-4' : '')}>
        {showInsightsDiagnostics && (
          <section className="print:hidden">
            <Card className="p-6 border border-amber-200 bg-amber-50/70">
              <div className="flex items-start gap-4">
                <div className="mt-0.5 h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <p className="text-[10px] font-black tracking-[0.25em] uppercase text-amber-700">
                    AI Insights Unavailable
                  </p>
                  <p className="mt-2 text-sm font-semibold text-amber-800">
                    Insights could not be loaded. Source: {INSIGHTS_DIAGNOSTICS?.source || 'unknown'}.
                  </p>
                  {INSIGHTS_DIAGNOSTICS?.error && (
                    <p className="mt-1 text-xs text-amber-800/80 font-medium">
                      {INSIGHTS_DIAGNOSTICS.error}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </section>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 p-8 flex flex-col justify-between bg-white print:border-none print:shadow-none">
            <div>
              <div className="w-16 h-16 bg-[#f8f9fa] rounded-full flex items-center justify-center mb-6 border border-gray-100 print:bg-zinc-100">
                <User className="w-8 h-8 text-[#94a3b8]" />
              </div>
              <h1 className="text-3xl font-black tracking-[-0.05em] text-[#0f172a] mb-1">{STUDENT.name}</h1>
              <p className="text-[10px] font-black tracking-[0.25em] text-[#94a3b8] uppercase mb-6">
                {STUDENT.id} · {STUDENT.program}
              </p>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-gray-100 pb-3">
                  <span className="text-[10px] font-bold tracking-widest text-[#94a3b8] uppercase">Batch</span>
                  <span className="font-medium text-[#0f172a]">{STUDENT.batch}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-3">
                  <span className="text-[10px] font-bold tracking-widest text-[#94a3b8] uppercase">Institution</span>
                  <span className="font-medium text-[#0f172a] text-right">{STUDENT.school || 'Institute'}</span>
                </div>

                {canRegenerate && onRegenerate && variant === 'page' && (
                  <div className="pt-2 print:hidden">
                    <button
                      onClick={onRegenerate}
                      disabled={regenerating}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#D62027]/20 bg-red-500 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {regenerating ? 'Regenerating...' : 'Regenerate Insights'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-2 p-8 bg-white print:border-none print:shadow-none">
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-[#D62027] text-white text-[10px] font-black tracking-[0.25em] uppercase rounded-full">
                    Official Report
                  </span>
                  <span className="px-3 py-1 bg-slate-700 text-white text-[10px] font-black tracking-[0.25em] uppercase rounded-full">
                    {STUDENT.date}
                  </span>
                </div>
                <h2 className="text-4xl font-black tracking-[-0.05em] text-[#0f172a] mb-4 uppercase leading-tight">
                  {STUDENT.examName}
                </h2>
                    <p className="text-sm text-slate-500 max-w-2xl leading-relaxed font-medium">
                  This report provides a comprehensive analysis of your cognitive, business, and behavioral competencies.
                  Use these insights to identify strengths and target areas for improvement in your placement journey.
                </p>
                {isPsychometricFailedForViewer && (
                  <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50/70 p-5">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-4 h-4 text-rose-700" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black tracking-[0.25em] uppercase text-rose-700">
                          Psychometric Eligibility Status
                        </p>
                        <p className="mt-2 text-sm font-semibold text-rose-800">
                          You need improve in psychometric.
                        </p>
                        <p className="mt-1 text-sm font-semibold text-rose-800">
                          Placement Readiness Index: Not Available Yet.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap items-center gap-8">
                <div>
                    <p className="text-[10px] font-black tracking-[0.25em] text-[#94a3b8] uppercase mb-1">Exam ID</p>
                  <p className="font-semibold text-[#0f172a]">{STUDENT.examId || 'PRI-TEST'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black tracking-[0.25em] text-[#94a3b8] uppercase mb-1">Generated On</p>
                  <p className="font-semibold text-[#0f172a]">
                    {STUDENT.generated || new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {!isPsychometricFailedForViewer && (
        <section>
          <SectionHeader title="Placement Readiness Index" description="High-level summary of your placement readiness." />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:flex print:flex-col">
            <Card className="lg:col-span-5 bg-white p-8 relative overflow-hidden print:border-2 print:border-zinc-200 print:shadow-none">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#D62027]/10 rounded-full blur-3xl print:hidden" />
              <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl print:hidden" />
              <div className="relative z-10 flex flex-col h-full justify-between items-center text-center">
                          <p className="text-[#94a3b8] font-black tracking-[0.25em] uppercase text-[10px] mb-4 -ml-92 print:text-zinc-500">
                    PRI Score
                  </p>
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="flex flex-col items-center">
                    <span className="text-7xl sm:text-8xl font-black tracking-[-0.05em] text-[#0f172a] print:text-black leading-none uppercase">
                      {isPsychometricFailedForViewer ? 'NOT ELIGIBLE' : `${formatTwoDecimals(STUDENT.priScore)}%`}
                    </span>
                    {!isPsychometricFailedForViewer && (
                      <p className={cn(
                        "text-[25px] font-black tracking-[0.3em] uppercase mt-4 mb-2 px-4 py-1.5 rounded-lg bg-slate-50/50",
                        STUDENT.performanceBand === 'EXCEPTIONAL' ? "text-blue-600" :
                        STUDENT.performanceBand === 'READY' ? "text-emerald-600" :
                        STUDENT.performanceBand === 'ALMOST READY' ? "text-amber-500" :
                        "text-red-600"
                      )}>
                        {STUDENT.performanceBand}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-8 w-full">
                  <ProgressBar
                    percentage={STUDENT.priScore}
                    colorClass={cn(
                      STUDENT.performanceBand === 'EXCEPTIONAL' ? "bg-blue-600" :
                      STUDENT.performanceBand === 'READY' ? "bg-emerald-600" :
                      STUDENT.performanceBand === 'ALMOST READY' ? "bg-amber-500" :
                      "bg-red-600"
                    )}
                    heightClass="h-3 bg-slate-100"
                  />
                </div>
              </div>
            </Card>

            <div className="lg:col-span-7 grid grid-cols-2 gap-4">
              <Card className="p-6 flex flex-col justify-center bg-white print:border print:shadow-none">
                <div className="flex items-center gap-2 text-[#94a3b8] mb-3">
                  <Crosshair className="w-4 h-4" />
                  <span className="text-[10px] font-black tracking-[0.25em] uppercase">Accuracy</span>
                </div>
                <p className="text-3xl font-black tracking-[-0.05em] text-[#0f172a]">{OVERALL.accuracy}%</p>
              </Card>

              <Card className="p-6 flex flex-col justify-center bg-white print:border print:shadow-none">
                <div className="flex items-center gap-2 text-[#94a3b8] mb-3">
                  <Clock className="w-4 h-4" />
                  <span className="text-[10px] font-black tracking-[0.25em] uppercase">Avg Time / Q</span>
                </div>
                <p className="text-3xl font-black tracking-[-0.05em] text-[#0f172a]">{OVERALL.timeTaken}</p>
              </Card>

              <Card className="p-6 flex flex-col justify-center bg-white print:border print:shadow-none">
                <div className="flex items-center gap-2 text-[#94a3b8] mb-3">
                  <Zap className="w-4 h-4" />
                  <span className="text-[10px] font-black tracking-[0.25em] uppercase">Time Efficiency</span>
                </div>
                <p className="text-3xl font-black tracking-[-0.05em] text-[#0f172a]">{OVERALL.timeEfficiency || '1.0x'}</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">{OVERALL.timeEfficiencyLabel || 'Ratio of scheduled to actual time.'}</p>
              </Card>

              <Card className="p-6 flex flex-col justify-center bg-white print:border print:shadow-none">
                <div className="flex items-center gap-2 text-[#94a3b8] mb-3">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-[10px] font-black tracking-[0.25em] uppercase">Needs Attention</span>
                </div>
                <p className="text-3xl font-black tracking-[-0.05em] text-amber-600">{Math.round(OVERALL.needsAttention || 0)}</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">Items to review</p>
              </Card>

              <Card className="p-6 flex flex-col justify-center col-span-2 bg-white print:border print:shadow-none">
                <div className="flex items-center gap-2 text-[#94a3b8] mb-3">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[10px] font-black tracking-[0.25em] uppercase">Psychometric Gate</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className={cn(
                    'text-3xl font-black tracking-[-0.05em]',
                    psychometricPassed ? 'text-emerald-600' : 'text-red-600'
                  )}>
                    {psychometricPassed ? 'PASSED' : 'Need Improvement'}
                  </p>
                  <p className="text-sm text-slate-600 font-medium">{passedTraitsCount} / {Math.max(PSYCHOMETRIC.length, 5)} Traits Cleared</p>
                </div>
              </Card>

            </div>
          </div>
        </section>
        )}

        {!isPsychometricFailedForViewer && (
        <section className="print:hidden">
          <SectionHeader title="Speed vs. Accuracy Matrix" description="Meaningful insights into performance efficiency across core competencies." />
          <Card className="p-8 bg-white">
            <div className="h-100 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 40, right: 60, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    dataKey="jitteredRatio"
                    name="Time Ratio"
                    domain={[0.65, 1.15]}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                    label={{
                      value: 'Speed (Time Ratio - Lower is Faster)',
                      position: 'insideBottom',
                      offset: -15,
                      fill: '#64748b',
                      fontSize: 10,
                      fontWeight: 900,
                    }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    type="number"
                    dataKey="jitteredPercentage"
                    name="Accuracy"
                    domain={[0, 100]}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                    label={{
                      value: 'Accuracy (%)',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 15,
                      fill: '#64748b',
                      fontSize: 10,
                      fontWeight: 900,
                    }}
                    axisLine={false}
                    tickLine={false}
                    dx={-10}
                  />
                  <ZAxis type="number" range={[160, 160]} />
                  <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                  <ReferenceLine x={1.0} stroke="#cbd5e1" strokeDasharray="3 3" />
                  <ReferenceLine y={80} stroke="#cbd5e1" strokeDasharray="3 3" />
                  <Scatter name="Domains" data={DOMAINS} fillOpacity={0.8}>
                    {DOMAINS.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                    <LabelList
                      dataKey="shortName"
                      position="top"
                      style={{
                        fontSize: '10px',
                        fontWeight: 900,
                        fill: '#0f172a',
                        stroke: 'white',
                        strokeWidth: 4,
                      }}
                      offset={12}
                    />
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-center gap-6">
              {DOMAINS.map((domain: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: domain.hexColor || '#64748B' }} />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{domain.name}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100 text-[10px] font-black tracking-[0.25em] text-[#94a3b8] uppercase flex flex-wrap items-center justify-center gap-8">
              <span>Top Left: Fast & Accurate</span>
              <span>Top Right: Slow & Accurate</span>
              <span>Bottom Left: Fast & Inaccurate</span>
              <span>Bottom Right: Slow & Inaccurate</span>
            </div>
          </Card>
        </section>
        )}

        {!isPsychometricFailedForViewer && (
        <section className="space-y-12">
          <SectionHeader title="Domain Deep Dive" description="Comprehensive analysis and actionable insights for each core competency." />

          <div className="space-y-10">
            {DOMAINS.map((domain: any, idx: number) => (
              <DomainCard key={idx} domain={domain} />
            ))}
          </div>
        </section>
        )}

        {!isPsychometricFailedForViewer && reportData.psychometric && (
          <section className="print:break-inside-avoid">
            <SectionHeader title="Psychometric Profile" description="Behavioral and personality traits assessment." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {reportData.psychometric.map((trait: any, idx: number) => (
                <Card
                  key={idx}
                  className="p-6 flex flex-col items-center justify-center bg-white text-center print:border print:shadow-none"
                >
                  <p className="text-[10px] font-black tracking-[0.25em] text-[#94a3b8] uppercase mb-6 h-8 flex items-center">
                    {trait.trait}
                  </p>
                  <div className="w-full">
                    <Badge
                      variant={trait.status === 'PASS' ? 'solid-green' : 'solid-red'}
                      className="w-full justify-center flex text-[10px] font-black tracking-[0.25em] uppercase py-2"
                    >
                      {trait.status === 'PASS' ? 'PASS' : 'Need Improvement'}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {reportData.solutionKey && reportData.solutionKey.length > 0 && (() => {
          const solutionKey: Array<{
            questionId: string;
            questionText: string;
            correctAnswer: string;
            domain: string;
            subSkill: string;
            options?: Array<{ label: string; text: string }>;
            yourAnswer?: string;
            isCorrect?: boolean;
          }> = reportData.solutionKey;

          // Group questions by domain
          const grouped: Record<string, typeof solutionKey> = {};
          solutionKey.forEach((item) => {
            const key = item.domain || 'General';
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(item);
          });

          return (
            <section className="print:break-inside-avoid">
              <SectionHeader
                title="Answer Key"
                description="Question-wise review with options, your answer, and correct answer."
              />
              <div className="space-y-6">
                {Object.entries(grouped).map(([domain, questions]) => (
                  <Card key={domain} className="overflow-hidden bg-white print:border print:shadow-none">
                    {/* Domain header */}
                    <div className="flex items-center gap-3 px-6 py-4 bg-[#f8f9fa] border-b border-gray-100">
                      <div className="p-2 bg-[#D62027]/10 rounded-xl">
                        <KeyRound className="w-4 h-4 text-[#D62027]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black tracking-[0.25em] text-[#94a3b8] uppercase">Domain</p>
                        <h4 className="text-sm font-black text-[#0f172a] uppercase tracking-tight">{domain}</h4>
                      </div>
                      <span className="ml-auto px-3 py-1 bg-white border border-gray-200 rounded-full text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">
                        {questions.length} {questions.length === 1 ? 'Question' : 'Questions'}
                      </span>
                    </div>

                    {/* Questions table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-[#f8f9fa] border-b border-gray-100">
                          <tr className="text-[10px] font-black tracking-[0.25em] text-[#94a3b8] uppercase">
                            <th className="py-3 px-6 w-8">#</th>
                            <th className="py-3 px-6">Question</th>
                            <th className="py-3 px-6">Options</th>
                            <th className="py-3 px-6 text-center">Your Answer</th>
                            <th className="py-3 px-6 text-center">Correct Answer</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {questions.map((item, qi) => (
                            <tr key={item.questionId} className="transition-colors">
                              <td className="py-4 px-6 text-[10px] font-black text-[#94a3b8] tabular-nums">
                                {qi + 1}
                              </td>
                              <td className="py-4 px-6 font-medium text-[#0f172a] max-w-md leading-relaxed">
                                <p className="font-semibold text-[#0f172a]">{item.questionText}</p>
                                <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">
                                  {item.subSkill || '—'}
                                </p>
                              </td>
                              <td className="py-4 px-6 align-top min-w-70">
                                {Array.isArray(item.options) && item.options.length > 0 ? (
                                  <div className="space-y-1.5">
                                    {item.options.map((opt) => {
                                      const isSelected = (item.yourAnswer || '') === opt.label;
                                      const isCorrectOption = (item.correctAnswer || '') === opt.label;
                                      return (
                                        <div
                                          key={`${item.questionId}-${opt.label}`}
                                          className={cn(
                                            'rounded-lg border px-2.5 py-1.5 text-xs leading-relaxed',
                                            isCorrectOption
                                              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                              : isSelected
                                                ? 'border-rose-200 bg-rose-50 text-rose-800'
                                                : 'border-zinc-200 bg-white text-zinc-700'
                                          )}
                                        >
                                          <span className="mr-1.5 font-black">{opt.label}.</span>
                                          <span>{opt.text}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <span className="text-xs text-zinc-400">No options available</span>
                                )}
                              </td>
                              <td className="py-4 px-6 text-center">
                                <span
                                  className={cn(
                                    'inline-flex min-w-10 items-center justify-center rounded-xl border px-3 py-1.5 text-sm font-black shadow-sm',
                                    item.isCorrect
                                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                      : 'bg-rose-50 border-rose-200 text-rose-700'
                                  )}
                                >
                                  {item.yourAnswer || 'N/A'}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <span className="inline-flex min-w-10 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-sm font-black text-emerald-700 shadow-sm">
                                  {item.correctAnswer || 'N/A'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          );
        })()}

        {!isPsychometricFailedForViewer && Boolean(SUMMARY_INSIGHT?.trim()) && (
        <section className="pt-4 print:break-inside-avoid">
          <Card className="p-8 bg-[#0f172a] text-white border-none shadow-md print:bg-white print:text-black print:border-2 print:border-zinc-200 print:shadow-none">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center shrink-0 print:bg-zinc-100">
                <Award className="w-8 h-8 text-[#D62027]" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-[-0.05em] text-[#a1262a] print:text-black mb-3">
                  Final Assessment Summary
                </h3>
                <p
                  className="text-zinc-500 print:text-zinc-700 leading-relaxed font-medium"
                  dangerouslySetInnerHTML={{
                    __html: SUMMARY_INSIGHT.replace(/<strong>/g, '<strong class="text-white">'),
                  }}
                />
              </div>
            </div>
          </Card>
        </section>
        )}
      </main>
    </div>
  );
}

