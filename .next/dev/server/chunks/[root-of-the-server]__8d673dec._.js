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
"[project]/Documents/Project/smart.hiresapien.in/models/Institution.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/Documents/Project/smart.hiresapien.in/node_modules/mongoose)");
;
const InstitutionSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"]({
    name: {
        type: String,
        required: [
            true,
            'Institution name is required'
        ],
        trim: true,
        maxlength: [
            150,
            'Institution name cannot exceed 150 characters'
        ]
    },
    code: {
        type: String,
        required: [
            true,
            'Institution code is required'
        ],
        unique: true,
        uppercase: true,
        trim: true,
        minlength: [
            3,
            'Institution code must have at least 3 characters'
        ],
        maxlength: [
            20,
            'Institution code cannot exceed 20 characters'
        ]
    },
    institutionAdminId: {
        type: __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"].Types.ObjectId,
        ref: 'UserAccount',
        required: true,
        index: true
    },
    facultySlotLimit: {
        type: Number,
        required: true,
        min: [
            0,
            'Faculty slot limit cannot be negative'
        ],
        default: 0
    },
    studentSlotLimit: {
        type: Number,
        required: true,
        min: [
            0,
            'Student slot limit cannot be negative'
        ],
        default: 0
    },
    createdByAdmin: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true,
    collection: 'institutions'
});
const Institution = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["default"].models.Institution || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["default"].model('Institution', InstitutionSchema);
const __TURBOPACK__default__export__ = Institution;
}),
"[project]/Documents/Project/smart.hiresapien.in/models/Contributor.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/Documents/Project/smart.hiresapien.in/node_modules/mongoose)");
;
const ContributorSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["Schema"]({
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
    email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [
            /^\S+@\S+\.\S+$/,
            'Please provide a valid email address'
        ]
    },
    displayName: {
        type: String,
        trim: true,
        maxlength: [
            100,
            'Display name cannot exceed 100 characters'
        ]
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    collection: 'contributors'
});
// Prevent password from being serialized in toJSON / toObject by default
ContributorSchema.set('toJSON', {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transform: (_doc, ret)=>{
        delete ret.password;
        return ret;
    }
});
const Contributor = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["default"].models.Contributor || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$mongoose$29$__["default"].model('Contributor', ContributorSchema);
const __TURBOPACK__default__export__ = Contributor;
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
"[project]/Documents/Project/smart.hiresapien.in/app/api/admin/insights/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/lib/mongodb.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$Institution$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/models/Institution.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$Contributor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/models/Contributor.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$ContributorQuestion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/models/ContributorQuestion.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$Question$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/models/Question.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Project/smart.hiresapien.in/lib/auth.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
async function GET(req) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
        const token = authHeader.split(' ')[1];
        const decoded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyToken"])(token);
        if (!decoded || decoded.role !== 'admin') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
        // Aggregate Institution Stats
        const institutions = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$Institution$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].find({});
        const totalInstitutions = institutions.length;
        const totalFacultySlots = institutions.reduce((acc, inst)=>acc + inst.facultySlotLimit, 0);
        const totalStudentSlots = institutions.reduce((acc, inst)=>acc + inst.studentSlotLimit, 0);
        // Aggregate Contributor Stats
        const contributors = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$Contributor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].find({}).select('_id username isActive').lean();
        const totalContributors = contributors.length;
        const activeContributors = contributors.filter((item)=>item.isActive).length;
        // Aggregate Question Stats
        const pendingReviews = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$ContributorQuestion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].countDocuments({
            status: 'pending'
        });
        const totalApproved = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$Question$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].countDocuments({
            status: 'approved'
        });
        const totalRejected = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$ContributorQuestion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].countDocuments({
            status: 'rejected'
        });
        const contributorQuestionTotalsRaw = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$ContributorQuestion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].aggregate([
            {
                $group: {
                    _id: {
                        contributorId: '$contributorId',
                        contributorUsername: '$contributorUsername'
                    },
                    totalQuestions: {
                        $sum: 1
                    },
                    approvedQuestions: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        '$status',
                                        'approved'
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    pendingQuestions: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        '$status',
                                        'pending'
                                    ]
                                },
                                1,
                                0
                            ]
                        }
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
                    totalQuestions: 1,
                    approvedQuestions: 1,
                    pendingQuestions: 1
                }
            },
            {
                $sort: {
                    approvedQuestions: -1,
                    totalQuestions: -1,
                    contributorUsername: 1
                }
            }
        ]);
        const totalsMap = new Map();
        for (const row of contributorQuestionTotalsRaw){
            if (typeof row.contributorId === 'string') {
                totalsMap.set(row.contributorId, {
                    contributorId: row.contributorId,
                    contributorUsername: row.contributorUsername,
                    totalQuestions: Number(row.totalQuestions) || 0,
                    approvedQuestions: Number(row.approvedQuestions) || 0,
                    pendingQuestions: Number(row.pendingQuestions) || 0
                });
            }
        }
        const contributorQuestionTotals = contributors.map((contributor)=>{
            const contributorId = String(contributor._id);
            const existing = totalsMap.get(contributorId);
            if (existing) return existing;
            return {
                contributorId,
                contributorUsername: contributor.username,
                totalQuestions: 0,
                approvedQuestions: 0,
                pendingQuestions: 0
            };
        }).sort((a, b)=>{
            if (b.approvedQuestions !== a.approvedQuestions) return b.approvedQuestions - a.approvedQuestions;
            if (b.totalQuestions !== a.totalQuestions) return b.totalQuestions - a.totalQuestions;
            return a.contributorUsername.localeCompare(b.contributorUsername);
        });
        // Recent Activity
        const recentInstitutions = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$Institution$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].find({}).sort({
            createdAt: -1
        }).limit(5).select('name createdAt');
        const recentSubmissions = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$models$2f$ContributorQuestion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].find({}).sort({
            createdAt: -1
        }).limit(5).select('questionText contributorUsername createdAt status');
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            stats: {
                institutions: {
                    total: totalInstitutions,
                    totalFacultySlots,
                    totalStudentSlots
                },
                contributors: {
                    total: totalContributors,
                    active: activeContributors
                },
                questions: {
                    pending: pendingReviews,
                    approved: totalApproved,
                    rejected: totalRejected
                }
            },
            recentActivity: {
                institutions: recentInstitutions,
                submissions: recentSubmissions
            },
            contributorQuestionTotals
        });
    } catch (error) {
        console.error('Insights Error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Project$2f$smart$2e$hiresapien$2e$in$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to fetch insights'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__8d673dec._.js.map