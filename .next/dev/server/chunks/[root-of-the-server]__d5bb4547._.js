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
"[project]/Documents/Project/smart.hiresapien.in/models/QuestionBank.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
const QuestionBankSubskillSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"]({
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
        min: 1
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
            min: 0
        },
        medium: {
            type: Number,
            required: true,
            min: 0
        },
        hard: {
            type: Number,
            required: true,
            min: 0
        }
    }
}, {
    _id: false
});
const QuestionBankDomainSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"]({
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
            QuestionBankSubskillSchema
        ],
        default: []
    }
}, {
    _id: false
});
const QuestionBankOptionSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"]({
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
const QuestionBankQuestionSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"]({
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
            QuestionBankOptionSchema
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
const QuestionBankInstitutionSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"]({
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
const QuestionBankSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"]({
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
            QuestionBankDomainSchema
        ],
        default: []
    },
    questions: {
        type: [
            QuestionBankQuestionSchema
        ],
        default: []
    },
    institutions: {
        type: [
            QuestionBankInstitutionSchema
        ],
        default: []
    },
    createdBy: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    collection: 'question_banks'
});
const QuestionBank = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["default"].models.QuestionBank || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["default"].model('QuestionBank', QuestionBankSchema);
const __TURBOPACK__default__export__ = QuestionBank;
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
"[project]/Documents/Project/smart.hiresapien.in/app/api/admin/pri-tests/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/lib/mongodb.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$QuestionBank$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/models/QuestionBank.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$PriTestBank$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/models/PriTestBank.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$question$2d$bank$2d$generator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/lib/question-bank-generator.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/lib/auth.ts [app-route] (ecmascript)");
;
;
;
;
;
;
function sumEquals100(values) {
    const total = values.reduce((acc, value)=>acc + value, 0);
    return Math.abs(total - 100) < 0.001;
}
function normalizeNumber(input) {
    if (typeof input === 'number' && Number.isFinite(input)) return input;
    if (typeof input === 'string' && input.trim() !== '' && !Number.isNaN(Number(input))) {
        return Number(input);
    }
    return NaN;
}
function parseTimeToMinutes(value) {
    if (typeof value !== 'string') return null;
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
    const [hours, minutes] = value.split(':').map(Number);
    return hours * 60 + minutes;
}
function parseDomains(payload) {
    if (!Array.isArray(payload)) return {
        error: 'domains must be an array'
    };
    const domains = payload.map((domain)=>{
        if (typeof domain !== 'object' || domain === null) return null;
        const record = domain;
        const domainId = typeof record.domainId === 'string' ? record.domainId : '';
        const domainName = typeof record.domainName === 'string' ? record.domainName.trim() : '';
        const domainShare = normalizeNumber(record.domainShare);
        const domainStartTime = typeof record.domainStartTime === 'string' ? record.domainStartTime : '';
        const domainEndTime = typeof record.domainEndTime === 'string' ? record.domainEndTime : '';
        const subskillsInput = Array.isArray(record.subskills) ? record.subskills : [];
        const subskills = subskillsInput.map((sub)=>{
            if (typeof sub !== 'object' || sub === null) return null;
            const subRecord = sub;
            const name = typeof subRecord.name === 'string' ? subRecord.name.trim() : '';
            const share = normalizeNumber(subRecord.share);
            const priContribution = normalizeNumber(subRecord.priContribution);
            const questionCount = normalizeNumber(subRecord.questionCount);
            const questionType = subRecord.questionType === 'written' ? 'written' : 'mcq';
            const difficultyShareRaw = typeof subRecord.difficultyShare === 'object' && subRecord.difficultyShare !== null ? subRecord.difficultyShare : null;
            const difficultyShare = {
                easy: normalizeNumber(difficultyShareRaw?.easy ?? 34),
                medium: normalizeNumber(difficultyShareRaw?.medium ?? 33),
                hard: normalizeNumber(difficultyShareRaw?.hard ?? 33)
            };
            if (!name || Number.isNaN(share) || Number.isNaN(priContribution) || Number.isNaN(questionCount) || Number.isNaN(difficultyShare.easy) || Number.isNaN(difficultyShare.medium) || Number.isNaN(difficultyShare.hard)) {
                return null;
            }
            const difficultyTotal = difficultyShare.easy + difficultyShare.medium + difficultyShare.hard;
            if (difficultyTotal < 0) {
                return null;
            }
            return {
                name,
                share,
                priContribution,
                questionCount,
                questionType,
                difficultyShare: difficultyShare || {
                    easy: 0,
                    medium: 0,
                    hard: 0
                }
            };
        }).filter(Boolean);
        const startMinutes = parseTimeToMinutes(domainStartTime);
        const endMinutes = parseTimeToMinutes(domainEndTime);
        if (!domainId || Number.isNaN(domainShare)) return null;
        if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) return null;
        return {
            domainId,
            domainName: domainName || domainId,
            domainShare,
            domainStartTime,
            domainEndTime,
            subskills
        };
    }).filter(Boolean);
    if (domains.length === 0) {
        return {
            error: 'At least one domain is required'
        };
    }
    for (const domain of domains){
        if (domain.subskills.length === 0) {
            return {
                error: `At least one subskill is required for ${domain.domainName}`
            };
        }
        if (domain.domainId !== 'workspace-psychology' && !sumEquals100(domain.subskills.map((s)=>s.share))) {
            return {
                error: `Subskill shares must sum to 100 for ${domain.domainName}`
            };
        }
        const invalidCount = domain.subskills.find((s)=>s.questionCount < 1 || Number.isNaN(s.questionCount));
        if (invalidCount) {
            return {
                error: `Each subskill question_count must be at least 1 for ${domain.domainName}`
            };
        }
        const invalidDifficulty = domain.subskills.find((s)=>{
            // difficultyShare is only required/present if questionType is 'mcq'
            if (s.questionType !== 'mcq') return false;
            const share = s.difficultyShare;
            if (!share) return true; // Missing share when it should have one
            const total = share.easy + share.medium + share.hard;
            return typeof total !== 'number' || isNaN(total) || total < 0;
        });
        if (invalidDifficulty) {
            return {
                error: `Difficulty counts empty or invalid for ${domain.domainName}`
            };
        }
    }
    if (!sumEquals100(domains.map((d)=>d.domainShare))) {
        return {
            error: 'Domain shares must sum to 100'
        };
    }
    return {
        domains
    };
}
async function GET(request) {
    const admin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAdminFromAuthHeader"])(request.headers.get('Authorization'));
    if (!admin) return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: 'Unauthorized'
    }, {
        status: 401
    });
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
        const [banks, priTestBanks] = await Promise.all([
            __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$QuestionBank$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].aggregate([
                {
                    $sort: {
                        createdAt: -1
                    }
                },
                {
                    $addFields: {
                        questionCount: {
                            $size: {
                                $ifNull: [
                                    '$questions',
                                    []
                                ]
                            }
                        }
                    }
                },
                {
                    $project: {
                        questions: 0,
                        domains: 0
                    }
                }
            ]),
            __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$PriTestBank$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].aggregate([
                {
                    $sort: {
                        createdAt: -1
                    }
                },
                {
                    $addFields: {
                        questionCount: {
                            $size: {
                                $ifNull: [
                                    '$questions',
                                    []
                                ]
                            }
                        }
                    }
                },
                {
                    $project: {
                        questions: 0,
                        domains: 0
                    }
                }
            ])
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            banks,
            priTestBanks
        }, {
            status: 200
        });
    } catch (error) {
        console.error('[GET /api/admin/pri-tests]', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to fetch PRI tests'
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    const admin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAdminFromAuthHeader"])(request.headers.get('Authorization'));
    if (!admin) return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: 'Unauthorized'
    }, {
        status: 401
    });
    let body;
    try {
        body = await request.json();
    } catch  {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Invalid JSON body'
        }, {
            status: 400
        });
    }
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const program = typeof body.program === 'string' ? body.program.trim() : '';
    if (!title || !program) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'title and program are required'
        }, {
            status: 400
        });
    }
    const parsed = parseDomains(body.domains);
    if ('error' in parsed) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: parsed.error
        }, {
            status: 400
        });
    }
    let questions;
    try {
        questions = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$question$2d$bank$2d$generator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchQuestionBankQuestionsFromDB"])({
            program,
            domains: parsed.domains
        });
    } catch (err) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: err.message
        }, {
            status: 400
        });
    }
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
        const bank = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$QuestionBank$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].create({
            title,
            program,
            status: 'draft',
            domains: parsed.domains,
            questions,
            institutions: [],
            createdBy: admin.username
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$PriTestBank$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].findOneAndUpdate({
            _id: bank._id
        }, {
            _id: bank._id,
            title,
            program,
            status: 'draft',
            domains: parsed.domains,
            questions,
            institutions: [],
            createdBy: admin.username
        }, {
            upsert: true,
            returnDocument: 'after',
            setDefaultsOnInsert: true
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            bank
        }, {
            status: 201
        });
    } catch (error) {
        console.error('[POST /api/admin/pri-tests]', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to create PRI test'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__d5bb4547._.js.map