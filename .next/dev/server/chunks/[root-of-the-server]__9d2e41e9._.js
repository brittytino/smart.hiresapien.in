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
"[project]/Documents/Project/smart.hiresapien.in/models/PriTestEvaluation.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/Documents/Project/smart.hiresapien.in/node_modules/mongoose)");
;
const PriTestEvaluationSubskillSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"]({
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
    correct: {
        type: Number,
        required: true,
        min: 0
    },
    attempted: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    score: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    _id: false
});
const PriTestEvaluationDomainSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"]({
    domainId: {
        type: String,
        required: true
    },
    domainName: {
        type: String,
        required: true
    },
    domainShare: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    correct: {
        type: Number,
        required: true,
        min: 0
    },
    attempted: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    score: {
        type: Number,
        required: true,
        min: 0
    },
    subskills: {
        type: [
            PriTestEvaluationSubskillSchema
        ],
        default: []
    }
}, {
    _id: false
});
const PriTestEvaluationSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"]({
    responseId: {
        type: __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"].Types.ObjectId,
        ref: 'PriTestResponse',
        required: true,
        index: true
    },
    batch: {
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
    studentUserId: {
        type: __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"].Types.ObjectId,
        ref: 'UserAccount',
        required: true,
        index: true
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
            'completed'
        ],
        default: 'completed'
    },
    mcqCorrect: {
        type: Number,
        required: true,
        min: 0
    },
    mcqTotal: {
        type: Number,
        required: true,
        min: 0
    },
    totalScore: {
        type: Number,
        required: true,
        min: 0
    },
    percentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    domains: {
        type: [
            PriTestEvaluationDomainSchema
        ],
        default: []
    },
    overallStatus: {
        type: String,
        enum: [
            'pass',
            'fail',
            'pending'
        ],
        default: 'pending',
        index: true
    },
    traitResults: {
        type: Map,
        of: {
            score: Number,
            maxScore: Number,
            passed: Boolean
        }
    },
    evaluatedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    mcqPriScore: {
        type: Number,
        default: 0
    },
    writtenPriScore: {
        type: Number,
        default: 0
    },
    psychometricPriScore: {
        type: Number,
        default: 0
    },
    priGatewayPassed: {
        type: Boolean,
        default: false
    },
    aiInsights: {
        type: __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"].Types.Mixed
    },
    solutionKey: [
        {
            questionId: {
                type: String
            },
            questionText: {
                type: String
            },
            correctAnswer: {
                type: String
            },
            domain: {
                type: String
            },
            subSkill: {
                type: String
            },
            _id: false
        }
    ],
    insightsFetchedAt: {
        type: Date
    }
}, {
    timestamps: true,
    collection: 'pri_test_evaluations'
});
PriTestEvaluationSchema.index({
    responseId: 1,
    studentUserId: 1,
    questionBankId: 1
});
PriTestEvaluationSchema.index({
    studentUserId: 1,
    institutionId: 1,
    evaluatedAt: -1
});
const PriTestEvaluation = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["default"].models.PriTestEvaluation || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["default"].model('PriTestEvaluation', PriTestEvaluationSchema);
const __TURBOPACK__default__export__ = PriTestEvaluation;
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
"[project]/Documents/Project/smart.hiresapien.in/app/api/student/insights/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/lib/mongodb.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$UserAccount$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/models/UserAccount.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$PriTestEvaluation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/models/PriTestEvaluation.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$PriTestBank$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/models/PriTestBank.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/lib/auth.ts [app-route] (ecmascript)");
;
;
;
;
;
;
async function GET(req) {
    try {
        const studentAuth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStudentFromAuthHeader"])(req.headers.get('Authorization'));
        if (!studentAuth) return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Unauthorized'
        }, {
            status: 401
        });
        const { id, institutionId } = studentAuth;
        const forceRefresh = req.nextUrl.searchParams.get('force_refresh') === 'true';
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
        const user = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$UserAccount$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].findOne({
            _id: id,
            role: 'student'
        }).populate('institutionId', 'name');
        if (!user) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Student not found'
            }, {
                status: 404
            });
        }
        const institutionName = user.institutionId?.name || '';
        // 1. Fetch ALL assessments for this student and institution
        const evaluations = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$PriTestEvaluation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].find({
            studentUserId: id,
            institutionId: institutionId
        }).lean();
        // 2. Identify the Absolute Latest Evaluation (Dashboard Source of Truth)
        const sortedEvaluations = [
            ...evaluations
        ].sort((a, b)=>new Date(b.evaluatedAt || b.createdAt).getTime() - new Date(a.evaluatedAt || a.createdAt).getTime());
        // The "recent PRI test" logic requested by the user: always prioritize the absolute latest attempt 
        // for the dashboard overview, even if it hasn't been officially "published" yet.
        const latestEvaluation = sortedEvaluations[0];
        // Filter evaluations that are officially published for historical average/activity
        const publishedEvaluations = [];
        const bankIds = [
            ...new Set(evaluations.map((e)=>e.questionBankId))
        ];
        const banks = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$PriTestBank$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].find({
            _id: {
                $in: bankIds
            }
        }).select('institutions').lean();
        const bankMap = new Map();
        banks.forEach((b)=>bankMap.set(b._id.toString(), b));
        for (const evalDoc of evaluations){
            if (!evalDoc.questionBankId) continue;
            const bank = bankMap.get(evalDoc.questionBankId.toString());
            if (!bank) continue;
            const instShare = bank.institutions?.find((i)=>i.institutionId.toString() === institutionId);
            if (instShare?.isResultsPublished) {
                publishedEvaluations.push(evalDoc);
            }
        }
        // Average metrics prefer published results if any exist, otherwise use latest.
        const evaluationsForAverage = publishedEvaluations.length > 0 ? publishedEvaluations : latestEvaluation ? [
            latestEvaluation
        ] : [];
        const normalizeInsightsPayload = (payload)=>{
            if (!payload || typeof payload !== 'object') return null;
            const obj = payload;
            if ('overallMetrics' in obj || 'domainMetrics' in obj || 'studentInfo' in obj) return obj;
            if ('summaryInsight' in obj || 'domains' in obj) return {
                aiInsights: obj
            };
            return obj;
        };
        // 3. Compute Insights
        let highestScore = 0;
        let totalScore = 0;
        evaluationsForAverage.forEach((e)=>{
            if (e.percentage > highestScore) highestScore = e.percentage;
            totalScore += e.percentage;
        });
        const averageScore = evaluationsForAverage.length > 0 ? Math.round(totalScore / evaluationsForAverage.length) : 0;
        const recentActivityList = sortedEvaluations.slice(0, 5).map((e)=>({
                _id: e.responseId || e._id,
                score: Math.round(e.percentage),
                totalQuestions: e.mcqTotal || 100,
                percentage: Math.round(e.percentage),
                submittedAt: e.evaluatedAt || e.createdAt,
                overallStatus: e.overallStatus
            }));
        const insightsBaseUrl = process.env.INSIGHTS_SERVICE_URL || process.env.STUDENT_INSIGHTS_SERVICE_URL;
        const normalizedInsightsBaseUrl = insightsBaseUrl?.replace(/\/+$/, '') ?? '';
        let engineInsights = null;
        let engineError = null;
        if (latestEvaluation?.aiInsights) {
            engineInsights = normalizeInsightsPayload(latestEvaluation.aiInsights);
        }
        // SYNTHETIC METRICS: Mandatory alignment with Admin API logic (normalization: Score / Share * 100)
        if (!engineInsights && latestEvaluation) {
            const domainMetrics = {};
            latestEvaluation.domains?.forEach((d)=>{
                let normalizedAccuracy = 0;
                if (d.domainShare > 0) {
                    normalizedAccuracy = d.score / d.domainShare * 100;
                } else if (d.total > 0) {
                    normalizedAccuracy = d.correct / d.total * 100;
                } else {
                    normalizedAccuracy = d.score || 0;
                }
                domainMetrics[d.domainName] = {
                    accuracy: Math.round(normalizedAccuracy),
                    correct: d.correct,
                    questionsAttempted: d.total,
                    // Sync banding with standard 4-tier model
                    band: normalizedAccuracy >= 90 ? 'EXCEPTIONAL' : normalizedAccuracy >= 80 ? 'READY' : normalizedAccuracy >= 60 ? 'ALMOST READY' : 'NEEDS WORK'
                };
            });
            engineInsights = {
                overallMetrics: {
                    percentage: latestEvaluation.percentage,
                    band: latestEvaluation.overallStatus === 'fail' ? 'RED' : latestEvaluation.percentage >= 80 ? 'GREEN' : 'AMBER',
                    accuracy: latestEvaluation.percentage
                },
                domainMetrics
            };
        }
        const response = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            user: {
                username: user.username,
                fullName: user.fullName,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt,
                studentId: user.studentId,
                institutionName: institutionName
            },
            insights: {
                totalTests: evaluations.length,
                highestScore: Math.round(highestScore),
                averageScore
            },
            recentActivity: recentActivityList,
            insightsEngine: {
                enabled: true,
                data: engineInsights,
                error: engineError
            }
        });
        response.headers.set('Cache-Control', 'private, max-age=30');
        return response;
    } catch (error) {
        console.error('Student Personal Insights API Error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal Server Error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__9d2e41e9._.js.map