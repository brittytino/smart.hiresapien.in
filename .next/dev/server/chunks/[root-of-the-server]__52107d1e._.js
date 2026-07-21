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
        id: 'computational-thinking',
        number: 'D1',
        name: 'Computational Thinking',
        description: 'Logical reasoning, problem decomposition, pattern recognition, and algorithm efficiency',
        assessmentType: 'Adaptive MCQ',
        totalQuestions: 10,
        skills: [
            'Logical reasoning',
            'Problem decomposition',
            'Pattern recognition',
            'Algorithm selection',
            'Computational efficiency'
        ],
        passFail: false,
        color: 'blue'
    },
    {
        id: 'programming-fundamentals',
        number: 'D2',
        name: 'Programming Fundamentals',
        description: 'Language fundamentals, variables, data structures, OOP, functions, and error handling',
        assessmentType: 'Adaptive MCQ',
        totalQuestions: 15,
        skills: [
            'Variables and Scope',
            'Core Data Structures',
            'Functions and Closures',
            'OOP Principles',
            'Error Handling',
            'Language fundamentals'
        ],
        passFail: false,
        color: 'emerald'
    },
    {
        id: 'frontend-engineering',
        number: 'D3',
        name: 'Frontend Engineering',
        description: 'HTML, CSS, JS, React fundamentals, component design, responsive UI, and accessibility',
        assessmentType: 'Adaptive MCQ',
        totalQuestions: 15,
        skills: [
            'HTML Semantics',
            'CSS Layouts & Responsive UI',
            'JavaScript Core',
            'React Fundamentals',
            'Component Architecture',
            'Web Accessibility (a11y)'
        ],
        passFail: false,
        color: 'indigo'
    },
    {
        id: 'backend-engineering',
        number: 'D4',
        name: 'Backend Engineering',
        description: 'REST APIs, Authentication, Authorization, Middleware, Business Logic, and Server Architecture',
        assessmentType: 'Adaptive MCQ',
        totalQuestions: 15,
        skills: [
            'REST APIs design',
            'Authentication mechanics',
            'Authorization models',
            'Business logic validation',
            'Middleware layers',
            'Server architecture & scaling',
            'Backend Error handling'
        ],
        passFail: false,
        color: 'purple'
    },
    {
        id: 'database-engineering',
        number: 'D5',
        name: 'Database Engineering',
        description: 'SQL & NoSQL, schema design, relationships, query optimization, and transactions',
        assessmentType: 'Adaptive MCQ',
        totalQuestions: 10,
        skills: [
            'SQL Queries',
            'NoSQL Storage',
            'Schema design & normalization',
            'Database Relationships',
            'Query optimization',
            'Transactions & ACID'
        ],
        passFail: false,
        color: 'amber'
    },
    {
        id: 'debugging-quality',
        number: 'D6',
        name: 'Debugging & Quality Engineering',
        description: 'Bug identification, root cause analysis, code tracing, testing concepts, and logs',
        assessmentType: 'Adaptive MCQ',
        totalQuestions: 10,
        skills: [
            'Bug identification',
            'Root cause analysis',
            'Code tracing & execution flow',
            'Testing concepts & frameworks',
            'Log analysis & diagnostic telemetry'
        ],
        passFail: false,
        color: 'rose'
    },
    {
        id: 'system-design',
        number: 'D7',
        name: 'System Design & Architecture',
        description: 'Scalability, microservices, caching, load balancing, security, and design trade-offs',
        assessmentType: 'Adaptive MCQ',
        totalQuestions: 15,
        skills: [
            'System Scalability',
            'Architecture patterns',
            'Microservices orchestration',
            'Caching strategies',
            'Load balancing',
            'System Security & Encryption',
            'Design trade-offs'
        ],
        passFail: false,
        color: 'violet'
    },
    {
        id: 'ai-augmented',
        number: 'D8',
        name: 'AI-Augmented Engineering',
        description: 'Prompt engineering, AI-assisted coding, code verification, secure AI usage, and debugging',
        assessmentType: 'Adaptive MCQ',
        totalQuestions: 10,
        skills: [
            'Prompt engineering design',
            'AI-assisted coding flow',
            'AI output verification',
            'Secure AI usage & compliance',
            'AI debugging',
            'Responsible AI practices'
        ],
        passFail: false,
        color: 'cyan'
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
"[project]/Documents/Project/smart.hiresapien.in/models/PriTestBank.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
const PriTestBankSubskillSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"]({
    name: {
        type: String,
        required: true,
        maxlength: 200
    },
    share: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    priContribution: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    questionCount: {
        type: Number,
        required: true,
        min: 1,
        max: 200
    },
    questionType: {
        type: String,
        required: true,
        enum: [
            'mcq',
            'written'
        ]
    },
    difficultyShare: {
        easy: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        medium: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        hard: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        }
    }
}, {
    _id: false
});
const PriTestBankDomainSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"]({
    domainId: {
        type: String,
        required: true,
        enum: {
            values: DOMAIN_IDS,
            message: 'Invalid domain'
        }
    },
    domainName: {
        type: String,
        required: true,
        maxlength: 200
    },
    domainShare: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    domainStartTime: {
        type: String,
        required: true,
        maxlength: 5
    },
    domainEndTime: {
        type: String,
        required: true,
        maxlength: 5
    },
    subskills: {
        type: [
            PriTestBankSubskillSchema
        ],
        default: []
    }
}, {
    _id: false
});
const PriTestBankOptionSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"]({
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
const PriTestBankQuestionSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"]({
    domainId: {
        type: String,
        required: true
    },
    domainName: {
        type: String,
        required: true
    },
    subSkill: {
        type: String,
        required: true
    },
    questionType: {
        type: String,
        required: true,
        enum: [
            'mcq',
            'written'
        ]
    },
    difficulty: {
        type: String,
        required: true,
        enum: [
            'easy',
            'medium',
            'hard'
        ],
        default: 'medium'
    },
    questionText: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 5000
    },
    questionImageUrl: {
        type: String,
        maxlength: 2000
    },
    caseContext: {
        type: String,
        maxlength: 5000
    },
    caseContextImageUrl: {
        type: String,
        maxlength: 2000
    },
    options: {
        type: [
            PriTestBankOptionSchema
        ],
        default: []
    },
    correctAnswer: {
        type: String,
        maxlength: 2
    }
}, {
    _id: false
});
const PriTestBankInstitutionSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"]({
    institutionId: {
        type: __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"].Types.ObjectId,
        ref: 'Institution',
        required: true
    },
    status: {
        type: String,
        enum: [
            'pending',
            'accepted',
            'rejected'
        ],
        default: 'pending'
    },
    examStartDate: {
        type: Date,
        required: true
    },
    examEndDate: {
        type: Date,
        required: true
    },
    sharedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    respondedAt: {
        type: Date
    },
    isResultsPublished: {
        type: Boolean,
        default: false
    }
}, {
    _id: false
});
const PriTestBankSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"]({
    title: {
        type: String,
        required: true,
        maxlength: 200
    },
    program: {
        type: String,
        required: true,
        maxlength: 120
    },
    status: {
        type: String,
        enum: [
            'draft',
            'published',
            'completed'
        ],
        default: 'draft',
        index: true
    },
    domains: {
        type: [
            PriTestBankDomainSchema
        ],
        default: []
    },
    questions: {
        type: [
            PriTestBankQuestionSchema
        ],
        default: []
    },
    institutions: {
        type: [
            PriTestBankInstitutionSchema
        ],
        default: []
    },
    createdBy: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    collection: 'pri_test_banks'
});
const PriTestBank = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["default"].models.PriTestBank || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["default"].model('PriTestBank', PriTestBankSchema);
const __TURBOPACK__default__export__ = PriTestBank;
}),
"[project]/Documents/Project/smart.hiresapien.in/models/PriTestResponse.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/Documents/Project/smart.hiresapien.in/node_modules/mongoose)");
;
const PriTestResponseAnswerSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"]({
    questionIndex: {
        type: Number,
        required: true,
        min: 0
    },
    questionId: {
        type: String,
        maxlength: 80
    },
    questionType: {
        type: String,
        required: true,
        enum: [
            'mcq',
            'written'
        ]
    },
    domainId: {
        type: String,
        required: true
    },
    subSkill: {
        type: String,
        maxlength: 200
    },
    selectedOption: {
        type: String,
        maxlength: 2
    },
    answerText: {
        type: String,
        maxlength: 5000
    },
    studentAnswer: {
        type: String,
        maxlength: 5000
    },
    correctAnswer: {
        type: String,
        maxlength: 2
    },
    isCorrect: {
        type: Boolean
    },
    timeTakenSeconds: {
        type: Number,
        min: 0
    },
    evaluationStatus: {
        type: String,
        enum: [
            'pending',
            'auto'
        ],
        default: 'pending'
    },
    needsAttention: {
        type: Boolean,
        default: false
    },
    attentionReason: {
        type: String,
        maxlength: 300
    },
    aiEvaluation: {
        scores: {
            task_completion: Number,
            clarity_and_brevity: Number,
            logical_structure: Number,
            professional_tone: Number,
            critical_thinking: Number
        },
        feedback: String,
        averageScore: Number,
        evaluatedAt: {
            type: Date,
            default: Date.now
        }
    }
}, {
    _id: false
});
const PriTestDomainTimingSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"]({
    domainId: {
        type: String,
        required: true
    },
    domainName: {
        type: String,
        maxlength: 200
    },
    scheduledStartTime: {
        type: String,
        maxlength: 10
    },
    scheduledEndTime: {
        type: String,
        maxlength: 10
    },
    scheduledDurationSeconds: {
        type: Number,
        min: 0
    },
    enteredAt: {
        type: Date
    },
    submittedAt: {
        type: Date
    },
    timeSpentSeconds: {
        type: Number,
        min: 0
    },
    status: {
        type: String,
        enum: [
            'submitted',
            'timeout',
            'terminated'
        ]
    },
    answeredCount: {
        type: Number,
        min: 0,
        default: 0
    },
    totalQuestions: {
        type: Number,
        min: 0
    }
}, {
    _id: false
});
const PriTestWarningEventSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"]({
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    reason: {
        type: String,
        maxlength: 300
    }
}, {
    _id: false
});
const PriTestResponseSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"]({
    responseCode: {
        type: String,
        maxlength: 80,
        index: true
    },
    questionBankId: {
        type: __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"].Types.ObjectId,
        ref: 'PriTestBank',
        required: true,
        index: true
    },
    bankTitle: {
        type: String,
        maxlength: 200
    },
    studentUserId: {
        type: __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"].Types.ObjectId,
        ref: 'UserAccount',
        required: true,
        index: true
    },
    studentId: {
        type: String,
        maxlength: 80
    },
    studentName: {
        type: String,
        maxlength: 120
    },
    studentUsername: {
        type: String,
        maxlength: 120
    },
    batch: {
        type: String,
        maxlength: 80
    },
    programme: {
        type: String,
        maxlength: 120
    },
    examDate: {
        type: Date
    },
    institutionId: {
        type: __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"].Types.ObjectId,
        ref: 'Institution',
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: [
            'in_progress',
            'submitted',
            'closed'
        ],
        default: 'in_progress',
        index: true
    },
    evaluationStatus: {
        type: String,
        enum: [
            'pending',
            'reviewed'
        ],
        default: 'pending',
        index: true
    },
    answers: {
        type: [
            PriTestResponseAnswerSchema
        ],
        default: []
    },
    currentDomainId: {
        type: String,
        maxlength: 100
    },
    currentQuestionIndex: {
        type: Number,
        min: 0
    },
    questionShuffleOrder: {
        type: [
            Number
        ]
    },
    optionShuffleMaps: {
        type: Map,
        of: [
            String
        ]
    },
    warningCount: {
        type: Number,
        default: 0,
        min: 0
    },
    warningEvents: {
        type: [
            PriTestWarningEventSchema
        ],
        default: []
    },
    submittedDomains: {
        type: [
            String
        ],
        default: []
    },
    terminatedDomains: {
        type: [
            String
        ],
        default: []
    },
    domainTimings: {
        type: [
            PriTestDomainTimingSchema
        ],
        default: []
    },
    startedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    lastActiveAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    submittedAt: {
        type: Date
    },
    testDurationSeconds: {
        type: Number,
        min: 0
    }
}, {
    timestamps: true,
    collection: 'students_pri_test_response'
});
PriTestResponseSchema.index({
    questionBankId: 1,
    studentUserId: 1,
    institutionId: 1,
    status: 1
});
const PriTestResponse = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["default"].models.PriTestResponse || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["default"].model('PriTestResponse', PriTestResponseSchema);
const __TURBOPACK__default__export__ = PriTestResponse;
}),
"[project]/Documents/Project/smart.hiresapien.in/models/UserAccount.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/Documents/Project/smart.hiresapien.in/node_modules/mongoose)");
;
const UserAccountSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"]({
    username: {
        type: String,
        required: [
            true,
            'Username is required'
        ],
        unique: true,
        trim: true,
        minlength: [
            3,
            'Username must be at least 3 characters'
        ],
        maxlength: [
            50,
            'Username cannot exceed 50 characters'
        ],
        match: [
            /^[a-zA-Z0-9_]+$/,
            'Username can only contain letters, numbers, and underscores'
        ]
    },
    password: {
        type: String,
        required: [
            true,
            'Password is required'
        ],
        minlength: [
            6,
            'Password must be at least 6 characters'
        ]
    },
    role: {
        type: String,
        enum: [
            'institution_admin',
            'faculty',
            'student'
        ],
        required: true,
        index: true
    },
    institutionId: {
        type: __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"].Types.ObjectId,
        ref: 'Institution',
        required: true,
        index: true
    },
    studentId: {
        type: String,
        trim: true,
        uppercase: true,
        sparse: true,
        unique: true
    },
    batch: {
        type: String,
        trim: true,
        maxlength: [
            80,
            'Batch cannot exceed 80 characters'
        ],
        index: true
    },
    fullName: {
        type: String,
        trim: true,
        maxlength: [
            120,
            'Full name cannot exceed 120 characters'
        ]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    collection: 'user_accounts'
});
UserAccountSchema.set('toJSON', {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transform: (_doc, ret)=>{
        delete ret.password;
        return ret;
    }
});
const UserAccount = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["default"].models.UserAccount || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["default"].model('UserAccount', UserAccountSchema);
const __TURBOPACK__default__export__ = UserAccount;
}),
"[project]/Documents/Project/smart.hiresapien.in/models/StudentResponse.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/Documents/Project/smart.hiresapien.in/node_modules/mongoose)");
;
const StudentDomainSummarySchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"]({
    domainId: {
        type: String,
        required: true
    },
    domainName: {
        type: String,
        maxlength: 200
    },
    timeSpentSeconds: {
        type: Number,
        default: 0,
        min: 0
    },
    answeredCount: {
        type: Number,
        default: 0,
        min: 0
    },
    correctCount: {
        type: Number,
        min: 0
    },
    totalQuestions: {
        type: Number,
        min: 0
    },
    enteredAt: {
        type: Date
    },
    submittedAt: {
        type: Date
    },
    scheduledStartTime: {
        type: String,
        maxlength: 10
    },
    scheduledEndTime: {
        type: String,
        maxlength: 10
    },
    scheduledDurationSeconds: {
        type: Number,
        min: 0
    }
}, {
    _id: false
});
const StudentResponseSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"]({
    studentUserId: {
        type: __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"].Types.ObjectId,
        ref: 'UserAccount',
        required: true,
        index: true
    },
    testBankId: {
        type: __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"].Types.ObjectId,
        ref: 'PriTestBank',
        required: true,
        index: true
    },
    institutionId: {
        type: __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"].Types.ObjectId,
        ref: 'Institution',
        required: true,
        index: true
    },
    studentId: {
        type: String
    },
    studentName: {
        type: String
    },
    studentUsername: {
        type: String
    },
    responses: [
        {
            questionIndex: {
                type: Number,
                required: true
            },
            questionId: {
                type: String
            },
            domainId: {
                type: String,
                required: true
            },
            subSkill: {
                type: String
            },
            difficulty: {
                type: String
            },
            selectedOption: {
                type: String,
                required: true
            },
            timeTakenSeconds: {
                type: Number,
                default: 0
            },
            isCorrect: {
                type: Boolean
            },
            timestamp: {
                type: Date,
                default: Date.now
            }
        }
    ],
    totalTimeTakenSeconds: {
        type: Number,
        default: 0
    },
    domainSummaries: {
        type: [
            StudentDomainSummarySchema
        ],
        default: []
    },
    testStartedAt: {
        type: Date
    },
    testSubmittedAt: {
        type: Date
    },
    testDurationSeconds: {
        type: Number,
        min: 0
    },
    status: {
        type: String,
        enum: [
            'in_progress',
            'completed',
            'closed'
        ],
        default: 'in_progress'
    }
}, {
    timestamps: true,
    collection: 'student_responses'
});
StudentResponseSchema.index({
    studentUserId: 1,
    testBankId: 1
});
const StudentResponse = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["default"].models.StudentResponse || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["default"].model('StudentResponse', StudentResponseSchema);
const __TURBOPACK__default__export__ = StudentResponse;
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
"[project]/Documents/Project/smart.hiresapien.in/lib/question-bank-generator.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fetchQuestionBankQuestionsFromDB",
    ()=>fetchQuestionBankQuestionsFromDB,
    "generateQuestionBankQuestions",
    ()=>generateQuestionBankQuestions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$domains$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/lib/domains.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/lib/mongodb.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$Question$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/models/Question.ts [app-route] (ecmascript)");
;
;
;
const MCQ_TEMPLATES = [
    'Which statement best describes {subSkill} in {domain}?',
    'In a {program} context, what is the best example of {subSkill}?',
    'What is the most effective approach to {subSkill} for {domain}?',
    'Which option reflects strong {subSkill} in {domain}?'
];
const WRITTEN_TEMPLATES = [
    'Describe how you would apply {subSkill} in a {program} scenario for {domain}.',
    'Explain a situation where {subSkill} would improve outcomes in {domain}.',
    'Write a short response showing your approach to {subSkill} in {domain}.'
];
const GENERIC_OPTIONS = [
    'Apply a structured approach aligned to the goal.',
    'Focus only on speed and skip validation.',
    'Ignore context and use a generic answer.',
    'Escalate the issue without analyzing the data.'
];
const DIFFICULTY_ORDER = [
    'easy',
    'medium',
    'hard'
];
function pickTemplate(templates, index) {
    return templates[index % templates.length];
}
function fillTemplate(template, domain, subSkill, program) {
    return template.replace('{domain}', domain).replace('{subSkill}', subSkill).replace('{program}', program);
}
function generateQuestionBankQuestions(input) {
    const questions = [];
    input.domains.forEach((domain)=>{
        const domainMeta = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$domains$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DOMAINS"].find((d)=>d.id === domain.domainId);
        const domainName = domain.domainName || domainMeta?.name || domain.domainId;
        // Ipsative domains (e.g. Workspace Psychology) have no correct answer.
        const isIpsative = domainMeta ? __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$domains$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NO_CORRECT_ANSWER_TYPES"].has(domainMeta.assessmentType) : false;
        domain.subskills.forEach((subskill, subIndex)=>{
            const difficultyCounts = subskill.difficultyShare;
            let questionIndex = 0;
            DIFFICULTY_ORDER.forEach((difficulty)=>{
                for(let i = 0; i < difficultyCounts[difficulty]; i += 1){
                    const isMcq = subskill.questionType === 'mcq';
                    const template = pickTemplate(isMcq ? MCQ_TEMPLATES : WRITTEN_TEMPLATES, questionIndex + subIndex);
                    const questionText = fillTemplate(template, domainName, subskill.name, input.program);
                    questions.push({
                        domainId: domain.domainId,
                        domainName,
                        subSkill: subskill.name,
                        questionType: subskill.questionType,
                        difficulty,
                        questionText,
                        options: isMcq ? [
                            {
                                label: 'A',
                                text: GENERIC_OPTIONS[0]
                            },
                            {
                                label: 'B',
                                text: GENERIC_OPTIONS[1]
                            },
                            {
                                label: 'C',
                                text: GENERIC_OPTIONS[2]
                            },
                            {
                                label: 'D',
                                text: GENERIC_OPTIONS[3]
                            }
                        ] : [],
                        // Ipsative domains have no correct answer — do not set one.
                        correctAnswer: isMcq && !isIpsative ? 'A' : undefined
                    });
                    questionIndex += 1;
                }
            });
        });
    });
    return questions;
}
async function fetchQuestionBankQuestionsFromDB(input) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
    const questions = [];
    for (const domain of input.domains){
        const domainName = domain.domainName || __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$domains$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DOMAINS"].find((d)=>d.id === domain.domainId)?.name || domain.domainId;
        for (const subskill of domain.subskills){
            const isMcq = subskill.questionType === 'mcq';
            const difficultyCounts = subskill.difficultyShare;
            const domainMeta = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$domains$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DOMAINS"].find((d)=>d.id === domain.domainId);
            const matchingSubSkills = domainMeta?.skills.filter((s)=>s.split(' - ')[0].trim() === subskill.name.trim()) || [
                subskill.name
            ];
            for (const difficulty of DIFFICULTY_ORDER){
                const count = difficultyCounts[difficulty];
                if (count <= 0) continue;
                // Fetch random approved questions matching criteria — try exact subSkill match first
                let fetched = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$Question$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].aggregate([
                    {
                        $match: {
                            status: 'approved',
                            domain: domain.domainId,
                            subSkill: {
                                $in: matchingSubSkills
                            },
                            questionType: subskill.questionType,
                            difficulty: difficulty
                        }
                    },
                    {
                        $sample: {
                            size: count
                        }
                    }
                ]);
                // Fallback: if no questions matched by subSkill, query the full domain without subSkill filter.
                // This handles cases where Question.subSkill values don't exactly match the bank's subskill names.
                if (fetched.length === 0) {
                    fetched = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$Question$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].aggregate([
                        {
                            $match: {
                                status: 'approved',
                                domain: domain.domainId,
                                questionType: subskill.questionType,
                                difficulty: difficulty
                            }
                        },
                        {
                            $sample: {
                                size: count
                            }
                        }
                    ]);
                }
                // Second fallback: relax difficulty constraint so at least some questions are returned.
                if (fetched.length === 0) {
                    fetched = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$Question$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].aggregate([
                        {
                            $match: {
                                status: 'approved',
                                domain: domain.domainId,
                                questionType: subskill.questionType
                            }
                        },
                        {
                            $sample: {
                                size: count
                            }
                        }
                    ]);
                }
                fetched.forEach((q)=>{
                    questions.push({
                        domainId: domain.domainId,
                        domainName,
                        subSkill: subskill.name,
                        questionType: subskill.questionType,
                        difficulty,
                        questionText: q.questionText,
                        questionImageUrl: q.questionImageUrl,
                        caseContext: q.caseContext,
                        caseContextImageUrl: q.caseContextImageUrl,
                        options: isMcq && q.options ? q.options.map((opt)=>({
                                label: opt.label,
                                text: opt.text,
                                imageUrl: opt.imageUrl,
                                score: opt.score
                            })) : [],
                        correctAnswer: isMcq ? q.correctAnswer : undefined
                    });
                });
            }
        }
    }
    return questions;
}
}),
"[project]/Documents/Project/smart.hiresapien.in/app/api/student/pri-test/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/lib/mongodb.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$PriTestBank$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/models/PriTestBank.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$PriTestResponse$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/models/PriTestResponse.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$UserAccount$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/models/UserAccount.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$StudentResponse$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/models/StudentResponse.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$question$2d$bank$2d$generator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/lib/question-bank-generator.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
async function GET(request) {
    const student = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStudentFromAuthHeader"])(request.headers.get('Authorization'));
    if (!student) return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: 'Unauthorized'
    }, {
        status: 401
    });
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
        const now = new Date();
        const full = request.nextUrl.searchParams.get('full') === 'true';
        // Fetch the most recent active test for the institution
        const activeBanks = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$PriTestBank$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].find({
            status: 'published',
            institutions: {
                $elemMatch: {
                    institutionId: student.institutionId,
                    status: 'accepted',
                    examEndDate: {
                        $gte: now
                    }
                }
            }
        }).sort({
            createdAt: -1
        }).select(full ? '+questions' : '-questions') // Optimization: don't even pull questions from DB if not full
        .lean();
        if (!activeBanks.length) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'No active or upcoming PRI test available for your institution',
                code: 'NO_ACTIVE_TEST'
            }, {
                status: 200
            });
        }
        // Fetch all student's submitted responses to filter out completed tests
        const submittedResponses = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$PriTestResponse$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].find({
            studentUserId: student.id,
            questionBankId: {
                $in: activeBanks.map((b)=>b._id)
            },
            status: {
                $in: [
                    'submitted',
                    'closed'
                ]
            }
        }).lean();
        const submittedBankIds = new Set(submittedResponses.map((r)=>r.questionBankId.toString()));
        // Find the first test the student hasn't submitted yet
        const bank = activeBanks.find((b)=>!submittedBankIds.has(b._id.toString()));
        if (!bank) {
            // If all active tests are already submitted, return the ALREADY_SUBMITTED flag
            // using the latest test's info
            const latestBank = activeBanks[0];
            return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'You have already submitted all available PRI tests. Reattempts are not allowed.',
                code: 'ALREADY_SUBMITTED',
                title: latestBank.title,
                program: latestBank.program
            }, {
                status: 200
            });
        }
        const instEntry = bank.institutions?.find((i)=>i.institutionId.toString() === student.institutionId);
        // Helper to compute absolute timestamps from examStartDate + domain HH:mm time
        function combineDateAndTimeEarly(baseDate, timeStr) {
            if (!baseDate || !timeStr) return null;
            if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(timeStr)) return null;
            // Treat baseDate as IST date: extract its UTC components and construct with IST offset
            const year = baseDate.getUTCFullYear();
            const month = (baseDate.getUTCMonth() + 1).toString().padStart(2, '0');
            const day = baseDate.getUTCDate().toString().padStart(2, '0');
            return new Date(`${year}-${month}-${day}T${timeStr}:00+05:30`);
        }
        // Compute domain start times to find the earliest one
        const domainStartTimes = (bank.domains ?? []).map((d)=>combineDateAndTimeEarly(instEntry?.examStartDate, d.domainStartTime)).filter((d)=>d !== null);
        const earliestDomainStart = domainStartTimes.length > 0 ? new Date(Math.min(...domainStartTimes.map((d)=>d.getTime()))) : instEntry?.examStartDate ?? null;
        // Use the earliest domain start time for the "not started" check instead of raw examStartDate
        if (earliestDomainStart && earliestDomainStart > now) {
            // Also compute domain info for the countdown display
            const preStartDomains = (bank.domains ?? []).map((d)=>{
                const sAt = combineDateAndTimeEarly(instEntry?.examStartDate, d.domainStartTime);
                const eAt = combineDateAndTimeEarly(instEntry?.examStartDate, d.domainEndTime);
                return {
                    domainId: d.domainId,
                    domainName: d.domainName,
                    domainStartTime: d.domainStartTime,
                    domainEndTime: d.domainEndTime,
                    startsAt: sAt ? sAt.toISOString() : null,
                    endsAt: eAt ? eAt.toISOString() : null
                };
            });
            return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'PRI Test is scheduled but not yet active',
                code: 'TEST_NOT_STARTED',
                examStartDate: earliestDomainStart.toISOString(),
                title: bank.title,
                program: bank.program,
                domains: preStartDomains
            }, {
                status: 200
            });
        }
        // Response block correctly handles ALREADY_SUBMITTED above now.
        let bankQuestions = bank.questions ?? [];
        // ── Lazy Question Population (Only on full fetch to save bandwidth/IO) ──
        const domainsMissingQuestions = full ? (bank.domains ?? []).filter((domain)=>{
            const count = bankQuestions.filter((q)=>q.domainId === domain.domainId).length;
            return count === 0;
        }) : [];
        if (domainsMissingQuestions.length > 0) {
            let freshQuestions = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$question$2d$bank$2d$generator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchQuestionBankQuestionsFromDB"])({
                program: bank.program,
                domains: domainsMissingQuestions
            });
            // Last-resort fallback: use template questions so the domain always has
            // something to serve (avoids broken navigation / repeated ghost questions).
            if (freshQuestions.length === 0) {
                freshQuestions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$question$2d$bank$2d$generator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateQuestionBankQuestions"])({
                    program: bank.program,
                    domains: domainsMissingQuestions
                });
            }
            if (freshQuestions.length > 0) {
                // Atomically add questions per domain — only insert if the domain is
                // still empty to prevent duplicate insertions from concurrent requests.
                for (const domain of domainsMissingQuestions){
                    const domainFreshQs = freshQuestions.filter((q)=>q.domainId === domain.domainId);
                    if (domainFreshQs.length === 0) continue;
                    await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$PriTestBank$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].findOneAndUpdate({
                        _id: bank._id,
                        questions: {
                            $not: {
                                $elemMatch: {
                                    domainId: domain.domainId
                                }
                            }
                        }
                    }, {
                        $push: {
                            questions: {
                                $each: domainFreshQs
                            }
                        }
                    });
                    // Extend the local snapshot so downstream logic sees the new questions
                    // without needing to re-fetch the entire bank document.
                    bankQuestions = [
                        ...bankQuestions,
                        ...domainFreshQs
                    ];
                }
            }
        }
        // Fetch or create existing response to persist randomization
        let response = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$PriTestResponse$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].findOne({
            studentUserId: student.id,
            questionBankId: bank._id
        });
        if (!response) {
            const user = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$UserAccount$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].findById(student.id).lean();
            response = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$PriTestResponse$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]({
                questionBankId: bank._id,
                studentUserId: student.id,
                institutionId: student.institutionId,
                studentId: user?.studentId || student.username,
                studentName: user?.fullName || student.username,
                studentUsername: student.username,
                batch: user?.batch,
                programme: bank.program,
                status: 'in_progress',
                evaluationStatus: 'pending',
                answers: [],
                startedAt: new Date(),
                lastActiveAt: new Date()
            });
        }
        // Helper for shuffling
        const shuffle = (array)=>{
            const shuffled = [
                ...array
            ];
            for(let i = shuffled.length - 1; i > 0; i--){
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [
                    shuffled[j],
                    shuffled[i]
                ];
            }
            return shuffled;
        };
        // 1. Question Randomization
        // Reset shuffle order if the bank was just extended (lazy population added
        // questions that the old shuffle order does not cover).
        const bankQuestionCount = bankQuestions.length;
        if (!response.questionShuffleOrder || response.questionShuffleOrder.length === 0 || response.questionShuffleOrder.length < bankQuestionCount) {
            const indices = bankQuestions.map((_, i)=>i);
            response.questionShuffleOrder = shuffle(indices);
            response.optionShuffleMaps = new Map(); // force option shuffle rebuild too
            await response.save();
        }
        // 2. Option Randomization
        if (!response.optionShuffleMaps || response.optionShuffleMaps.size === 0) {
            const maps = new Map();
            bankQuestions.forEach((q, i)=>{
                if (q.questionType === 'mcq' && q.options) {
                    const labels = q.options.map((opt)=>opt.label);
                    maps.set(i.toString(), shuffle(labels));
                }
            });
            response.optionShuffleMaps = maps;
            await response.save();
        }
        // Build per-domain question caps from the configured subskill questionCounts.
        // This prevents domains (e.g. Workspace Psychology) from serving more questions
        // than the admin configured when building the test.
        const domainQuestionCaps = new Map();
        for (const domain of bank.domains ?? []){
            const cap = domain.subskills?.reduce((sum, sub)=>sum + (sub.questionCount || 0), 0) ?? 0;
            if (cap > 0) domainQuestionCaps.set(domain.domainId, cap);
        }
        const domainQuestionCounters = new Map();
        // Serve questions — metadata only for dashboard, full for exam
        const shuffledQuestions = (response.questionShuffleOrder || []).filter((bankIdx)=>{
            const q = bankQuestions[bankIdx];
            if (!q) return false;
            // Apply domain cap if configured
            const cap = domainQuestionCaps.get(q.domainId);
            if (cap !== undefined) {
                const count = domainQuestionCounters.get(q.domainId) ?? 0;
                if (count >= cap) return false;
                domainQuestionCounters.set(q.domainId, count + 1);
            }
            return true;
        }).map((bankIdx)=>{
            const q = bankQuestions[bankIdx];
            if (!q) return null;
            if (!full) {
                // Metadata only for initial dashboard load (SUPER FAST)
                return {
                    index: bankIdx,
                    domainId: q.domainId,
                    subSkill: q.subSkill
                };
            }
            // Handle option shuffling (Only on full fetch)
            let shuffledOptions = q.options || [];
            const shuffleMap = response?.optionShuffleMaps?.get(bankIdx.toString());
            if (shuffleMap && q.questionType === 'mcq') {
                shuffledOptions = shuffleMap.map((label)=>q.options.find((opt)=>opt.label === label)).filter(Boolean);
            }
            // Re-label options sequentially (A, B, C, D) after shuffle
            const sequentialLabels = [
                'A',
                'B',
                'C',
                'D',
                'E'
            ];
            return {
                index: bankIdx,
                domainId: q.domainId,
                domainName: q.domainName,
                subSkill: q.subSkill,
                questionType: q.questionType,
                difficulty: q.difficulty ?? 'medium',
                questionText: q.questionText,
                questionImageUrl: q.questionImageUrl,
                caseContext: q.caseContext,
                caseContextImageUrl: q.caseContextImageUrl,
                options: q.questionType === 'mcq' ? shuffledOptions.map((opt, i)=>({
                        label: sequentialLabels[i] ?? opt.label,
                        originalLabel: opt.label,
                        text: opt.text,
                        imageUrl: opt.imageUrl
                    })) : []
            };
        }).filter(Boolean);
        const examStartDate = bank.institutions?.find((i)=>i.institutionId.toString() === student.institutionId)?.examStartDate;
        // Compute per-domain absolute start/end timestamps and derive status using server time
        const serverNow = new Date();
        function combineDateAndTime(baseDate, timeStr) {
            if (!baseDate || !timeStr) return null;
            if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(timeStr)) return null;
            const year = baseDate.getUTCFullYear();
            const month = (baseDate.getUTCMonth() + 1).toString().padStart(2, '0');
            const day = baseDate.getUTCDate().toString().padStart(2, '0');
            // Construct ISO string with IST offset (+05:30)
            return new Date(`${year}-${month}-${day}T${timeStr}:00+05:30`);
        }
        const domains = (bank.domains ?? []).map((domain)=>{
            const startsAt = combineDateAndTime(examStartDate, domain.domainStartTime);
            const endsAt = combineDateAndTime(examStartDate, domain.domainEndTime);
            // Responses for this domain (any answer with domainId)
            const hasAnyAnswer = (response.answers || []).some((a)=>a.domainId === domain.domainId);
            // Determine per-domain response status
            const isDomainSubmitted = (response.submittedDomains || []).includes(domain.domainId);
            const isDomainTerminated = (response.terminatedDomains || []).includes(domain.domainId);
            let responseStatus = 'not_started';
            if (isDomainTerminated) responseStatus = 'closed';
            else if (isDomainSubmitted) responseStatus = 'completed';
            else if (hasAnyAnswer) responseStatus = 'in_progress';
            // Locked/Unlocked and time deltas
            const isUnlocked = startsAt && endsAt ? serverNow >= startsAt && serverNow <= endsAt : false;
            const timeToUnlockMs = startsAt ? Math.max(0, startsAt.getTime() - serverNow.getTime()) : null;
            const timeToCloseMs = endsAt ? Math.max(0, endsAt.getTime() - serverNow.getTime()) : null;
            let lockedReason = null;
            if (responseStatus === 'closed') {
                if ((response.warningCount || 0) >= 5) lockedReason = 'terminated_by_proctoring';
                else if (endsAt && serverNow > endsAt) lockedReason = 'missed_window';
            }
            return {
                domainId: domain.domainId,
                domainName: domain.domainName,
                domainStartTime: domain.domainStartTime,
                domainEndTime: domain.domainEndTime,
                domainDate: examStartDate,
                startsAt: startsAt ? startsAt.toISOString() : null,
                endsAt: endsAt ? endsAt.toISOString() : null,
                isUnlocked,
                timeToUnlockMs,
                timeToCloseMs,
                responseStatus,
                lockedReason,
                warningCount: response.warningCount || 0
            };
        });
        // Auto-submit or close expired domains (server-side enforcement)
        try {
            let studentResp = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$StudentResponse$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].findOne({
                studentUserId: student.id,
                testBankId: bank._id
            });
            let mutated = false;
            for (const dom of domains){
                if (!dom.endsAt) continue;
                const endsAtDate = new Date(dom.endsAt);
                if (serverNow > endsAtDate) {
                    // Skip if already finalized
                    if (response.status === 'submitted' || response.status === 'closed') continue;
                    const hasAnswersForDomain = (response.answers || []).some((a)=>a.domainId === dom.domainId) || studentResp && (studentResp.responses || []).some((r)=>r.domainId === dom.domainId);
                    if (hasAnswersForDomain) {
                        // Auto-submit this domain
                        if (response.submittedDomains && !response.submittedDomains.includes(dom.domainId)) {
                            response.submittedDomains.push(dom.domainId);
                        }
                        mutated = true;
                    } else {
                        // Auto-terminate this domain
                        if (response.terminatedDomains && !response.terminatedDomains.includes(dom.domainId)) {
                            response.terminatedDomains.push(dom.domainId);
                        }
                        mutated = true;
                    }
                }
            }
            if (mutated) {
                await response.save();
                if (studentResp) await studentResp.save();
            }
        } catch (e) {
            console.error('Auto-submit/close check failed', e);
        }
        // Fetch student info for watermark — always available even before first POST
        const studentUser = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$UserAccount$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].findById(student.id).lean();
        const studentId = response.studentId || studentUser?.studentId || student.username;
        const studentName = response.studentName || studentUser?.fullName || '';
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            serverNow: serverNow.toISOString(),
            bank: {
                id: bank._id,
                title: bank.title,
                program: bank.program,
                examStartDate: bank.institutions?.find((i)=>i.institutionId.toString() === student.institutionId)?.examStartDate,
                examEndDate: bank.institutions?.find((i)=>i.institutionId.toString() === student.institutionId)?.examEndDate,
                isNoProctoringGraded: true
            },
            studentInfo: {
                studentId,
                studentName
            },
            domains,
            questions: shuffledQuestions,
            existingResponse: {
                status: response.status,
                answers: response.answers,
                lastActiveAt: response.lastActiveAt,
                warningCount: response.warningCount || 0,
                submittedDomains: response.submittedDomains || [],
                terminatedDomains: response.terminatedDomains || [],
                studentId,
                studentName,
                startedAt: response.startedAt
            }
        }, {
            status: 200
        });
    } catch (error) {
        console.error('[GET /api/student/pri-test]', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to fetch PRI test'
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    const student = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStudentFromAuthHeader"])(request.headers.get('Authorization'));
    if (!student) return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: 'Unauthorized'
    }, {
        status: 401
    });
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
        const body = await request.json();
        const { questionBankId, questionIndex, domainId, questionType, selectedOption, answerText, action, status, warningCount, timeTakenSeconds, // Domain timing fields (sent on submit_domain / terminate_domain)
        domainName: bodyDomainName, domainEnteredAt, scheduledStartTime, scheduledEndTime, // Warning reason (sent on proctoring violations)
        warningReason } = body;
        if (!questionBankId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Missing questionBankId'
            }, {
                status: 400
            });
        }
        // Fetch bank early — needed for totalQuestions, subSkill, questionId, bankTitle, programme
        const bank = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$PriTestBank$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].findById(questionBankId).lean();
        const bankQuestion = bank?.questions && questionIndex !== undefined ? bank.questions[questionIndex] : null;
        // Find or create PriTestResponse (Active Session)
        let priResponse = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$PriTestResponse$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].findOne({
            studentUserId: student.id,
            questionBankId: questionBankId
        });
        if (!priResponse) {
            const user = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$UserAccount$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].findById(student.id).lean();
            priResponse = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$PriTestResponse$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]({
                questionBankId,
                bankTitle: bank?.title,
                studentUserId: student.id,
                institutionId: student.institutionId,
                studentId: user?.studentId || student.username,
                studentName: user?.fullName || student.username,
                studentUsername: student.username,
                batch: user?.batch,
                programme: bank?.program,
                status: 'in_progress',
                evaluationStatus: 'pending',
                answers: [],
                startedAt: new Date(),
                lastActiveAt: new Date()
            });
        }
        if (action === 'start_test') {
            priResponse.startedAt = new Date();
        }
        // ── Helper: upsert a domain timing entry ────────────────────────────────
        const upsertDomainTiming = (dId, timingStatus, answeredCount)=>{
            const now = new Date();
            const enteredMs = domainEnteredAt ? new Date(domainEnteredAt).getTime() : null;
            const timeSpentSeconds = enteredMs ? Math.max(0, Math.round((now.getTime() - enteredMs) / 1000)) : undefined;
            let scheduledDurationSeconds;
            if (scheduledStartTime && scheduledEndTime) {
                const [sh, sm] = scheduledStartTime.split(':').map(Number);
                const [eh, em] = scheduledEndTime.split(':').map(Number);
                scheduledDurationSeconds = Math.max(0, (eh * 60 + em - sh * 60 - sm) * 60);
            }
            if (!priResponse.domainTimings) priResponse.domainTimings = [];
            const existingIdx = priResponse.domainTimings.findIndex((d)=>d.domainId === dId);
            const entry = {
                domainId: dId,
                domainName: bodyDomainName,
                scheduledStartTime,
                scheduledEndTime,
                scheduledDurationSeconds,
                enteredAt: enteredMs ? new Date(enteredMs) : undefined,
                submittedAt: now,
                timeSpentSeconds,
                status: timingStatus,
                answeredCount,
                totalQuestions: bank?.questions?.filter((q)=>q.domainId === dId).length || undefined
            };
            if (existingIdx !== -1) {
                priResponse.domainTimings[existingIdx] = {
                    ...priResponse.domainTimings[existingIdx],
                    ...entry
                };
            } else {
                priResponse.domainTimings.push(entry);
            }
        };
        if (action === 'submit_domain' && body.domainId) {
            if (priResponse.submittedDomains && !priResponse.submittedDomains.includes(body.domainId)) {
                priResponse.submittedDomains.push(body.domainId);
            }
            const answeredCount = (priResponse.answers || []).filter((a)=>a.domainId === body.domainId).length;
            upsertDomainTiming(body.domainId, 'submitted', answeredCount);
        }
        if (action === 'terminate_domain' && body.domainId) {
            if (priResponse.terminatedDomains && !priResponse.terminatedDomains.includes(body.domainId)) {
                priResponse.terminatedDomains.push(body.domainId);
            }
            const answeredCount = (priResponse.answers || []).filter((a)=>a.domainId === body.domainId).length;
            upsertDomainTiming(body.domainId, 'terminated', answeredCount);
        }
        if (action === 'submit_final_test') {
            const now = new Date();
            priResponse.status = 'submitted';
            priResponse.submittedAt = now;
            if (priResponse.startedAt) {
                priResponse.testDurationSeconds = Math.max(0, Math.round((now.getTime() - priResponse.startedAt.getTime()) / 1000));
            }
        }
        // Update PriTestResponse answers
        if (action === 'clear' && questionIndex !== undefined) {
            priResponse.answers = priResponse.answers.filter((a)=>a.questionIndex !== questionIndex);
        } else if (questionIndex !== undefined) {
            const existingAnswerIndex = priResponse.answers.findIndex((a)=>a.questionIndex === questionIndex);
            const resolvedQuestionType = questionType || bankQuestion?.questionType;
            const resolvedCorrectAnswer = resolvedQuestionType === 'mcq' ? bankQuestion?.correctAnswer ?? undefined : undefined;
            const resolvedIsCorrect = resolvedQuestionType === 'mcq' && resolvedCorrectAnswer ? Boolean(selectedOption && selectedOption === resolvedCorrectAnswer) : undefined;
            const newAnswer = {
                questionIndex,
                questionId: bankQuestion?._id?.toString() || bankQuestion?.id,
                questionType: resolvedQuestionType,
                domainId,
                subSkill: bankQuestion?.subSkill,
                selectedOption: selectedOption || undefined,
                answerText: answerText || undefined,
                studentAnswer: selectedOption || answerText || undefined,
                correctAnswer: resolvedCorrectAnswer,
                isCorrect: resolvedIsCorrect,
                timeTakenSeconds: timeTakenSeconds || undefined,
                evaluationStatus: resolvedQuestionType === 'mcq' ? 'auto' : 'pending',
                needsAttention: resolvedQuestionType === 'written',
                attentionReason: resolvedQuestionType === 'written' ? 'Written response requires review' : undefined
            };
            if (existingAnswerIndex !== -1) {
                priResponse.answers[existingAnswerIndex] = {
                    ...priResponse.answers[existingAnswerIndex],
                    ...newAnswer
                };
            } else {
                priResponse.answers.push(newAnswer);
            }
        } else if (action === 'batch_save' && body.batchAnswers) {
            for (const ans of body.batchAnswers){
                const qIndex = ans.questionIndex;
                const qDomainId = ans.domainId;
                const qType = ans.questionType;
                const qAns = ans.selectedOption || ans.answerText;
                const qBankQuestion = bank.questions && qIndex !== undefined ? bank.questions[qIndex] : null;
                const resolvedQType = qType || qBankQuestion?.questionType;
                const resolvedCorrectAnswer = resolvedQType === 'mcq' ? qBankQuestion?.correctAnswer ?? undefined : undefined;
                const resolvedIsCorrect = resolvedQType === 'mcq' && resolvedCorrectAnswer ? Boolean(ans.selectedOption && ans.selectedOption === resolvedCorrectAnswer) : undefined;
                const existingAnsIdx = priResponse.answers.findIndex((a)=>a.questionIndex === qIndex);
                const newAns = {
                    questionIndex: qIndex,
                    questionId: qBankQuestion?._id?.toString() || qBankQuestion?.id,
                    questionType: resolvedQType,
                    domainId: qDomainId,
                    subSkill: qBankQuestion?.subSkill,
                    selectedOption: ans.selectedOption || undefined,
                    answerText: ans.answerText || undefined,
                    studentAnswer: qAns || undefined,
                    correctAnswer: resolvedCorrectAnswer,
                    isCorrect: resolvedIsCorrect,
                    evaluationStatus: resolvedQType === 'mcq' ? 'auto' : 'pending',
                    needsAttention: resolvedQType === 'written',
                    attentionReason: resolvedQType === 'written' ? 'Written response requires review' : undefined
                };
                if (existingAnsIdx !== -1) {
                    priResponse.answers[existingAnsIdx] = {
                        ...priResponse.answers[existingAnsIdx],
                        ...newAns
                    };
                } else {
                    priResponse.answers.push(newAns);
                }
            }
        }
        if (status) {
            priResponse.status = status;
            if (status === 'submitted') priResponse.submittedAt = new Date();
        }
        if (warningCount !== undefined) {
            priResponse.warningCount = warningCount;
            // Append a timestamped warning event so violations are auditable
            if (!priResponse.warningEvents) priResponse.warningEvents = [];
            priResponse.warningEvents.push({
                timestamp: new Date(),
                reason: warningReason
            });
        }
        priResponse.lastActiveAt = new Date();
        await priResponse.save();
        // POPULATE StudentResponse (For Detailed Insights)
        let studentResp = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$StudentResponse$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].findOne({
            studentUserId: student.id,
            testBankId: questionBankId
        });
        if (!studentResp) {
            const user = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$UserAccount$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].findById(student.id).lean();
            studentResp = new __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$StudentResponse$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]({
                studentUserId: student.id,
                testBankId: questionBankId,
                institutionId: student.institutionId,
                studentId: user?.studentId || student.username,
                studentName: user?.fullName || student.username,
                studentUsername: student.username,
                responses: [],
                status: 'in_progress'
            });
        }
        if (questionIndex !== undefined && (selectedOption || answerText)) {
            const existingIdx = studentResp.responses.findIndex((r)=>r.questionIndex === questionIndex);
            const isCorrect = bankQuestion?.correctAnswer ? bankQuestion.correctAnswer === selectedOption : undefined;
            const newResp = {
                questionIndex,
                questionId: bankQuestion?._id?.toString() || bankQuestion?.id,
                domainId,
                subSkill: bankQuestion?.subSkill,
                difficulty: bankQuestion?.difficulty,
                selectedOption: selectedOption || answerText,
                timeTakenSeconds: timeTakenSeconds || 0,
                isCorrect,
                timestamp: new Date()
            };
            if (existingIdx !== -1) {
                studentResp.responses[existingIdx] = newResp;
            } else {
                studentResp.responses.push(newResp);
            }
        } else if (action === 'batch_save' && body.batchAnswers) {
            for (const ans of body.batchAnswers){
                const qIndex = ans.questionIndex;
                const qAns = ans.selectedOption || ans.answerText;
                if (qIndex !== undefined && qAns) {
                    const qBankQuestion = bank.questions && qIndex !== undefined ? bank.questions[qIndex] : null;
                    const existIdx = studentResp.responses.findIndex((r)=>r.questionIndex === qIndex);
                    const isCorrect = qBankQuestion?.correctAnswer ? qBankQuestion.correctAnswer === ans.selectedOption : undefined;
                    const newRsp = {
                        questionIndex: qIndex,
                        questionId: qBankQuestion?._id?.toString() || qBankQuestion?.id,
                        domainId: ans.domainId,
                        subSkill: qBankQuestion?.subSkill,
                        difficulty: qBankQuestion?.difficulty,
                        selectedOption: qAns,
                        timeTakenSeconds: ans.timeTakenSeconds || 0,
                        isCorrect,
                        timestamp: new Date()
                    };
                    if (existIdx !== -1) {
                        studentResp.responses[existIdx] = newRsp;
                    } else {
                        studentResp.responses.push(newRsp);
                    }
                }
            }
        }
        studentResp.totalTimeTakenSeconds = studentResp.responses.reduce((acc, r)=>acc + (r.timeTakenSeconds || 0), 0);
        // ── Sync domain summaries from priResponse.domainTimings ─────────────────
        if (priResponse.domainTimings && priResponse.domainTimings.length > 0) {
            if (!studentResp.domainSummaries) studentResp.domainSummaries = [];
            for (const dt of priResponse.domainTimings){
                const existingIdx = studentResp.domainSummaries.findIndex((s)=>s.domainId === dt.domainId);
                const summary = {
                    domainId: dt.domainId,
                    domainName: dt.domainName,
                    timeSpentSeconds: dt.timeSpentSeconds ?? 0,
                    answeredCount: dt.answeredCount ?? 0,
                    totalQuestions: dt.totalQuestions,
                    enteredAt: dt.enteredAt,
                    submittedAt: dt.submittedAt,
                    scheduledStartTime: dt.scheduledStartTime,
                    scheduledEndTime: dt.scheduledEndTime,
                    scheduledDurationSeconds: dt.scheduledDurationSeconds
                };
                if (existingIdx !== -1) {
                    studentResp.domainSummaries[existingIdx] = {
                        ...studentResp.domainSummaries[existingIdx],
                        ...summary
                    };
                } else {
                    studentResp.domainSummaries.push(summary);
                }
            }
        }
        // ── Sync test-level timing ────────────────────────────────────────────────
        if (!studentResp.testStartedAt && priResponse.startedAt) {
            studentResp.testStartedAt = priResponse.startedAt;
        }
        if (priResponse.submittedAt) {
            studentResp.testSubmittedAt = priResponse.submittedAt;
            studentResp.testDurationSeconds = priResponse.testDurationSeconds;
        }
        if (status === 'submitted' || action === 'submit_final_test') studentResp.status = 'completed';
        if (priResponse.status === 'closed') studentResp.status = 'closed';
        await studentResp.save();
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            responseId: priResponse._id,
            submittedDomains: priResponse.submittedDomains || [],
            terminatedDomains: priResponse.terminatedDomains || []
        });
    } catch (error) {
        console.error('[POST /api/student/pri-test]', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to save response'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__52107d1e._.js.map