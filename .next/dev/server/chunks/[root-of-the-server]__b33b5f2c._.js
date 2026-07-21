module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/Documents/Project/smart.hiresapien.in/lib/mongodb.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/Documents/Project/smart.hiresapien.in/node_modules/mongoose)");
;
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    throw new Error('MONGO_URI environment variable is not defined');
}
const cached = global._mongooseCache ?? {
    conn: null,
    promise: null
};
global._mongooseCache = cached;
async function connectDB() {
    if (cached.conn) {
        console.log('[MongoDB] ✅ Using existing cached connection');
        return cached.conn;
    }
    if (!cached.promise) {
        console.log('[MongoDB] 🔄 Initiating new connection to MongoDB...');
        cached.promise = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["default"].connect(MONGO_URI, {
            bufferCommands: false
        }).then((m)=>{
            console.log('[MongoDB] ✅ Connected successfully');
            return m;
        }).catch((err)=>{
            console.error('[MongoDB] ❌ Connection failed:', err);
            cached.promise = null;
            throw err;
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}
const __TURBOPACK__default__export__ = connectDB;
}),
"[project]/Documents/Project/smart.hiresapien.in/lib/domains.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CASE_BASED_TYPES",
    ()=>CASE_BASED_TYPES,
    "DOMAINS",
    ()=>DOMAINS,
    "DOMAIN_MAP",
    ()=>DOMAIN_MAP,
    "NO_CORRECT_ANSWER_TYPES",
    ()=>NO_CORRECT_ANSWER_TYPES
]);
const DOMAINS = [
    {
        id: 'cognitive-intelligence',
        number: '1',
        name: 'Cognitive Intelligence',
        description: 'How you reason, analyse data, and think under time pressure',
        assessmentType: 'Adaptive MCQ',
        totalQuestions: 21,
        skills: [
            'Logical Reasoning - Syllogisms',
            'Logical Reasoning - Deductive chains',
            'Logical Reasoning - Arrangement and sequencing',
            'Logical Reasoning - Statement-conclusion relationships',
            'Logical Reasoning - Facts, assumptions, inferences',
            'Numerical Reasoning - Percentage change',
            'Numerical Reasoning - Ratio and proportion',
            'Numerical Reasoning - CAGR',
            'Numerical Reasoning - Work-rate problems',
            'Numerical Reasoning - Compound interest',
            'Data Interpretation - Bar charts and line charts',
            'Data Interpretation - Pie charts',
            'Data Interpretation - Data tables',
            'Data Interpretation - Trend identification',
            'Data Interpretation - Multi-source data integration',
            'Critical Thinking - Unstated assumptions',
            'Critical Thinking - Evidence strength',
            'Critical Thinking - Argument fallacies',
            'Critical Thinking - Strengthen and weaken arguments',
            'Critical Thinking - Correlation vs causation',
            'Pattern Recognition - Number series',
            'Pattern Recognition - Matrix and visual patterns',
            'Pattern Recognition - Alphanumeric sequences',
            'Pattern Recognition - Odd-one-out'
        ],
        passFail: false,
        color: 'blue'
    },
    {
        id: 'business-intelligence',
        number: '2',
        name: 'Business Intelligence',
        description: 'How well you read, interpret and act on business data and case information',
        assessmentType: 'Case-based MCQ',
        totalQuestions: 20,
        skills: [
            'Financial Statement Interpretation - Profit and loss statement',
            'Financial Statement Interpretation - Balance sheet',
            'Financial Statement Interpretation - Return ratios - ROE, ROA, ROCE',
            'Financial Statement Interpretation - Financial health indicators and red flags',
            'Financial Statement Interpretation - Working capital analysis',
            "Market Analysis - Porter's Five Forces",
            'Market Analysis - TAM, SAM, SOM',
            'Market Analysis - Market share',
            'Market Analysis - Market entry attractiveness',
            'Market Analysis - Market growth rate interpretation',
            'Unit Economics and Revenue Models - LTV and CAC',
            'Unit Economics and Revenue Models - Subscription metrics - MRR, ARR, churn',
            'Unit Economics and Revenue Models - Breakeven analysis',
            'Unit Economics and Revenue Models - SaaS and marketplace unit economics',
            'Unit Economics and Revenue Models - Pricing model implications',
            'Competitive Analysis and Business Models - Business model types',
            'Competitive Analysis and Business Models - Value chain analysis',
            'Competitive Analysis and Business Models - Generic competitive strategies',
            'Competitive Analysis and Business Models - Reading strategic position',
            'Competitive Analysis and Business Models - Competitive moats'
        ],
        passFail: false,
        color: 'emerald'
    },
    {
        id: 'problem-solving',
        number: '3',
        name: 'Problem Solving',
        description: 'How you break down complex business problems and build structured solutions',
        assessmentType: 'Case Simulation + MCQ',
        totalQuestions: 26,
        skills: [
            'MECE Decomposition - MECE principle',
            'MECE Decomposition - First-level problem splits',
            'MECE Decomposition - Issue trees',
            'MECE Decomposition - Hypothesis trees',
            'MECE Decomposition - Identifying MECE failures',
            'Root Cause Analysis - 5-Whys methodology',
            'Root Cause Analysis - Proximate cause vs root cause',
            'Root Cause Analysis - Causal variable isolation',
            'Root Cause Analysis - Operational data reading',
            'Root Cause Analysis - Systematic hypothesis elimination',
            'Hypothesis-Driven Thinking - Forming a prioritized hypothesis',
            'Hypothesis-Driven Thinking - Identifying confirming or denying data',
            'Hypothesis-Driven Thinking - Testability ranking',
            'Hypothesis-Driven Thinking - Killer question',
            'Hypothesis-Driven Thinking - Solution bias',
            'Risk Assessment and Strategic Planning - Impact x probability matrix',
            'Risk Assessment and Strategic Planning - Risk categorization',
            'Risk Assessment and Strategic Planning - Strategic planning frameworks',
            'Risk Assessment and Strategic Planning - Trade-off evaluation',
            'Risk Assessment and Strategic Planning - Scenario planning',
            'Quantitative Problem Solving - Market sizing',
            'Quantitative Problem Solving - Breakeven and payback period',
            'Quantitative Problem Solving - Profitability improvement levers',
            'Quantitative Problem Solving - Revenue and cost modeling',
            'Quantitative Problem Solving - Case math shortcuts'
        ],
        passFail: false,
        color: 'violet'
    },
    {
        id: 'communication',
        number: '4',
        name: 'Communication',
        description: 'How clearly and persuasively you communicate in professional contexts',
        assessmentType: 'MCQ + Written Task',
        totalQuestions: 15,
        skills: [
            'Professional Writing and Email - Pyramid Principle',
            'Professional Writing and Email - Tone and register',
            'Professional Writing and Email - Email structure',
            'Professional Writing and Email - Identifying poor communication',
            'Persuasion and Influence - Argument structure and strength',
            'Persuasion and Influence - Pyramid Principle in recommendations',
            'Persuasion and Influence - Persuasive framing',
            'Storytelling with Data - Insight headlines vs descriptive titles',
            'Storytelling with Data - Chart type selection',
            'Storytelling with Data - Framing data for executive audience',
            'Storytelling with Data - Misleading visualizations',
            'Business Writing Task - Business proposals',
            'Business Writing Task - Reports',
            'Business Writing Task - Executive summaries',
            'Business Writing Task - Persuasive pitches',
            'Negotiation and Professional Conflict - Principled negotiation',
            'Negotiation and Professional Conflict - BATNA',
            'Negotiation and Professional Conflict - Balancing outcomes and relationships',
            'Negotiation and Professional Conflict - Counter-proposal structure'
        ],
        passFail: false,
        color: 'amber'
    },
    {
        id: 'leadership',
        number: '5',
        name: 'Leadership',
        description: 'How you respond to workplace situations requiring judgment, ethics, and leadership',
        assessmentType: 'Situational Judgment Test',
        totalQuestions: 20,
        skills: [
            'Team Leadership and Collaboration - Delegation',
            'Team Leadership and Collaboration - Managing underperformance',
            'Team Leadership and Collaboration - Psychological safety',
            'Team Leadership and Collaboration - Cross-functional collaboration',
            'Team Leadership and Collaboration - Recognition and motivation',
            'Conflict Resolution - Timing and medium of conflict',
            'Conflict Resolution - SBI feedback model',
            'Conflict Resolution - De-escalation',
            'Conflict Resolution - Impartiality in team disputes',
            'Conflict Resolution - Fairness vs decisiveness',
            'Decision-Making and Accountability - Deciding under incomplete information',
            'Decision-Making and Accountability - Escalation vs ownership',
            'Decision-Making and Accountability - Decision documentation',
            'Decision-Making and Accountability - Ownership of poor outcomes',
            'Decision-Making and Accountability - Speed vs thoroughness trade-off',
            'Emotional Intelligence and Empathy - Recognizing emotional signals',
            'Emotional Intelligence and Empathy - Self-regulation under pressure',
            'Emotional Intelligence and Empathy - Empathetic response within professional boundaries',
            'Emotional Intelligence and Empathy - Adjusting communication style by context',
            'Emotional Intelligence and Empathy - Reading interpersonal dynamics',
            'Ethical Judgment - Conflict of interest',
            'Ethical Judgment - Selective disclosure',
            'Ethical Judgment - Pressure to compromise standards',
            'Ethical Judgment - Governance shortcuts',
            'Ethical Judgment - Whistleblowing judgment'
        ],
        passFail: false,
        color: 'rose'
    },
    {
        id: 'digital-business',
        number: '6',
        name: 'Digital Business',
        description: 'How aware and capable you are with data, AI, and digital tools in business contexts',
        assessmentType: 'Applied MCQ',
        totalQuestions: 15,
        skills: [
            'Data Literacy - KPI selection',
            'Data Literacy - Dashboard reading',
            'Data Literacy - Data quality issues',
            'Data Literacy - Cohort analysis',
            'Data Literacy - Correlation vs causation',
            'GenAI and LLM Business Applications - Selecting the right GenAI tool',
            'GenAI and LLM Business Applications - Hallucination detection',
            'GenAI and LLM Business Applications - Prompt engineering',
            'GenAI and LLM Business Applications - AI governance',
            'GenAI and LLM Business Applications - Human judgment vs AI assistance',
            'AI Awareness and Data Analytics - Precision vs recall',
            'AI Awareness and Data Analytics - AI bias',
            'AI Awareness and Data Analytics - Build vs buy vs partner',
            'AI Awareness and Data Analytics - ETL',
            'AI Awareness and Data Analytics - AI project failure modes',
            'Digital Marketing Fundamentals - SEO vs SEM',
            'Digital Marketing Fundamentals - ROAS',
            'Digital Marketing Fundamentals - Attribution models',
            'Digital Marketing Fundamentals - Conversion rate optimization',
            'Digital Marketing Fundamentals - Customer acquisition cost',
            'Automation and No-Code Tools - RPA suitability',
            'Automation and No-Code Tools - No-code tools',
            'Automation and No-Code Tools - AI-powered vs rule-based automation',
            'Automation and No-Code Tools - Automation ROI',
            'Automation and No-Code Tools - Limits of automation',
            'Cloud and Digital Infrastructure - SaaS vs PaaS vs IaaS',
            'Cloud and Digital Infrastructure - Capex vs opex',
            'Cloud and Digital Infrastructure - Data sovereignty and DPDP Act',
            'Cloud and Digital Infrastructure - Cloud-native vs cloud-ready',
            'Cloud and Digital Infrastructure - Multi-cloud strategy',
            'Business Tools Proficiency - CRM platforms',
            'Business Tools Proficiency - HRIS systems',
            'Business Tools Proficiency - BI tools',
            'Business Tools Proficiency - Project management tools',
            'Business Tools Proficiency - iPaaS and integration tools'
        ],
        passFail: false,
        color: 'cyan'
    },
    {
        id: 'workspace-psychology',
        number: 'G',
        name: 'Workspace Psychology GATE',
        description: 'Who you are in a workplace — behavioural profile',
        assessmentType: 'Ipsative Psychometric',
        totalQuestions: 20,
        skills: [
            'Stress resilience',
            'Grit & initiative',
            'Professionalism',
            'Cultural adaptability',
            'Accountability'
        ],
        passFail: true,
        color: 'orange'
    }
];
const DOMAIN_MAP = Object.fromEntries(DOMAINS.map((d)=>[
        d.id,
        d
    ]));
const CASE_BASED_TYPES = new Set([
    'Case-based MCQ',
    'Case Simulation + MCQ',
    'Situational Judgment Test'
]);
const NO_CORRECT_ANSWER_TYPES = new Set([
    'Ipsative Psychometric'
]);
}),
"[project]/Documents/Project/smart.hiresapien.in/models/ContributorQuestion.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/Documents/Project/smart.hiresapien.in/node_modules/mongoose)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$domains$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/lib/domains.ts [app-route] (ecmascript)");
;
;
const DOMAIN_IDS = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$domains$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DOMAINS"].map((d)=>d.id);
const OptionSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"]({
    label: {
        type: String,
        required: true,
        maxlength: 2
    },
    text: {
        type: String,
        required: true,
        maxlength: 2000
    },
    imageUrl: {
        type: String,
        maxlength: 2000
    },
    score: {
        type: Number,
        min: -1,
        max: 1
    }
}, {
    _id: false
});
const ContributorQuestionSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"]({
    uniqueId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    domain: {
        type: String,
        required: [
            true,
            'Domain is required'
        ],
        enum: {
            values: DOMAIN_IDS,
            message: 'Invalid domain'
        },
        index: true
    },
    subSkill: {
        type: String,
        required: [
            true,
            'Subskill is required'
        ],
        maxlength: [
            200,
            'Subskill cannot exceed 200 characters'
        ]
    },
    assessmentType: {
        type: String,
        required: [
            true,
            'Assessment type is required'
        ]
    },
    bloomLevel: {
        type: String,
        required: function() {
            return this.domain !== 'workspace-psychology';
        },
        enum: [
            'Remember',
            'Understand',
            'Apply',
            'Analyse',
            'Create',
            'Evaluate'
        ]
    },
    questionType: {
        type: String,
        required: [
            true,
            'Question type is required'
        ],
        enum: [
            'mcq',
            'written'
        ],
        index: true
    },
    questionText: {
        type: String,
        required: [
            true,
            'Question text is required'
        ],
        minlength: [
            10,
            'Question must be at least 10 characters'
        ],
        maxlength: [
            5000,
            'Question cannot exceed 5000 characters'
        ]
    },
    questionImageUrl: {
        type: String,
        maxlength: [
            2000,
            'Question image URL cannot exceed 2000 characters'
        ]
    },
    sourceDetails: {
        type: String,
        maxlength: [
            2000,
            'Source details cannot exceed 2000 characters'
        ]
    },
    caseContext: {
        type: String,
        maxlength: [
            5000,
            'Case context cannot exceed 5000 characters'
        ]
    },
    caseContextImageUrl: {
        type: String,
        maxlength: [
            2000,
            'Case context image URL cannot exceed 2000 characters'
        ]
    },
    options: {
        type: [
            OptionSchema
        ],
        validate: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            validator: function(opts) {
                if (this.questionType === 'written') {
                    return opts.length === 0;
                }
                return opts.length >= 2 && opts.length <= 5;
            },
            message: 'Options must contain between 2 and 5 items for MCQ questions'
        },
        default: []
    },
    correctAnswer: {
        type: String,
        maxlength: 2,
        required: function() {
            return this.questionType === 'mcq' && this.domain !== 'workspace-psychology';
        }
    },
    explanation: {
        type: String,
        maxlength: [
            2000,
            'Explanation cannot exceed 2000 characters'
        ]
    },
    explanationImageUrl: {
        type: String,
        maxlength: [
            2000,
            'Explanation image URL cannot exceed 2000 characters'
        ]
    },
    difficulty: {
        type: String,
        required: [
            true,
            'Difficulty is required'
        ],
        enum: [
            'easy',
            'medium',
            'hard'
        ],
        default: 'medium'
    },
    estimatedTimeMinutes: {
        type: Number,
        required: [
            true,
            'Estimated time is required'
        ],
        min: [
            0.1,
            'Estimated time must be at least 0.1 minutes'
        ],
        max: [
            240,
            'Estimated time cannot exceed 240 minutes'
        ]
    },
    contributorId: {
        type: __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"].Types.ObjectId,
        required: true,
        ref: 'Contributor',
        index: true
    },
    contributorUsername: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: [
            'pending',
            'approved',
            'rejected'
        ],
        default: 'pending',
        index: true
    },
    reviewNote: {
        type: String,
        maxlength: 1000
    },
    reviewedAt: {
        type: Date
    },
    reviewedBy: {
        type: String
    }
}, {
    timestamps: true,
    collection: 'contributor_questions'
});
ContributorQuestionSchema.pre('validate', function(next) {
    if (!this.uniqueId || this.isModified('domain') || this.isModified('subSkill')) {
        const normalizedSubSkill = String(this.subSkill ?? '').trim().replace(/\s+/g, '_');
        this.uniqueId = `${this.domain}_${normalizedSubSkill}_${this._id}`;
    }
    if (typeof next === 'function') {
        next();
    }
});
const ContributorQuestion = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["default"].models.ContributorQuestion || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["default"].model('ContributorQuestion', ContributorQuestionSchema);
const __TURBOPACK__default__export__ = ContributorQuestion;
}),
"[project]/Documents/Project/smart.hiresapien.in/models/Question.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/Documents/Project/smart.hiresapien.in/node_modules/mongoose)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$domains$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/lib/domains.ts [app-route] (ecmascript)");
;
;
const DOMAIN_IDS = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$domains$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DOMAINS"].map((d)=>d.id);
const OptionSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"]({
    label: {
        type: String,
        required: true,
        maxlength: 2
    },
    text: {
        type: String,
        required: true,
        maxlength: 2000
    },
    imageUrl: {
        type: String,
        maxlength: 2000
    },
    score: {
        type: Number,
        min: -1,
        max: 1
    }
}, {
    _id: false
});
const QuestionSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"]({
    uniqueId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    domain: {
        type: String,
        required: [
            true,
            'Domain is required'
        ],
        enum: {
            values: DOMAIN_IDS,
            message: 'Invalid domain'
        },
        index: true
    },
    subSkill: {
        type: String,
        required: [
            true,
            'Subskill is required'
        ],
        maxlength: [
            200,
            'Subskill cannot exceed 200 characters'
        ]
    },
    assessmentType: {
        type: String,
        required: [
            true,
            'Assessment type is required'
        ]
    },
    bloomLevel: {
        type: String,
        required: function() {
            return this.domain !== 'workspace-psychology';
        },
        enum: [
            'Remember',
            'Understand',
            'Apply',
            'Analyse',
            'Create',
            'Evaluate'
        ]
    },
    questionType: {
        type: String,
        required: [
            true,
            'Question type is required'
        ],
        enum: [
            'mcq',
            'written'
        ],
        index: true
    },
    questionText: {
        type: String,
        required: [
            true,
            'Question text is required'
        ],
        minlength: [
            10,
            'Question must be at least 10 characters'
        ],
        maxlength: [
            5000,
            'Question cannot exceed 5000 characters'
        ]
    },
    questionImageUrl: {
        type: String,
        maxlength: [
            2000,
            'Question image URL cannot exceed 2000 characters'
        ]
    },
    caseContext: {
        type: String,
        maxlength: [
            5000,
            'Case context cannot exceed 5000 characters'
        ]
    },
    caseContextImageUrl: {
        type: String,
        maxlength: [
            2000,
            'Case context image URL cannot exceed 2000 characters'
        ]
    },
    options: {
        type: [
            OptionSchema
        ],
        validate: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            validator: function(opts) {
                if (this.questionType === 'written') {
                    return opts.length === 0;
                }
                return opts.length >= 2 && opts.length <= 5;
            },
            message: 'Options must contain between 2 and 5 items for MCQ questions'
        },
        default: []
    },
    correctAnswer: {
        type: String,
        maxlength: 2,
        required: function() {
            return this.questionType === 'mcq' && this.domain !== 'workspace-psychology';
        }
    },
    explanation: {
        type: String,
        maxlength: [
            2000,
            'Explanation cannot exceed 2000 characters'
        ]
    },
    explanationImageUrl: {
        type: String,
        maxlength: [
            2000,
            'Explanation image URL cannot exceed 2000 characters'
        ]
    },
    difficulty: {
        type: String,
        required: [
            true,
            'Difficulty is required'
        ],
        enum: [
            'easy',
            'medium',
            'hard'
        ],
        default: 'medium'
    },
    estimatedTimeMinutes: {
        type: Number,
        required: [
            true,
            'Estimated time is required'
        ],
        min: [
            0.1,
            'Estimated time must be at least 0.1 minutes'
        ],
        max: [
            240,
            'Estimated time cannot exceed 240 minutes'
        ]
    },
    contributorId: {
        type: __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"].Types.ObjectId,
        required: true,
        ref: 'Contributor',
        index: true
    },
    contributorUsername: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: [
            'pending',
            'approved',
            'rejected'
        ],
        default: 'pending',
        index: true
    },
    reviewNote: {
        type: String,
        maxlength: 1000
    },
    reviewedAt: {
        type: Date
    },
    reviewedBy: {
        type: String
    }
}, {
    timestamps: true,
    collection: 'questions'
});
const Question = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["default"].models.Question || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["default"].model('Question', QuestionSchema);
const __TURBOPACK__default__export__ = Question;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/Documents/Project/smart.hiresapien.in/lib/auth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAdminFromAuthHeader",
    ()=>getAdminFromAuthHeader,
    "getContributorFromAuthHeader",
    ()=>getContributorFromAuthHeader,
    "getFacultyFromAuthHeader",
    ()=>getFacultyFromAuthHeader,
    "getInstitutionAdminFromAuthHeader",
    ()=>getInstitutionAdminFromAuthHeader,
    "getStudentFromAuthHeader",
    ()=>getStudentFromAuthHeader,
    "getUserFromAuthHeader",
    ()=>getUserFromAuthHeader,
    "getUserFromRequest",
    ()=>getUserFromRequest,
    "isValidOrigin",
    ()=>isValidOrigin,
    "signAdminToken",
    ()=>signAdminToken,
    "signContributorToken",
    ()=>signContributorToken,
    "signFacultyToken",
    ()=>signFacultyToken,
    "signInstitutionAdminToken",
    ()=>signInstitutionAdminToken,
    "signStudentToken",
    ()=>signStudentToken,
    "signToken",
    ()=>signToken,
    "verifyAdminToken",
    ()=>verifyAdminToken,
    "verifyContributorToken",
    ()=>verifyContributorToken,
    "verifyToken",
    ()=>verifyToken
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
const JWT_SECRET = process.env.JWT_SECRET ?? 'grad360mba-default-secret-change-in-production';
function base64UrlEncode(str) {
    return Buffer.from(str, 'utf-8').toString('base64url');
}
function base64UrlDecode(str) {
    return Buffer.from(str, 'base64url').toString('utf-8');
}
function signToken(payloadInput) {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        role: payloadInput.role,
        ...payloadInput.id ? {
            id: payloadInput.id
        } : {},
        username: payloadInput.username,
        ...payloadInput.institutionId ? {
            institutionId: payloadInput.institutionId
        } : {},
        iat: now,
        exp: now + payloadInput.expiresInSeconds
    };
    const header = base64UrlEncode(JSON.stringify({
        alg: 'HS256',
        typ: 'JWT'
    }));
    const body = base64UrlEncode(JSON.stringify(payload));
    const signature = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    return `${header}.${body}.${signature}`;
}
function verifyToken(token) {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSignature = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    const sigBuffer = Buffer.from(signature, 'base64url');
    const expectedBuffer = Buffer.from(expectedSignature, 'base64url');
    if (sigBuffer.length !== expectedBuffer.length || !__TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].timingSafeEqual(sigBuffer, expectedBuffer)) {
        return null;
    }
    let payload;
    try {
        payload = JSON.parse(base64UrlDecode(body));
    } catch  {
        return null;
    }
    if (payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
    }
    return payload;
}
function getUserFromAuthHeader(authHeader) {
    if (!authHeader?.startsWith('Bearer ')) return null;
    return verifyToken(authHeader.slice(7));
}
function signAdminToken(username) {
    return signToken({
        role: 'admin',
        username,
        expiresInSeconds: 86400
    });
}
function verifyAdminToken(token) {
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') return null;
    return payload;
}
function getAdminFromAuthHeader(authHeader) {
    const payload = getUserFromAuthHeader(authHeader);
    if (!payload || payload.role !== 'admin') return null;
    return payload;
}
function signContributorToken(id, username) {
    return signToken({
        role: 'contributor',
        id,
        username,
        expiresInSeconds: 28800
    });
}
function verifyContributorToken(token) {
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'contributor' || !payload.id) return null;
    return payload;
}
function getContributorFromAuthHeader(authHeader) {
    const payload = getUserFromAuthHeader(authHeader);
    if (!payload || payload.role !== 'contributor' || !payload.id) return null;
    return payload;
}
function signInstitutionAdminToken(id, username, institutionId) {
    return signToken({
        role: 'institution_admin',
        id,
        username,
        institutionId,
        expiresInSeconds: 28800
    });
}
function getInstitutionAdminFromAuthHeader(authHeader) {
    const payload = getUserFromAuthHeader(authHeader);
    if (!payload || payload.role !== 'institution_admin' || !payload.id || !payload.institutionId) {
        return null;
    }
    return payload;
}
function signFacultyToken(id, username, institutionId) {
    return signToken({
        role: 'faculty',
        id,
        username,
        institutionId,
        expiresInSeconds: 28800
    });
}
function getFacultyFromAuthHeader(authHeader) {
    const payload = getUserFromAuthHeader(authHeader);
    if (!payload || payload.role !== 'faculty' || !payload.id || !payload.institutionId) {
        return null;
    }
    return payload;
}
function signStudentToken(id, username, institutionId) {
    return signToken({
        role: 'student',
        id,
        username,
        institutionId,
        expiresInSeconds: 28800
    });
}
function getStudentFromAuthHeader(authHeader) {
    const payload = getUserFromAuthHeader(authHeader);
    if (!payload || payload.role !== 'student' || !payload.id || !payload.institutionId) {
        return null;
    }
    return payload;
}
async function getUserFromRequest(request) {
    const token = request.cookies.get('token')?.value;
    if (!token) return null;
    return verifyToken(token);
}
function isValidOrigin(request) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const host = request.headers.get('host');
    // We check if the origin/referer starts with the same protocol and host.
    const checkUrl = (url)=>{
        if (!url) return false;
        try {
            const urlObj = new URL(url);
            return urlObj.host === host;
        } catch  {
            return false;
        }
    };
    // If it's a browser navigation or direct access without origin (like GET), 
    // check the referer. 
    // For cross-origin POST/PUT/DELETE, the browser sends an Origin header.
    if (origin) {
        return checkUrl(origin);
    }
    if (referer) {
        return checkUrl(referer);
    }
    // If no origin and no referer, it might be a direct API call from elsewhere
    return false;
}
}),
"[project]/Documents/Project/smart.hiresapien.in/app/api/admin/questions/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/lib/mongodb.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$ContributorQuestion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/models/ContributorQuestion.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$Question$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/models/Question.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/Documents/Project/smart.hiresapien.in/node_modules/mongoose)");
;
;
;
;
;
;
async function GET(request) {
    const admin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAdminFromAuthHeader"])(request.headers.get('Authorization'));
    if (!admin) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Unauthorized'
        }, {
            status: 401
        });
    }
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const domain = searchParams.get('domain');
    const subSkill = searchParams.get('subSkill');
    const contributorId = searchParams.get('contributorId');
    const contributorSearch = searchParams.get('contributorSearch');
    const search = searchParams.get('search');
    const pageParam = searchParams.get('page');
    const pageSizeParam = searchParams.get('pageSize');
    const sortByParam = searchParams.get('sortBy');
    const sortDirParam = searchParams.get('sortDir');
    const filter = {};
    if (status && [
        'pending',
        'approved',
        'rejected'
    ].includes(status)) {
        filter.status = status;
    }
    if (domain) {
        filter.domain = domain;
    }
    if (subSkill) {
        filter.subSkill = subSkill;
    }
    if (contributorId) {
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["default"].Types.ObjectId.isValid(contributorId)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid contributorId'
            }, {
                status: 400
            });
        }
        filter.contributorId = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["default"].Types.ObjectId(contributorId);
    }
    if (contributorSearch) {
        filter.contributorUsername = {
            $regex: contributorSearch,
            $options: 'i'
        };
    }
    if (search) {
        filter.questionText = {
            $regex: search,
            $options: 'i'
        };
    }
    const page = Math.max(1, Number(pageParam) || 1);
    const pageSize = Math.min(100, Math.max(5, Number(pageSizeParam) || 20));
    const sortBy = [
        'createdAt',
        'contributorUsername',
        'domain'
    ].includes(String(sortByParam)) ? sortByParam : 'createdAt';
    const sortDir = sortDirParam === 'asc' ? 1 : -1;
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
        let total;
        let questions;
        if (status === 'approved') {
            total = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$Question$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].countDocuments(filter);
            questions = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$Question$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].find(filter).populate('contributorId', 'displayName').sort({
                [sortBy]: sortDir,
                createdAt: -1
            }).skip((page - 1) * pageSize).limit(pageSize).lean();
        } else {
            total = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$ContributorQuestion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].countDocuments(filter);
            questions = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$ContributorQuestion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].find(filter).populate('contributorId', 'displayName').sort({
                [sortBy]: sortDir,
                createdAt: -1
            }).skip((page - 1) * pageSize).limit(pageSize).lean();
        }
        const normalizedQuestions = questions.map((question)=>({
                ...question,
                _id: question._id?.toString?.() ?? question._id,
                contributorId: typeof question.contributorId === 'object' ? question.contributorId : question.contributorId?.toString?.() ?? question.contributorId
            }));
        const contributors = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$ContributorQuestion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].aggregate([
            {
                $group: {
                    _id: {
                        contributorId: '$contributorId',
                        contributorUsername: '$contributorUsername'
                    },
                    totalQuestions: {
                        $sum: 1
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    contributorId: {
                        $toString: '$_id.contributorId'
                    },
                    contributorUsername: '$_id.contributorUsername',
                    totalQuestions: 1
                }
            },
            {
                $sort: {
                    totalQuestions: -1,
                    contributorUsername: 1
                }
            }
        ]);
        const domainStats = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$Question$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].aggregate([
            {
                $match: {
                    status: 'approved'
                }
            },
            {
                $group: {
                    _id: '$domain',
                    count: {
                        $sum: 1
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    domainId: '$_id',
                    count: 1
                }
            }
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            questions: normalizedQuestions,
            contributors,
            domainStats,
            pagination: {
                total,
                page,
                pageSize
            }
        }, {
            status: 200
        });
    } catch (error) {
        console.error('[GET /api/admin/questions]', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to fetch questions'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__b33b5f2c._.js.map