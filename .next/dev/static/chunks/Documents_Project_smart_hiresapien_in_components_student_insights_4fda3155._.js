(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$RadarChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/node_modules/recharts/es6/chart/RadarChart.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$recharts$2f$es6$2f$polar$2f$PolarGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/node_modules/recharts/es6/polar/PolarGrid.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$recharts$2f$es6$2f$polar$2f$PolarAngleAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/node_modules/recharts/es6/polar/PolarAngleAxis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$recharts$2f$es6$2f$polar$2f$Radar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/node_modules/recharts/es6/polar/Radar.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/node_modules/recharts/es6/component/ResponsiveContainer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/node_modules/recharts/es6/component/Tooltip.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/node_modules/lucide-react/dist/esm/icons/activity.js [app-client] (ecmascript) <export default as Activity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCheck$3e$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/node_modules/lucide-react/dist/esm/icons/user-check.js [app-client] (ecmascript) <export default as UserCheck>");
'use client';
;
;
;
;
function cn(...inputs) {
    return inputs.filter(Boolean).join(' ');
}
const DOMAIN_COLOR_MAP = {
    computationalthinking: '#3B82F6',
    programmingfundamentals: '#10B981',
    frontendengineering: '#6366F1',
    backendengineering: '#8B5CF6',
    databaseengineering: '#F59E0B',
    debuggingquality: '#EF4444',
    systemdesign: '#EC4899',
    aiaugmented: '#06B6D4'
};
const getDomainColor = (name)=>{
    const normalized = String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return DOMAIN_COLOR_MAP[normalized] || '#64748b';
};
const CustomRadarTick = (props)=>{
    const { x, y, payload, textAnchor } = props;
    // Apply a small vertical offset based on position to avoid overlapping vertices
    const dy = y < 150 ? -12 : y > 250 ? 18 : 6;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
        x: x,
        y: y,
        dy: dy,
        textAnchor: textAnchor,
        fill: getDomainColor(payload.value),
        fontSize: 9,
        fontWeight: 900,
        style: {
            paintOrder: 'stroke',
            stroke: '#ffffff',
            strokeWidth: '4px',
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
        },
        children: payload.value
    }, void 0, false, {
        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
        lineNumber: 43,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_c = CustomRadarTick;
const __TURBOPACK__default__export__ = /*#__PURE__*/ _c2 = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].memo(_c1 = function SkillSpectrumRadar({ domainMetrics = {}, overallMetrics, enabled = true, title = "Skill Analysis Spectrum", subtitle = "COMPREHENSIVE READINESS BREAKDOWN", overallStatus }) {
    if (!enabled) return null;
    const isPsychometricFailed = (overallStatus || '').toLowerCase() === 'fail';
    const spectrumDomains = Object.entries(domainMetrics).map(([name, metrics])=>{
        const questionsAttempted = metrics.questionsAttempted ?? metrics.correct ?? 0;
        let accuracyPct;
        if (typeof metrics.accuracy === 'number') {
            accuracyPct = metrics.accuracy > 1 ? metrics.accuracy : metrics.accuracy * 100;
        } else if (typeof metrics.correct === 'number' && questionsAttempted > 0) {
            accuracyPct = metrics.correct / questionsAttempted * 100;
        } else {
            accuracyPct = 0;
        }
        if (!Number.isFinite(accuracyPct)) accuracyPct = 0;
        if (isPsychometricFailed) accuracyPct = 0;
        return {
            name,
            accuracyPct: Math.max(0, Math.min(100, accuracyPct)),
            band: isPsychometricFailed ? 'RED' : metrics.band ?? 'NEUTRAL',
            questionsAttempted: questionsAttempted > 0 ? questionsAttempted : 1,
            correct: metrics.correct ?? 0,
            needsAttention: metrics.needsAttention ?? Math.max(0, (questionsAttempted || 0) - (metrics.correct ?? 0))
        };
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6 pt-12 pb-24",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-1 mb-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-2 bg-red-600 rounded-lg",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                                    className: "w-5 h-5 text-white"
                                }, void 0, false, {
                                    fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                                    lineNumber: 129,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                                lineNumber: 128,
                                columnNumber: 14
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-[28px] font-black text-slate-900 tracking-tight uppercase leading-none",
                                children: title
                            }, void 0, false, {
                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                                lineNumber: 131,
                                columnNumber: 14
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                        lineNumber: 127,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 font-sans ml-14",
                        children: subtitle
                    }, void 0, false, {
                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                        lineNumber: 133,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                lineNumber: 126,
                columnNumber: 8
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white rounded-[40px] p-8 md:p-14 border border-slate-100 shadow-[0_30px_70px_-20px_rgba(15,23,42,0.06)] no-hover relative overflow-hidden group",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 opacity-[0.03] pointer-events-none",
                        style: {
                            backgroundImage: 'radial-gradient(#1e293b 0.5px, transparent 0.5px)',
                            backgroundSize: '24px 24px'
                        }
                    }, void 0, false, {
                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                        lineNumber: 138,
                        columnNumber: 10
                    }, this),
                    spectrumDomains.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 lg:grid-cols-[1.2fr_1.1fr_0.7fr] gap-12 lg:gap-8 items-center relative z-10",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative h-[360px] md:h-[400px]",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute top-0 left-0 z-20 flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-2.5 h-2.5 rounded-full bg-[#FF4757] shadow-[0_0_8px_rgba(255,71,87,0.4)] animate-pulse"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                                                lineNumber: 146,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] font-black uppercase tracking-widest text-slate-400",
                                                children: "Current Score"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                                                lineNumber: 147,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                                        lineNumber: 145,
                                        columnNumber: 18
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                                        width: "100%",
                                        height: "100%",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$RadarChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RadarChart"], {
                                            data: spectrumDomains.map((d)=>({
                                                    name: d.name,
                                                    score: d.accuracyPct
                                                })),
                                            outerRadius: "75%",
                                            margin: {
                                                top: 20,
                                                right: 60,
                                                bottom: 20,
                                                left: 60
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$recharts$2f$es6$2f$polar$2f$PolarGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PolarGrid"], {
                                                    stroke: "#000000",
                                                    strokeOpacity: 0.1
                                                }, void 0, false, {
                                                    fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                                                    lineNumber: 158,
                                                    columnNumber: 22
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$recharts$2f$es6$2f$polar$2f$PolarAngleAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PolarAngleAxis"], {
                                                    dataKey: "name",
                                                    tick: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CustomRadarTick, {}, void 0, false, {
                                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                                                        lineNumber: 161,
                                                        columnNumber: 30
                                                    }, void 0)
                                                }, void 0, false, {
                                                    fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                                                    lineNumber: 159,
                                                    columnNumber: 22
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$recharts$2f$es6$2f$polar$2f$Radar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Radar"], {
                                                    name: "Readiness",
                                                    dataKey: "score",
                                                    stroke: "#D62027",
                                                    strokeWidth: 3,
                                                    fill: "#D62027",
                                                    fillOpacity: 0.15
                                                }, void 0, false, {
                                                    fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                                                    lineNumber: 163,
                                                    columnNumber: 22
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                                                    contentStyle: {
                                                        fontSize: 12,
                                                        fontWeight: 800,
                                                        borderRadius: 20,
                                                        border: 'none',
                                                        boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                                                        padding: '12px 20px'
                                                    },
                                                    formatter: (value)=>[
                                                            `${value.toFixed(2)}%`,
                                                            'Accuracy'
                                                        ]
                                                }, void 0, false, {
                                                    fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                                                    lineNumber: 171,
                                                    columnNumber: 22
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                                            lineNumber: 150,
                                            columnNumber: 20
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                                        lineNumber: 149,
                                        columnNumber: 18
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                                lineNumber: 144,
                                columnNumber: 16
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-8 h-full justify-center lg:border-l lg:border-slate-50 lg:pl-16",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-2",
                                        children: "Mastery Indicators"
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                                        lineNumber: 188,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-7",
                                        children: spectrumDomains.slice(0, 6).map((dom)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between group/item",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex flex-col gap-0.5",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                className: "text-[15px] font-black uppercase tracking-tight leading-none transition-all group-hover/item:scale-105",
                                                                style: {
                                                                    color: getDomainColor(dom.name)
                                                                },
                                                                children: dom.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                                                                lineNumber: 193,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-[9px] font-black text-slate-400 uppercase tracking-widest",
                                                                children: "Mastery Level"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                                                                lineNumber: 199,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                                                        lineNumber: 192,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-2xl md:text-3xl font-black text-slate-900 tracking-tighter tabular-nums",
                                                        children: [
                                                            dom.accuracyPct.toFixed(2),
                                                            "%"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                                                        lineNumber: 201,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, dom.name, true, {
                                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                                                lineNumber: 191,
                                                columnNumber: 23
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                                        lineNumber: 189,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                                lineNumber: 187,
                                columnNumber: 16
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-center lg:justify-end h-full",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-[#f8fafc]/50 rounded-[48px] p-10 flex flex-col items-center justify-center w-full max-w-[280px] text-center border border-white shadow-sm relative no-hover group/profile transition-all duration-500 hover:bg-white hover:shadow-xl",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-20 h-20 bg-[#0f172a] rounded-[28px] flex items-center justify-center mb-8 shadow-xl shadow-slate-900/10 transition-transform group-hover/profile:-translate-y-2",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCheck$3e$__["UserCheck"], {
                                                className: "w-8 h-8 text-white"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                                                lineNumber: 214,
                                                columnNumber: 25
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                                            lineNumber: 213,
                                            columnNumber: 22
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6",
                                            children: "Behavioral Profile"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                                            lineNumber: 217,
                                            columnNumber: 22
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: cn("text-[30px] font-black tracking-tighter uppercase leading-none drop-shadow-sm", isPsychometricFailed ? 'text-[#FF4757]' : 'text-[#10B981]'),
                                            children: isPsychometricFailed ? 'Need Improvement' : 'PASS'
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                                            lineNumber: 219,
                                            columnNumber: 22
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                                    lineNumber: 211,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                                lineNumber: 210,
                                columnNumber: 16
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                        lineNumber: 141,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-center justify-center py-24 text-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-2xl font-black text-slate-900 uppercase tracking-tight mb-2",
                                children: "No Evaluation Reports"
                            }, void 0, false, {
                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                                lineNumber: 230,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm font-bold uppercase tracking-widest text-slate-400 max-w-sm leading-relaxed",
                                children: "Complete your readiness assessment to unlock your comprehensive skill analysis spectrum."
                            }, void 0, false, {
                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                                lineNumber: 231,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                        lineNumber: 229,
                        columnNumber: 12
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
                lineNumber: 136,
                columnNumber: 8
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx",
        lineNumber: 125,
        columnNumber: 5
    }, this);
});
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "CustomRadarTick");
__turbopack_context__.k.register(_c1, "%default%$React.memo");
__turbopack_context__.k.register(_c2, "%default%");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StudentInsights
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-client] (ecmascript) <export default as TrendingUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/node_modules/lucide-react/dist/esm/icons/arrow-right.js [app-client] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/node_modules/lucide-react/dist/esm/icons/activity.js [app-client] (ecmascript) <export default as Activity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$components$2f$providers$2f$ui$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/components/providers/ui-provider.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$api$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/lib/api-utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$components$2f$student$2f$insights$2f$StudentInsightsSkeleton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsightsSkeleton.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$components$2f$student$2f$insights$2f$SkillSpectrumRadar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/components/student/insights/SkillSpectrumRadar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/node_modules/lucide-react/dist/esm/icons/star.js [app-client] (ecmascript) <export default as Star>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
function cn(...inputs) {
    return inputs.filter(Boolean).join(' ');
}
function StudentInsights({ token, hasActiveTest, bankInfo, domainTimeSlots = [], activeDomain, isCompleted = false, startsAt = null, testEndAt = null, testStartAt = null, onInitialLoadComplete, serverOffsetMs = 0 }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [data, setData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [currentTime, setCurrentTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(Date.now() + serverOffsetMs);
    const { confirm, showToast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$components$2f$providers$2f$ui$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUI"])();
    const initialReportedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const [isRegenerating, setIsRegenerating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const formatTo12H = (timeStr)=>{
        if (!timeStr || !timeStr.includes(':')) return timeStr;
        const [h, m] = timeStr.split(':').map(Number);
        const suffix = h >= 12 ? 'PM' : 'AM';
        const hours = h % 12 || 12;
        return `${String(hours).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "StudentInsights.useEffect": ()=>{
            const interval = window.setInterval({
                "StudentInsights.useEffect.interval": ()=>{
                    setCurrentTime(Date.now() + serverOffsetMs);
                }
            }["StudentInsights.useEffect.interval"], 1000);
            return ({
                "StudentInsights.useEffect": ()=>window.clearInterval(interval)
            })["StudentInsights.useEffect"];
        }
    }["StudentInsights.useEffect"], [
        serverOffsetMs
    ]);
    // Hydrate from persistent localStorage to avoid showing
    // a blank state on revisits and fulfill 'one-time fetch' requirement.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "StudentInsights.useEffect": ()=>{
            if (("TURBOPACK compile-time value", "object") === 'undefined' || !token) return;
            try {
                // Use token prefix to avoid cross-user caching bugs
                const cacheKey = `student_insights_cache_v3_${token.substring(0, 20)}`;
                const raw = localStorage.getItem(cacheKey);
                if (!raw) return;
                const parsed = JSON.parse(raw);
                // Even with 'one-time fetch', we use the cached data immediately.
                setData(parsed.payload);
                setLoading(false);
                if (!initialReportedRef.current) {
                    initialReportedRef.current = true;
                    if (onInitialLoadComplete) {
                        onInitialLoadComplete();
                    }
                }
            } catch  {
            // ignore cache errors
            }
        }
    }["StudentInsights.useEffect"], [
        onInitialLoadComplete,
        token
    ]);
    const fetchInsights = async (force = false)=>{
        // Check if we already have data in memory or localStorage before fetching
        if (!force && data) {
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(`/api/student/insights`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$api$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["safeParseJson"])(res);
            if (!res.ok) throw new Error(result.error || 'Failed to fetch personal insights');
            setData(result);
            if ("TURBOPACK compile-time truthy", 1) {
                try {
                    const cacheKey = `student_insights_cache_v3_${token.substring(0, 20)}`;
                    localStorage.setItem(cacheKey, JSON.stringify({
                        timestamp: Date.now(),
                        payload: result
                    }));
                } catch  {
                // ignore cache write errors
                }
            }
        } catch (err) {
            console.error('[StudentInsights] fetchInsights Error:', err);
            setError('Could not refresh personal analytics. Please try again later.');
        } finally{
            setLoading(false);
            if (!initialReportedRef.current) {
                initialReportedRef.current = true;
                if (onInitialLoadComplete) {
                    onInitialLoadComplete();
                }
            }
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "StudentInsights.useEffect": ()=>{
            if (!token) return;
            // Strictly one-time fetch: only fetch if localStorage was empty or data is null
            const cacheKey = `student_insights_cache_v3_${token.substring(0, 20)}`;
            const cached = ("TURBOPACK compile-time truthy", 1) ? localStorage.getItem(cacheKey) : "TURBOPACK unreachable";
            if (!cached) {
                void fetchInsights(true);
            } else {
                setLoading(false);
            }
        }
    }["StudentInsights.useEffect"], [
        token
    ]);
    const handleFinalPRISubmit = async ()=>{
        try {
            const confirmed = await confirm({
                title: 'Final PRI Submission',
                message: 'Are you sure you want to submit your entire PRI test? This action is permanent and will finalize your evaluation.',
                confirmLabel: 'Yes, Submit Final',
                cancelLabel: 'Keep Reviewing',
                variant: 'danger'
            });
            if (!confirmed) return;
            const res = await fetch(`/api/student/pri-test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    action: 'submit_final_test',
                    questionBankId: bankInfo?.id
                })
            });
            if (!res.ok) {
                const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$api$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["safeParseJson"])(res);
                throw new Error(result.error || 'Failed to submit final test');
            }
            showToast('Assessment Submitted Successfully', 'success');
            // Fetch fresh data after submission and update cache
            void fetchInsights(true);
        } catch (err) {
            console.error('[StudentInsights] handleFinalPRISubmit Error:', err);
            showToast('An error occurred during submission. Please try again.', 'error');
        }
    };
    const allDomainsFinished = domainTimeSlots.length > 0 && domainTimeSlots.every((slot)=>slot.responseStatus === 'completed' || slot.responseStatus === 'closed');
    const handleRegenerate = async ()=>{
        setIsRegenerating(true);
        try {
            // Visual delay for the student to "regenerate" the insights
            await new Promise((r)=>setTimeout(r, 3000));
            await fetchInsights(true);
            showToast('Analysis regenerated successfully!', 'success');
        } catch (err) {
            showToast('Failed to regenerate analysis', 'error');
        } finally{
            setIsRegenerating(false);
        }
    };
    const overallMetrics = data?.insightsEngine?.data?.overallMetrics;
    const overallStatus = data?.recentActivity?.[0]?.overallStatus;
    const domainMetrics = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "StudentInsights.useMemo[domainMetrics]": ()=>data?.insightsEngine?.data?.domainMetrics ?? {}
    }["StudentInsights.useMemo[domainMetrics]"], [
        data?.insightsEngine?.data?.domainMetrics
    ]);
    const spectrumDomains = Object.entries(domainMetrics).map(([name, metrics])=>{
        const questionsAttempted = metrics.questionsAttempted ?? metrics.correct ?? 0;
        let accuracyPct;
        if (typeof metrics.accuracy === 'number') {
            // Backend already sends percentage in many cases.
            accuracyPct = metrics.accuracy > 1 ? metrics.accuracy : metrics.accuracy * 100;
        } else if (typeof metrics.correct === 'number' && questionsAttempted > 0) {
            accuracyPct = metrics.correct / questionsAttempted * 100;
        } else {
            accuracyPct = 0;
        }
        if (!Number.isFinite(accuracyPct)) accuracyPct = 0;
        return {
            name,
            accuracyPct: Math.max(0, Math.min(100, accuracyPct)),
            band: metrics.band ?? 'NEUTRAL',
            questionsAttempted: questionsAttempted > 0 ? questionsAttempted : 1,
            correct: metrics.correct ?? 0,
            needsAttention: metrics.needsAttention ?? Math.max(0, (questionsAttempted || 0) - (metrics.correct ?? 0))
        };
    });
    const totalSpectrumWeight = spectrumDomains.reduce((sum, d)=>sum + (d.questionsAttempted || 1), 0) || spectrumDomains.length || 1;
    const ActionPlanCard = ({ priority, title, steps, color })=>{
        const colorStyles = {
            red: {
                cardBorder: 'border-red-100',
                badgeBg: 'bg-red-600',
                badgeText: 'text-white',
                icon: 'text-red-500'
            },
            amber: {
                cardBorder: 'border-amber-100',
                badgeBg: 'bg-amber-500',
                badgeText: 'text-white',
                icon: 'text-amber-500'
            },
            emerald: {
                cardBorder: 'border-emerald-100',
                badgeBg: 'bg-emerald-600',
                badgeText: 'text-white',
                icon: 'text-emerald-500'
            }
        };
        const style = colorStyles[color];
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `bg-white border rounded-2xl p-6 shadow-sm no-hover ${style.cardBorder}`,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2 mb-4",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `px-3 py-1 rounded-full text-[10px] font-black tracking-[0.25em] uppercase ${style.badgeBg} ${style.badgeText}`,
                        children: priority
                    }, void 0, false, {
                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                        lineNumber: 360,
                        columnNumber: 9
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                    lineNumber: 359,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
                    className: "text-sm font-bold text-[#0f172a] mb-3",
                    children: title
                }, void 0, false, {
                    fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                    lineNumber: 366,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                    className: "space-y-3",
                    children: steps.map((step, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                            className: "text-xs text-slate-600 font-medium flex items-start gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                    className: `w-3.5 h-3.5 mt-0.5 shrink-0 ${style.icon}`
                                }, void 0, false, {
                                    fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                    lineNumber: 370,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: step
                                }, void 0, false, {
                                    fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                    lineNumber: 371,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, i, true, {
                            fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                            lineNumber: 369,
                            columnNumber: 11
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                    lineNumber: 367,
                    columnNumber: 7
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
            lineNumber: 358,
            columnNumber: 5
        }, this);
    };
    const SectionHeader = ({ title, description })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mb-4 mt-6",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-4 mb-2",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-2xl sm:text-3xl font-black tracking-[-0.05em] text-[#0f172a] uppercase",
                            children: title
                        }, void 0, false, {
                            fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                            lineNumber: 383,
                            columnNumber: 9
                        }, this),
                        description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-[10px] sm:text-xs font-black tracking-[0.25em] text-[#94a3b8] uppercase mt-1",
                            children: description
                        }, void 0, false, {
                            fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                            lineNumber: 387,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                    lineNumber: 382,
                    columnNumber: 7
                }, this)
            }, void 0, false, {
                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                lineNumber: 381,
                columnNumber: 5
            }, this)
        }, void 0, false, {
            fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
            lineNumber: 380,
            columnNumber: 3
        }, this);
    const getBandColorClass = (band)=>{
        const key = (band || '').toUpperCase();
        if (key === 'GREEN' || key === 'EXCEPTIONAL') return 'bg-emerald-500';
        if (key === 'AMBER' || key === 'YELLOW' || key === 'STRONG') return 'bg-amber-400';
        if (key === 'RED' || key === 'NEEDS WORK') return 'bg-red-500';
        return 'bg-slate-300';
    };
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$components$2f$student$2f$insights$2f$StudentInsightsSkeleton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StudentInsightsSkeleton"], {}, void 0, false, {
            fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
            lineNumber: 405,
            columnNumber: 12
        }, this);
    }
    if (error) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "p-8 bg-red-50 text-[#D62027] rounded-3xl border border-red-100 flex flex-col items-center gap-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "font-black uppercase tracking-widest text-sm",
                    children: error
                }, void 0, false, {
                    fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                    lineNumber: 411,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>{
                        setLoading(true);
                        void fetchInsights();
                    },
                    className: "text-xs font-bold underline",
                    children: "Retry Fetching"
                }, void 0, false, {
                    fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                    lineNumber: 412,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
            lineNumber: 410,
            columnNumber: 7
        }, this);
    }
    const isPsychometricFailed = (overallStatus || '').toLowerCase() === 'fail';
    const priScore = isPsychometricFailed ? 0 : overallMetrics?.percentage ?? 0;
    const getPlacementStatus = (score, failed)=>{
        if (failed) return {
            label: 'Not Available Yet',
            color: 'text-[#D62027]',
            iconBg: 'bg-[#D62027]',
            shadow: 'shadow-red-200',
            band: 'RED'
        };
        if (score >= 90) return {
            label: 'Exceptional',
            color: 'text-blue-600',
            iconBg: 'bg-blue-600',
            shadow: 'shadow-blue-200',
            band: 'BLUE'
        };
        if (score >= 80) return {
            label: 'Ready',
            color: 'text-emerald-600',
            iconBg: 'bg-emerald-600',
            shadow: 'shadow-emerald-200',
            band: 'GREEN'
        };
        if (score >= 60) return {
            label: 'Almost Ready',
            color: 'text-amber-500',
            iconBg: 'bg-amber-500',
            shadow: 'shadow-amber-200',
            band: 'AMBER'
        };
        return {
            label: 'Developing',
            color: 'text-[#D62027]',
            iconBg: 'bg-[#D62027]',
            shadow: 'shadow-red-200',
            band: 'RED'
        };
    };
    const status = getPlacementStatus(priScore, isPsychometricFailed);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-8",
        children: [
            testStartAt && isFinite(testStartAt) && !isCompleted && testStartAt > currentTime && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-[28px] bg-[#0f172a] p-5 md:p-6 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl shadow-slate-900/20 relative overflow-hidden no-hover",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-6 relative z-10 w-full lg:w-auto",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2 mb-1.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                            lineNumber: 445,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300",
                                            children: "Live Assessment Window"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                            lineNumber: 446,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                    lineNumber: 444,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: "text-2xl font-black text-white tracking-tight leading-none uppercase",
                                    children: "Start Time "
                                }, void 0, false, {
                                    fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                    lineNumber: 448,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[11px] font-bold text-slate-400 mt-2 uppercase tracking-widest leading-relaxed",
                                    children: (()=>{
                                        if (!testStartAt) return 'Scheduled Today';
                                        const d = new Date(testStartAt);
                                        return d.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                        }) + ' — Be ready to begin.';
                                    })()
                                }, void 0, false, {
                                    fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                    lineNumber: 449,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                            lineNumber: 443,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                        lineNumber: 442,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-4 relative z-10 w-full lg:w-auto justify-center lg:justify-end",
                        children: (()=>{
                            const diff = Math.max(0, testStartAt - currentTime);
                            const h = Math.floor(diff / 3600000);
                            const m = Math.floor(diff % 3600000 / 60000);
                            const s = Math.floor(diff % 60000 / 1000);
                            const units = [
                                {
                                    val: String(h).padStart(2, '0'),
                                    label: 'HRS'
                                },
                                {
                                    val: String(m).padStart(2, '0'),
                                    label: 'MIN'
                                },
                                {
                                    val: String(s).padStart(2, '0'),
                                    label: 'SEC'
                                }
                            ];
                            return units.map((u, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Fragment, {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col items-center",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "bg-white/5 border border-white/10 w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm transition-all",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-3xl md:text-4xl font-black text-white tabular-nums tracking-tighter",
                                                        children: u.val
                                                    }, void 0, false, {
                                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                                        lineNumber: 476,
                                                        columnNumber: 24
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                                    lineNumber: 475,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2",
                                                    children: u.label
                                                }, void 0, false, {
                                                    fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                                    lineNumber: 478,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                            lineNumber: 474,
                                            columnNumber: 19
                                        }, this),
                                        i < units.length - 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-slate-700 font-black text-2xl mb-6",
                                            children: ":"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                            lineNumber: 481,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, u.label, true, {
                                    fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                    lineNumber: 473,
                                    columnNumber: 17
                                }, this));
                        })()
                    }, void 0, false, {
                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                        lineNumber: 459,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                lineNumber: 441,
                columnNumber: 9
            }, this),
            testEndAt && isFinite(testEndAt) && !isCompleted && testEndAt > currentTime && !(testStartAt && isFinite(testStartAt) && testStartAt > currentTime) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-[28px] bg-[#0f172a] p-5 md:p-6 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl shadow-slate-900/20 relative overflow-hidden no-hover",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-6 relative z-10 w-full lg:w-auto",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2 mb-1.5",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[10px] font-black uppercase tracking-[0.2em] text-[#D62027]",
                                        children: "Critical Window"
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                        lineNumber: 499,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                    lineNumber: 498,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: "text-2xl font-black text-white tracking-tight leading-none uppercase",
                                    children: "Exam Ends "
                                }, void 0, false, {
                                    fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                    lineNumber: 501,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[11px] font-bold text-slate-400 mt-2 uppercase tracking-widest leading-relaxed",
                                    children: "Finish all domains to successfully complete your examination process."
                                }, void 0, false, {
                                    fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                    lineNumber: 502,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                            lineNumber: 497,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                        lineNumber: 496,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-4 relative z-10 w-full lg:w-auto justify-center lg:justify-end",
                        children: (()=>{
                            const diff = Math.max(0, testEndAt - currentTime);
                            const h = Math.floor(diff / 3600000);
                            const m = Math.floor(diff % 3600000 / 60000);
                            const s = Math.floor(diff % 60000 / 1000);
                            const units = [
                                {
                                    val: String(h).padStart(2, '0'),
                                    label: 'HRS'
                                },
                                {
                                    val: String(m).padStart(2, '0'),
                                    label: 'MIN'
                                },
                                {
                                    val: String(s).padStart(2, '0'),
                                    label: 'SEC'
                                }
                            ];
                            return units.map((u, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Fragment, {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col items-center",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "bg-white/5 border border-white/10 w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm transition-all",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-3xl md:text-4xl font-black text-white tabular-nums tracking-tighter",
                                                        children: u.val
                                                    }, void 0, false, {
                                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                                        lineNumber: 523,
                                                        columnNumber: 24
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                                    lineNumber: 522,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2",
                                                    children: u.label
                                                }, void 0, false, {
                                                    fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                                    lineNumber: 525,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                            lineNumber: 521,
                                            columnNumber: 19
                                        }, this),
                                        i < units.length - 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-slate-700 font-black text-2xl mb-6",
                                            children: ":"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                            lineNumber: 528,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, u.label, true, {
                                    fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                    lineNumber: 520,
                                    columnNumber: 17
                                }, this));
                        })()
                    }, void 0, false, {
                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                        lineNumber: 506,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                lineNumber: 495,
                columnNumber: 9
            }, this),
            hasActiveTest && !isCompleted && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-[#fff5f5] rounded-[28px] p-5 md:p-6 border border-red-50 flex flex-col lg:flex-row gap-10 relative overflow-hidden no-hover",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 w-full lg:w-1/2 flex flex-col justify-center relative z-10",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3 mb-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "w-2 h-2 rounded-full bg-[#D62027] animate-pulse"
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                        lineNumber: 542,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[10px] font-black uppercase tracking-[0.2em] text-[#D62027]",
                                        children: "Live Assignment"
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                        lineNumber: 543,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                lineNumber: 541,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                className: "text-4xl md:text-5xl font-black text-[#1e293b] tracking-tight leading-[1.1] mb-4",
                                children: [
                                    bankInfo?.title?.split(' ').slice(0, -2).join(' ') ?? 'Grad360 PRI',
                                    ' ',
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[#D62027]",
                                        children: bankInfo?.title?.split(' ').slice(-2).join(' ') ?? 'Readiness Exam'
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                        lineNumber: 548,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                lineNumber: 546,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm font-medium text-slate-500 leading-relaxed max-w-md mb-8",
                                children: "Your mandatory evaluation period is open. Please ensure you complete all modules before the deadline to receive your placement authorization."
                            }, void 0, false, {
                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                lineNumber: 551,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap items-center gap-4 mb-8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-red-100 shadow-sm",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] font-black uppercase tracking-widest text-slate-600",
                                            children: "SCHEDULED"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                            lineNumber: 557,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                        lineNumber: 556,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-emerald-100 shadow-sm",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] font-black uppercase tracking-widest text-slate-600",
                                            children: "VERIFIED ASSESSMENT"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                            lineNumber: 560,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                        lineNumber: 559,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                lineNumber: 555,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                        lineNumber: 540,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "lg:w-170 xl:w-190 relative z-10",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-center mb-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[10px] font-black uppercase tracking-[0.2em] text-[#cbd5e1]",
                                        children: "Preparation Schedule"
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                        lineNumber: 567,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "px-4 py-1.5 bg-[#D62027] text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm",
                                        children: "Exam Domain"
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                        lineNumber: 568,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                lineNumber: 566,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-95 overflow-y-auto pr-2 pb-2 custom-scrollbar",
                                children: domainTimeSlots.map((slot)=>{
                                    const respStatus = slot.responseStatus ?? 'not_started';
                                    const isCompleted = respStatus === 'completed';
                                    const isClosed = respStatus === 'closed';
                                    const isTerminated = isClosed && slot.lockedReason === 'terminated_by_proctoring';
                                    const isMissed = isClosed && slot.lockedReason === 'missed_window';
                                    const isActive = activeDomain?.domainId === slot.domainId;
                                    let startsInText = null;
                                    if (!isActive && !isCompleted && !isClosed && slot.startsAt) {
                                        const diffMs = new Date(slot.startsAt).getTime() - currentTime;
                                        if (diffMs > 0) {
                                            const h = Math.floor(diffMs / 3600000);
                                            const m = Math.floor(diffMs % 3600000 / 60000);
                                            const s = Math.floor(diffMs % 60000 / 1000);
                                            startsInText = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                                        }
                                    }
                                    const monthStr = bankInfo?.examStartDate ? new Date(bankInfo.examStartDate).toLocaleString('default', {
                                        month: 'short'
                                    }).toUpperCase() : '---';
                                    const dateStr = bankInfo?.examStartDate ? new Date(bankInfo.examStartDate).getDate() : '--';
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        onClick: ()=>isActive && !isCompleted && !isClosed && router.push(`/student/test?domainId=${slot.domainId}`),
                                        className: `flex items-center gap-3 p-3 rounded-2xl bg-white shadow-sm transition-all border relative overflow-hidden ${isCompleted ? 'border-emerald-200 bg-emerald-50/20' : isTerminated ? 'border-red-200 bg-red-50/20 opacity-70 select-none cursor-not-allowed' : isMissed ? 'border-zinc-100 opacity-60 grayscale select-none cursor-not-allowed bg-zinc-50/50' : isClosed ? 'border-zinc-100 opacity-60 grayscale select-none cursor-not-allowed bg-zinc-50/50' : isActive ? 'cursor-pointer border-[#D62027] bg-white' : 'border-zinc-100 opacity-80 cursor-not-allowed bg-zinc-50/10'} ${slot.domainId === 'workspace-psychology' ? 'md:col-span-2' : ''}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `absolute left-0 top-0 bottom-0 w-1.5 ${isCompleted ? 'bg-emerald-500' : isTerminated ? 'bg-red-400' : isMissed ? 'bg-zinc-300' : isClosed ? 'bg-zinc-300' : isActive ? 'bg-[#D62027]' : 'transparent'}`
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                                lineNumber: 611,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `w-10 h-10 text-white rounded-xl flex flex-col items-center justify-center shrink-0 ${isCompleted ? 'bg-emerald-500' : isTerminated ? 'bg-red-300' : isMissed ? 'bg-zinc-200' : isClosed ? 'bg-zinc-200' : isActive ? 'bg-[#D62027] shadow-[#D62027]/20 shadow-md' : 'bg-zinc-200 text-zinc-400'}`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[8px] font-black uppercase tracking-widest leading-none opacity-80",
                                                        children: monthStr
                                                    }, void 0, false, {
                                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                                        lineNumber: 627,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `text-sm font-black leading-none ${isClosed ? 'text-zinc-400' : 'text-white'}`,
                                                        children: dateStr
                                                    }, void 0, false, {
                                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                                        lineNumber: 628,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                                lineNumber: 619,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 flex items-center justify-between gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex flex-col gap-0.5",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
                                                                className: `font-black text-[13px] tracking-tight leading-tight flex items-center gap-1.5 ${isCompleted ? 'text-emerald-900' : isClosed ? 'text-zinc-400' : 'text-[#0f172a]'}`,
                                                                children: slot.domainName
                                                            }, void 0, false, {
                                                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                                                lineNumber: 633,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center gap-1.5",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-[10px] font-bold uppercase tracking-widest text-zinc-400",
                                                                    children: [
                                                                        formatTo12H(slot.domainStartTime),
                                                                        " – ",
                                                                        formatTo12H(slot.domainEndTime)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                                                    lineNumber: 641,
                                                                    columnNumber: 28
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                                                lineNumber: 640,
                                                                columnNumber: 25
                                                            }, this),
                                                            startsInText && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-[10px] font-black uppercase tracking-widest text-amber-600 tabular-nums",
                                                                children: [
                                                                    "Starts in: ",
                                                                    startsInText
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                                                lineNumber: 646,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                                        lineNumber: 632,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border ${isCompleted ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : isActive ? 'bg-red-50 text-[#D62027] border-red-100' : startsInText ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-zinc-50 text-zinc-400 border-zinc-100'}`,
                                                        children: isCompleted ? 'Completed' : isActive ? 'Active Now' : startsInText ? 'Upcoming' : 'Locked'
                                                    }, void 0, false, {
                                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                                        lineNumber: 652,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                                lineNumber: 631,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, slot.domainId, true, {
                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                        lineNumber: 599,
                                        columnNumber: 19
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                lineNumber: 573,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                        lineNumber: 565,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                lineNumber: 539,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-16 pb-12 w-full",
                children: !hasActiveTest ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-[#fcfdfd] border border-zinc-100 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center text-center min-h-65 no-hover",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                            className: "text-xl font-black text-zinc-900 tracking-tight mb-2 uppercase",
                            children: "No Active Tests Assigned"
                        }, void 0, false, {
                            fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                            lineNumber: 675,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs font-bold uppercase tracking-widest text-zinc-400 max-w-sm",
                            children: "Your institution has not published any active PRI readiness tests at this time. Please check back later."
                        }, void 0, false, {
                            fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                            lineNumber: 676,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                    lineNumber: 674,
                    columnNumber: 11
                }, this) : isCompleted ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white rounded-[28px] p-6 md:p-10 border border-slate-200 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] no-hover",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1 relative z-10 text-center md:text-left",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-center md:justify-start gap-3 mb-6",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "px-4 py-1.5 bg-white border border-zinc-200 rounded-full flex items-center gap-2.5 shadow-sm",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800",
                                            children: "Official Assessment Recorded"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                            lineNumber: 685,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                        lineNumber: 684,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                    lineNumber: 683,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: "text-4xl md:text-5xl font-black text-[#0f172a] tracking-tight leading-[1.1] mb-6 uppercase",
                                    children: [
                                        "Assessment ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[#D62027]",
                                            children: "Submitted Successfully"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                            lineNumber: 690,
                                            columnNumber: 28
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                    lineNumber: 689,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[16px] font-medium text-slate-500 leading-relaxed max-w-lg mb-10",
                                    children: [
                                        "Thank you for completing the ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: bankInfo?.title || 'this evaluation period'
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                            lineNumber: 694,
                                            columnNumber: 46
                                        }, this),
                                        ". Your responses have been securely logged and are now being processed by our Evaluation Engine. Results and final readiness scores will be updated in your Performance History once the verification phase is complete. We appreciate your diligent focus."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                    lineNumber: 693,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap items-center justify-center md:justify-start gap-4",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>router.push('/student?tab=results'),
                                        className: "flex items-center gap-3 px-8 py-5 bg-[#0f172a] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-slate-900/10 active:scale-95",
                                        children: "View Performance History"
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                        lineNumber: 698,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                    lineNumber: 697,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                            lineNumber: 682,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-full md:w-auto shrink-0 relative z-10 flex justify-center",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-48 h-48 bg-white rounded-[48px] flex items-center justify-center border border-zinc-100 relative transition-all duration-700 no-hover",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-28 h-28 bg-emerald-700 rounded-[36px] flex flex-col items-center justify-center relative z-10 border border-emerald-100/30",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[10px] font-black uppercase tracking-widest text-white/40 mb-1",
                                                children: "Status"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                                lineNumber: 711,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-black uppercase text-white tracking-widest",
                                                children: "Verified"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                                lineNumber: 712,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                        lineNumber: 710,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                    lineNumber: 709,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                lineNumber: 708,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                            lineNumber: 707,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                    lineNumber: 681,
                    columnNumber: 11
                }, this) : null
            }, void 0, false, {
                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                lineNumber: 672,
                columnNumber: 7
            }, this),
            data && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "space-y-6 mt-10 pt-6 border-t border-slate-100",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-2.5 bg-red-600 rounded-xl shadow-[0_0_15px_rgba(255,71,87,0.1)]",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"], {
                                    className: "w-5 h-5 text-white"
                                }, void 0, false, {
                                    fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                    lineNumber: 725,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                lineNumber: 724,
                                columnNumber: 14
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-[28px] font-black text-slate-900 tracking-tight uppercase leading-none",
                                children: "PRI Placement Readiness Score"
                            }, void 0, false, {
                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                lineNumber: 727,
                                columnNumber: 14
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                        lineNumber: 723,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-12 gap-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "md:col-span-8 bg-[#0f172a] rounded-[40px] p-8 relative overflow-hidden shadow-[0_30px_60px_-15px_rgba(15,23,42,0.3)] flex flex-col justify-between no-hover group transition-all duration-500 hover:shadow-[0_35px_70px_-15px_rgba(15,23,42,0.4)]",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-[#D62027]/10 opacity-60 pointer-events-none"
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                        lineNumber: 733,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute -right-20 -top-20 w-64 h-64 bg-[#D62027]/10 blur-[100px] rounded-full"
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                        lineNumber: 734,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute right-10 top-10 flex items-center justify-center w-14 h-14 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl transition-transform group-hover:scale-110",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                            className: "w-6 h-6 text-[#FF4757] fill-[#FF4757]"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                            lineNumber: 738,
                                            columnNumber: 20
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                        lineNumber: 737,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative z-10",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 font-sans",
                                                children: "Overall Placement Readiness Index"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                                lineNumber: 742,
                                                columnNumber: 20
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-baseline gap-2 mb-10",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[80px] font-black text-white tracking-tighter leading-none animate-in zoom-in duration-700",
                                                        children: priScore.toFixed(2)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                                        lineNumber: 744,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-3xl font-black text-[#FF4757] animate-pulse transition-all",
                                                        children: "%"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                                        lineNumber: 745,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                                lineNumber: 743,
                                                columnNumber: 20
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[11px] font-medium text-slate-400 italic max-w-sm mb-12",
                                                children: "Based on comprehensive skill assessment across all domains"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                                lineNumber: 747,
                                                columnNumber: 20
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                        lineNumber: 741,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative z-10",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex justify-between items-center mb-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[10px] font-black uppercase tracking-[0.3em] text-slate-500",
                                                        children: "Readiness Progress"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                                        lineNumber: 752,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[10px] font-black uppercase tracking-widest text-slate-200",
                                                        children: [
                                                            priScore.toFixed(2),
                                                            "% Complete"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                                        lineNumber: 753,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                                lineNumber: 751,
                                                columnNumber: 20
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-2.5 w-full bg-slate-800/50 rounded-full overflow-hidden border border-white/5 shadow-inner",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-full bg-gradient-to-r from-red-600 to-[#FF4757] shadow-[0_0_20px_rgba(255,71,87,0.4)] transition-all duration-1000 ease-out",
                                                    style: {
                                                        width: `${priScore}%`
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                                    lineNumber: 756,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                                lineNumber: 755,
                                                columnNumber: 20
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                        lineNumber: 750,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                lineNumber: 732,
                                columnNumber: 14
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "md:col-span-4 bg-white rounded-[40px] p-8 flex flex-col items-center justify-center text-center shadow-[0_30px_70px_-20px_rgba(15,23,42,0.06)] border border-slate-50 relative no-hover group overflow-hidden",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                        lineNumber: 766,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: cn("w-20 h-20 rounded-full flex items-center justify-center mb-8 border border-white shadow-xl relative z-10 animate-bounce-subtle", status.iconBg, status.shadow),
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                                            className: "w-9 h-9 text-white"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                            lineNumber: 773,
                                            columnNumber: 20
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                        lineNumber: 768,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 relative z-10",
                                        children: "Placement Status"
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                        lineNumber: 776,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: cn("text-[28px] font-black tracking-tight uppercase leading-none relative z-10 drop-shadow-sm", status.color),
                                        children: status.label
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                        lineNumber: 778,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                                lineNumber: 765,
                                columnNumber: 14
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                        lineNumber: 730,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                lineNumber: 722,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$components$2f$student$2f$insights$2f$SkillSpectrumRadar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                domainMetrics: domainMetrics,
                overallMetrics: overallMetrics,
                overallStatus: overallStatus
            }, void 0, false, {
                fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
                lineNumber: 789,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx",
        lineNumber: 431,
        columnNumber: 5
    }, this);
}
_s(StudentInsights, "ZaO9vE3sRz2FQeJRCyi1MXZCSBU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$components$2f$providers$2f$ui$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUI"]
    ];
});
_c = StudentInsights;
var _c;
__turbopack_context__.k.register(_c, "StudentInsights");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/components/student/insights/StudentInsights.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=Documents_Project_smart_hiresapien_in_components_student_insights_4fda3155._.js.map