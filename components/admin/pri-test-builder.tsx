'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { LayoutDashboard, ClipboardList, Sparkles, Copy, Check, Search, Building2, Users, ClipboardCheck, Target, FileText, ClipboardPen, BookOpen } from 'lucide-react';
import DashboardLayout from '@/components/basic/dashboard-layout';
import { DOMAINS, Domain } from '@/lib/domains';
import { ADMIN_SIDEBAR_ITEMS } from '@/lib/navigation-constants';

interface Institution {
  _id: string;
  name: string;
  code: string;
}

type QuestionType = 'mcq' | 'written';
type QuestionDifficulty = 'easy' | 'medium' | 'hard';

interface DifficultyShare {
  easy: number;
  medium: number;
  hard: number;
}

interface SubskillConfig {
  name: string;
  share: number;
  priContribution: number;
  questionCount: number;
  questionType: QuestionType;
  difficultyShare: DifficultyShare;
}

interface DomainConfig {
  domainId: string;
  domainName: string;
  domainShare: number;
  domainStartTime: string;
  domainEndTime: string;
  selected: boolean;
  subskills: SubskillConfig[];
}

interface GeneratedQuestion {
  domainId: string;
  domainName: string;
  subSkill: string;
  questionType: QuestionType;
  difficulty: QuestionDifficulty;
  questionText: string;
  options: Array<{ label: string; text: string; imageUrl?: string; score?: number }>;
  correctAnswer?: string;
  caseContext?: string;
  questionImageUrl?: string;
  caseContextImageUrl?: string;
}

interface InstitutionSelection {
  selected: boolean;
  examStartDate: string;
  examEndDate: string;
}

const steps = ['BASIC TEST DETAILS', 'DOMAIN SHARES', 'SUBSKILLS', 'INSTITUTIONS', 'PREVIEW & PUBLISH'] as const;

function sum(values: number[]) {
  return values.reduce((acc, value) => acc + value, 0);
}

function computePriContribution(domainShare: number, subShare: number) {
  if (!Number.isFinite(domainShare) || !Number.isFinite(subShare)) return 0;
  return Number(((domainShare * subShare) / 100).toFixed(4));
}

function parseTimeToMinutes(value: string): number | null {
  const clean = value.trim().toUpperCase();
  // Handle 12-hour with AM/PM (e.g. 09:30 AM, 9:30PM)
  const ampmMatch = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampmMatch) {
    let [_, hStr, mStr, meridiem] = ampmMatch;
    let h = Number(hStr);
    const m = Number(mStr);
    if (meridiem === 'PM' && h < 12) h += 12;
    if (meridiem === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  }
  // Handle 24-hour (e.g. 09:30, 21:30)
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function normalizeTimeTo24H(value: string): string | null {
  const mins = parseTimeToMinutes(value);
  if (mins === null) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatTimeFromMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function allocateShare(total: number, count: number): number[] {
  if (count <= 0) return [];
  const base = Math.floor(total / count);
  const remainder = total - base * count;
  return Array.from({ length: count }, (_, index) => base + (index < remainder ? 1 : 0));
}

/** Parse domain-only template from Step 2 Copy Template paste.
 * Accepts flexible text like:
 *   [DOMAIN] Cognitive Intelligence  SHARE: 20%  TIME: 09:00 - 09:45
 * or line-by-line blocks with SHARE/TIME keywords.
 * Tolerates varied spacing, dashes, en-dashes, colons.
 */
function parseDomainTemplate(text: string, currentDomains: DomainConfig[]): { domains: DomainConfig[]; errors: string[] } {
  const nextDomains = currentDomains.map(d => ({ ...d }));
  const errors: string[] = [];

  // Split on [DOMAIN] markers (case-insensitive)
  const blocks = text.split(/\[DOMAIN\]/i).map(s => s.trim()).filter(Boolean);

  if (blocks.length === 0) {
    errors.push('No [DOMAIN] blocks found. Use [DOMAIN] keyword to start each domain.');
    return { domains: nextDomains, errors };
  }

  blocks.forEach(block => {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    // First line or content before first keyword is the domain name
    // Sanitize: remove numbering like "1. ", "Domain 6:", etc.
    const domainNameRaw = lines[0]
      .replace(/SHARE:.*/i, '')
      .replace(/TIME:.*/i, '')
      .replace(/^[^\w]*/, '') // prefix non-word chars
      .replace(/^(domain|step|task)\s*\d+\s*[:.-]?\s*/i, '') // "Domain 1:", etc.
      .replace(/^\d+[\s.:-]*\s*/, '') // "1.", "1 - ", etc.
      .trim();
    const domainNameSearch = domainNameRaw.toLowerCase();

    const dIndex = nextDomains.findIndex(d =>
      d.domainName.toLowerCase() === domainNameSearch || 
      d.domainName.toLowerCase().includes(domainNameSearch) ||
      domainNameSearch.includes(d.domainName.toLowerCase())
    );

    if (dIndex === -1) {
      errors.push(`Domain not recognised: "${domainNameRaw}". Skipped.`);
      return;
    }

    const domain = { ...nextDomains[dIndex], selected: true };
    const fullBlock = lines.join(' ');

    // Parse SHARE: N% or SHARE: N
    const shareMatch = fullBlock.match(/SHARE:\s*(\d+(?:\.\d+)?)/i);
    if (shareMatch) {
      domain.domainShare = Number(shareMatch[1]);
    }

    // Parse TIME: HH:MM AM/PM - HH:MM AM/PM (supports flexible spacing, en-dash, and hyphen)
    const timeRegex = /TIME:\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*[\-–]\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i;
    const timeMatch = fullBlock.match(timeRegex);

    if (timeMatch) {
      const start24 = normalizeTimeTo24H(timeMatch[1]);
      const end24 = normalizeTimeTo24H(timeMatch[2]);
      if (start24) domain.domainStartTime = start24;
      if (end24) domain.domainEndTime = end24;
    }

    nextDomains[dIndex] = domain;
  });

  return { domains: nextDomains, errors };
}

/** Parse subskill template from Step 3 paste.
 * Format per domain block:
 *   [DOMAIN] Cognitive Intelligence
 *   [SUBSKILL] Logical Reasoning  SHARE: 30%  TYPE: MCQ  EASY: 5  MEDIUM: 3  HARD: 2
 *   [SUBSKILL] Numerical Reasoning  SHARE: 70%  TYPE: MCQ  EASY: 4  MEDIUM: 2  HARD: 1
 * Tolerates varied casing, spacing and formats.
 */
function parseSubskillTemplate(text: string, currentDomains: DomainConfig[]): { domains: DomainConfig[]; errors: string[] } {
  const nextDomains = currentDomains.map(d => ({ ...d, subskills: d.subskills.map(s => ({ ...s })) }));
  const errors: string[] = [];

  const domainBlocks = text.split(/\[DOMAIN\]/i).map(s => s.trim()).filter(Boolean);

  if (domainBlocks.length === 0) {
    errors.push('No [DOMAIN] blocks found. Use [DOMAIN] to start each domain block.');
    return { domains: nextDomains, errors };
  }

  domainBlocks.forEach(block => {
    const allLines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (allLines.length === 0) return;

    // Sanitize: remove numbering like "1. ", "Domain 6:", etc.
    const domainNameRaw = allLines[0]
      .replace(/\[SUBSKILL\].*/i, '')
      .replace(/^[^\w]*/, '') 
      .replace(/^(domain|step|task)\s*\d+\s*[:.-]?\s*/i, '')
      .replace(/^\d+[\s.:-]*\s*/, '')
      .trim();
    const domainNameSearch = domainNameRaw.toLowerCase();

    const dIndex = nextDomains.findIndex(d =>
      d.domainName.toLowerCase() === domainNameSearch || 
      d.domainName.toLowerCase().includes(domainNameSearch) ||
      domainNameSearch.includes(d.domainName.toLowerCase())
    );

    if (dIndex === -1) {
      errors.push(`Domain not recognised: "${domainNameRaw}". Skipped.`);
      return;
    }

    if (nextDomains[dIndex].domainId === 'workspace-psychology') return; // psychometric auto-configured

    // Collect [SUBSKILL] lines from the rest of the block
    const subLines = block.split(/\[SUBSKILL\]/i).slice(1).map(s => s.split('\n')[0].trim());

    if (subLines.length === 0) return;

    const updatedSubskills = nextDomains[dIndex].subskills.map(sub => {
      // Find the specific subskill line that matches this subskill's full name
      const entry = subLines.find(sl => sl.toLowerCase().includes(sub.name.toLowerCase()));
      if (!entry) return sub;

      const updated = { ...sub };

      const shareMatch = entry.match(/SHARE:\s*(\d+(?:\.\d+)?)/i);
      if (shareMatch) updated.share = Number(shareMatch[1]);

      const typeMatch = entry.match(/TYPE:\s*(MCQ|WRITTEN)/i);
      if (typeMatch) updated.questionType = typeMatch[1].toLowerCase() as QuestionType;

      const easyMatch = entry.match(/EASY:\s*(\d+)/i);
      const medMatch = entry.match(/MEDIUM:\s*(\d+)/i) || entry.match(/MED:\s*(\d+)/i);
      const hardMatch = entry.match(/HARD:\s*(\d+)/i);

      const easy = easyMatch ? Number(easyMatch[1]) : sub.difficultyShare.easy;
      const medium = medMatch ? Number(medMatch[1]) : sub.difficultyShare.medium;
      const hard = hardMatch ? Number(hardMatch[1]) : sub.difficultyShare.hard;

      updated.difficultyShare = { easy, medium, hard };
      updated.questionCount = easy + medium + hard;

      return updated;
    });

    // Validate subskill shares sum to 100 for this domain
    const shareTotal = updatedSubskills.reduce((acc, s) => acc + s.share, 0);
    if (Math.abs(shareTotal - 100) > 0.5) {
      errors.push(`"${nextDomains[dIndex].domainName}" subskill shares sum to ${shareTotal}% — must be 100%. Please correct and re-paste.`);
      return; // do not apply broken config
    }

    nextDomains[dIndex] = { ...nextDomains[dIndex], subskills: updatedSubskills };
  });

  return { domains: nextDomains, errors };
}



export default function PriTestBuilder() {
  const [mounted, setMounted] = useState(false);
  const [token] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('admin_token') || sessionStorage.getItem('auth_token');
    }
    return null;
  });
  const [adminUser, setAdminUser] = useState('Admin');

  const [stepIndex, setStepIndex] = useState(0);
  const [title, setTitle] = useState('');
  const [program, setProgram] = useState('FSE');
  const [examStartDate, setExamStartDate] = useState('');
  const [examEndDate, setExamEndDate] = useState('');
  const [isSingleDay, setIsSingleDay] = useState(true);
  const [domains, setDomains] = useState<DomainConfig[]>(() =>
    DOMAINS.map((domain: Domain) => ({
      domainId: domain.id,
      domainName: domain.name,
      domainShare: 0,
      domainStartTime: '',
      domainEndTime: '',
      selected: false,
      subskills: (domain.id as string) === 'workspace-psychology' 
        ? domain.skills.map((skill) => ({
            name: skill.split(' - ')[0].trim(),
            share: 0,
            priContribution: 0,
            questionCount: 5, // Default to 5 per trait as requested
            questionType: 'mcq',
            difficultyShare: { easy: 5, medium: 0, hard: 0 },
          }))
        : Array.from(
            new Set(domain.skills.map((skill) => skill.split(' - ')[0].trim()))
          ).map((name) => ({
            name,
            share: 0,
            priContribution: 0,
            questionCount: 1,
            questionType: 'mcq',
            difficultyShare: { easy: 1, medium: 0, hard: 0 },
          })),
    }))
  );

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [institutionSelections, setInstitutionSelections] = useState<Record<string, InstitutionSelection>>({});
  const [bankId, setBankId] = useState<string | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPublishSuccessModal, setShowPublishSuccessModal] = useState(false);
  const [questionPage, setQuestionPage] = useState(1);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeSubskillTab, setActiveSubskillTab] = useState<string | null>(null);
  const [activePreviewTab, setActivePreviewTab] = useState<string | null>(null);
  const pageSize = 5;

  const selectedDomains = useMemo(() => domains.filter((d) => d.selected), [domains]);
  const [activeTraitName, setActiveTraitName] = useState<string | null>(null);

  // Template State (Step 2 domain template + Step 3 subskill template)
  const [domainTemplateText, setDomainTemplateText] = useState('');
  const [showDomainTemplate, setShowDomainTemplate] = useState(false);
  const [subskillTemplateText, setSubskillTemplateText] = useState('');
  const [showSubskillTemplate, setShowSubskillTemplate] = useState(false);
  const [includePsychometric, setIncludePsychometric] = useState(true);
  const [domainSearch, setDomainSearch] = useState('');
  const [institutionSearch, setInstitutionSearch] = useState('');

  const filteredPreviewQuestions = useMemo(() => {
    const actDom = activePreviewTab || selectedDomains[0]?.domainId;
    return generatedQuestions.filter((q) => q.domainId === actDom);
  }, [generatedQuestions, activePreviewTab, selectedDomains]);

  const totalQuestionPages = useMemo(
    () => Math.max(1, Math.ceil(filteredPreviewQuestions.length / pageSize)),
    [filteredPreviewQuestions.length, pageSize]
  );

  const pagedQuestions = useMemo(() => {
    const start = (questionPage - 1) * pageSize;
    return filteredPreviewQuestions.slice(start, start + pageSize);
  }, [filteredPreviewQuestions, questionPage, pageSize]);

  useEffect(() => {
    setQuestionPage(1);
  }, [activePreviewTab]);

  useEffect(() => {
    const activeDom = activeSubskillTab || selectedDomains[0]?.domainId;
    const domain = selectedDomains.find(d => d.domainId === activeDom);
    if (domain && domain.subskills.length > 0) {
      if (!activeTraitName || !domain.subskills.find(s => s.name === activeTraitName)) {
        setActiveTraitName(domain.subskills[0].name);
      }
    } else {
      setActiveTraitName(null);
    }
  }, [activeSubskillTab, selectedDomains]);

  const domainShareSum = useMemo(
    () => sum(selectedDomains.filter((d) => d.domainId !== 'workspace-psychology').map((d) => d.domainShare)),
    [selectedDomains]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setQuestionPage((prev) => Math.min(prev, totalQuestionPages));
  }, [totalQuestionPages]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }
    try {
      const payload = token.split('.')[1];
      if (payload) {
        const decoded = JSON.parse(atob(payload));
        if (decoded && decoded.username) {
          setAdminUser(decoded.username);
        }
      }
    } catch {
      // ignore
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch('/api/admin/institutions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setInstitutions(data.institutions ?? []);
          const nextSelections: Record<string, InstitutionSelection> = {};
          (data.institutions ?? []).forEach((inst: Institution) => {
            nextSelections[inst._id] = {
              selected: false,
              examStartDate: '',
              examEndDate: '',
            };
          });
          setInstitutionSelections(nextSelections);
        }
      } catch {
        // Ignore for now
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [token]);

  useEffect(() => {
    if (!examStartDate && !examEndDate) return;
    setInstitutionSelections((prev) => {
      const next: Record<string, InstitutionSelection> = { ...prev };
      Object.keys(next).forEach((id) => {
        if (next[id]?.selected) {
          if (!next[id].examStartDate && examStartDate) {
            next[id] = { ...next[id], examStartDate };
          }
          if (!next[id].examEndDate && examEndDate) {
            next[id] = { ...next[id], examEndDate };
          }
        }
      });
      return next;
    });
  }, [examStartDate, examEndDate]);

  function updateDomain(domainId: string, updater: (domain: DomainConfig) => DomainConfig) {
    setDomains((prev) => prev.map((domain) => (domain.domainId === domainId ? updater(domain) : domain)));
  }

  function setSubskill(domainId: string, subskillName: string, updater: (sub: SubskillConfig) => SubskillConfig) {
    updateDomain(domainId, (domain) => ({
      ...domain,
      subskills: domain.subskills.map((sub) => (sub.name === subskillName ? updater(sub) : sub)),
    }));
  }

  function applySampleDefaults() {
    const today = new Date();
    const startDate = formatDate(today);
    const endDate = isSingleDay ? startDate : formatDate(addDays(today, 7));

    const pickedDomains = DOMAINS;
    const nonWorkspaceDomains = pickedDomains.filter((domain) => (domain.id as string) !== 'workspace-psychology');
    const shareAllocation = allocateShare(100, nonWorkspaceDomains.length);

    setTitle('January PRI Test');
    setProgram('FSE');
    setExamStartDate(startDate);
    setExamEndDate(endDate);
    
    setInstitutionSelections((prev) => {
      const updated = { ...prev };
      for (const id in updated) {
        if (updated[id].selected) {
          updated[id].examStartDate = startDate;
          updated[id].examEndDate = endDate;
        }
      }
      return updated;
    });
    setError('');

    const REAL_COUNTS: Record<string, number> = {
      'cognitive-intelligence': 75,
      'business-intelligence': 59,
      'problem-solving': 121,
      'communication': 46,
      'leadership': 93,
      'digital-business': 90,
      'workspace-psychology': 25, // Updated to 25 (5 traits x 5 questions)
    };

    setDomains((prev) =>
      prev.map((domain) => {
        const pickedIndex = pickedDomains.findIndex((item) => item.id === domain.domainId);
        const isPicked = pickedIndex !== -1;
        const nonWorkspaceIndex = nonWorkspaceDomains.findIndex((item) => item.id === domain.domainId);
        
        // Use a standard 9:00 AM (540 mins) start time for sample mapping
        const slotStart = 540 + Math.max(0, pickedIndex) * 60;
        const slotEnd = slotStart + 45;
        const defaultShare = nonWorkspaceIndex >= 0 ? shareAllocation[nonWorkspaceIndex] ?? 0 : 0;
        const hasMultipleSubskills = domain.subskills.length > 1;

        const domainSpec = DOMAINS.find(d => d.id === domain.domainId);
        const freshSubskills = domainSpec
          ? (domainSpec.id as string) === 'workspace-psychology'
              ? domainSpec.skills.map((skill) => ({
                  name: skill.split(' - ')[0].trim(),
                  share: 0,
                  priContribution: 0,
                  questionCount: 5,
                  questionType: 'mcq' as const,
                  difficultyShare: { easy: 5, medium: 0, hard: 0 },
                }))
              : Array.from(new Set(domainSpec.skills.map((skill) => skill.split(' - ')[0].trim()))).map((name) => ({
                  name,
                  share: 0,
                  priContribution: 0,
                  questionCount: 1,
                  questionType: 'mcq' as const,
                  difficultyShare: { easy: 1, medium: 0, hard: 0 },
                }))
          : domain.subskills;

        const totalAvail = REAL_COUNTS[domain.domainId] || 50;
        const subCountRaw = Math.floor(totalAvail / Math.max(1, freshSubskills.length));
        let remainder = totalAvail % Math.max(1, freshSubskills.length);

        return {
          ...domain,
          selected: isPicked,
          domainShare: isPicked && domain.domainId !== 'workspace-psychology' ? defaultShare : 0,
          domainStartTime: isPicked ? formatTimeFromMinutes(slotStart) : '',
          domainEndTime: isPicked ? formatTimeFromMinutes(slotEnd) : '',
          subskills: freshSubskills.map((sub, subIndex) => {
            let assignedCount = Math.min(20, subCountRaw);
            if (remainder > 0 && assignedCount < 20) {
              assignedCount += 1;
              remainder -= 1;
            }

            const eq = Math.floor(assignedCount / 3);
            let rem = assignedCount % 3;
            const easy = eq + (rem > 0 ? 1 : 0);
            rem = Math.max(0, rem - 1);
            const medium = eq + (rem > 0 ? 1 : 0);
            const hard = eq;

            return {
              ...sub,
              questionCount: assignedCount,
              difficultyShare: { easy, medium, hard },
              share:
                domain.domainId === 'workspace-psychology'
                  ? 0
                  : subIndex === 0
                    ? 100
                    : hasMultipleSubskills && subIndex === 1
                      ? 0
                      : 0,
            };
          }),
        };
      })
    );
  }

  function validateStep0(): string | null {
    if (!title.trim()) return 'Test title is required.';
    if (!program.trim()) return 'Program is required.';
    if (!examStartDate) return 'Exam start date is required.';
    if (!examEndDate) return 'Exam end date is required.';
    const start = new Date(examStartDate);
    const end = new Date(examEndDate);
    if (isSingleDay) {
      if (Number.isNaN(start.getTime())) return 'Invalid date.';
    } else {
      if (end < start) return 'Exam end date must be after start date.';
    }
    return null;
  }

  function validateStep1(): string | null {
    if (selectedDomains.length === 0) return 'Select at least one domain.';
    if (Math.abs(domainShareSum - 100) > 0.001) return 'Domain weightage must sum to 100%.';
    for (const domain of selectedDomains) {
      if (!domain.domainStartTime || !domain.domainEndTime) {
        return `Start and end time are required for ${domain.domainName}.`;
      }
      const startMinutes = parseTimeToMinutes(domain.domainStartTime);
      const endMinutes = parseTimeToMinutes(domain.domainEndTime);
      if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
        return `End time must be after start time for ${domain.domainName}.`;
      }
    }
    // Check for time slot overlaps between domains
    const timeSlots = selectedDomains
      .map((d) => ({ name: d.domainName, start: parseTimeToMinutes(d.domainStartTime)!, end: parseTimeToMinutes(d.domainEndTime)! }))
      .filter((s) => s.start !== null && s.end !== null);
    for (let i = 0; i < timeSlots.length; i++) {
      for (let j = i + 1; j < timeSlots.length; j++) {
        const a = timeSlots[i];
        const b = timeSlots[j];
        if (a.start < b.end && b.start < a.end) {
          return `Time slot conflict between "${a.name}" and "${b.name}". Please adjust times so they do not overlap.`;
        }
      }
    }
    return null;
  }

  function validateStep2(): string | null {
    for (const domain of selectedDomains) {
      if (domain.subskills.length === 0) {
        return `At least one subskill is required for ${domain.domainName}.`;
      }
      if (domain.domainId !== 'workspace-psychology') {
        const shareTotal = sum(domain.subskills.map((s) => s.share));
        if (Math.abs(shareTotal - 100) > 0.001) {
          return `Subskill share for "${domain.domainName}" must sum to 100% (currently ${shareTotal}%).`;
        }
      }
      const invalidCount = domain.subskills.find((s) => s.questionCount < 0);
      if (invalidCount) return `Each subskill question count must be 0 or more for ${domain.domainName}.`;
    }
    return null;
  }

  function validateCurrentStep(): string | null {
    if (stepIndex === 0) return validateStep0();
    if (stepIndex === 1) return validateStep1();
    if (stepIndex === 2) return validateStep2();
    return null;
  }

  function validateForGeneration(): string | null {
    if (!title.trim() || !program.trim()) return 'Title and program are required.';
    if (selectedDomains.length === 0) return 'Select at least one domain.';
    if (Math.abs(domainShareSum - 100) > 0.001) return 'Domain weightage must sum to 100.';

    for (const domain of selectedDomains) {
      if (domain.subskills.length === 0) {
        return `At least one subskill is required for ${domain.domainName}.`;
      }
      if (!domain.domainStartTime || !domain.domainEndTime) {
        return `Start and end time are required for ${domain.domainName}.`;
      }
      const startMinutes = parseTimeToMinutes(domain.domainStartTime);
      const endMinutes = parseTimeToMinutes(domain.domainEndTime);
      if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
        return `Invalid time slot for ${domain.domainName}.`;
      }
      const invalidCount = domain.subskills.find((s) => s.questionCount < 0);
      if (invalidCount) return `Each subskill question_count must be 0 or more for ${domain.domainName}.`;

      const invalidDifficulty = domain.subskills.find((s) => {
        const total = s.difficultyShare.easy + s.difficultyShare.medium + s.difficultyShare.hard;
        return typeof total !== 'number' || isNaN(total) || total < 0;
      });
      if (invalidDifficulty) {
        return `Difficulty counts empty or invalid for ${domain.domainName}.`;
      }
    }

    // Check for time slot overlaps
    const timeSlots = selectedDomains
      .map((d) => ({ name: d.domainName, start: parseTimeToMinutes(d.domainStartTime)!, end: parseTimeToMinutes(d.domainEndTime)! }))
      .filter((s) => s.start !== null && s.end !== null);
    for (let i = 0; i < timeSlots.length; i++) {
      for (let j = i + 1; j < timeSlots.length; j++) {
        const a = timeSlots[i];
        const b = timeSlots[j];
        if (a.start < b.end && b.start < a.end) {
          return `Time slot conflict between "${a.name}" and "${b.name}". Adjust the times so they do not overlap.`;
        }
      }
    }

    return null;
  }

  function validateForPublish(): string | null {
    if (!bankId) return 'Generate a preview before publishing.';
    const selectedInstitutionIds = Object.entries(institutionSelections)
      .filter(([, value]) => value.selected)
      .map(([id]) => id);

    if (selectedInstitutionIds.length === 0) return 'Select at least one institution.';

    for (const id of selectedInstitutionIds) {
      const selection = institutionSelections[id];
      if (!selection.examStartDate || !selection.examEndDate) {
        return 'Exam start and end dates are required for selected institutions.';
      }
      const start = new Date(selection.examStartDate);
      const end = new Date(selection.examEndDate);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return 'Invalid exam date provided.';
      }
      if (end < start) {
        return 'Exam end date must be after start date.';
      }
    }

    return null;
  }

  async function handleGeneratePreview() {
    if (!token) return;
    const validationError = validateForGeneration();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const url = bankId ? `/api/admin/pri-tests/${bankId}` : '/api/admin/pri-tests';
      const method = bankId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          program: program.trim(),
          domains: selectedDomains.map((domain) => ({
            domainId: domain.domainId,
            domainName: domain.domainName,
            domainShare: domain.domainShare,
            domainStartTime: domain.domainStartTime,
            domainEndTime: domain.domainEndTime,
            subskills: domain.subskills.map((sub) => ({
              name: sub.name,
              share: sub.share,
              priContribution: computePriContribution(domain.domainShare, sub.share),
              questionCount: Math.max(0, sub.difficultyShare.easy + sub.difficultyShare.medium + sub.difficultyShare.hard),
              questionType: sub.questionType,
              difficultyShare: {
                easy: Number(sub.difficultyShare.easy) || 0,
                medium: Number(sub.difficultyShare.medium) || 0,
                hard: Number(sub.difficultyShare.hard) || 0,
              }
            })),
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to generate preview');
        return;
      }

      setBankId(data.bank._id);
      setGeneratedQuestions(data.bank.questions ?? []);
      setQuestionPage(1);
      setStepIndex(4);
    } catch {
      setError('Network error while generating preview');
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish() {
    if (!token || !bankId) return;
    const validationError = validateForPublish();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    const institutionsPayload = Object.entries(institutionSelections)
      .filter(([, value]) => value.selected)
      .map(([id, value]) => ({
        institutionId: id,
        examStartDate: value.examStartDate,
        examEndDate: value.examEndDate,
      }));

    try {
      const res = await fetch(`/api/admin/pri-tests/${bankId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          institutions: institutionsPayload,
          questions: generatedQuestions,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to publish PRI test');
        return;
      }

      setBankId(data.bank._id);
      setError('');
      setShowPublishSuccessModal(true);
    } catch {
      setError('Network error while publishing');
    } finally {
      setLoading(false);
    }
  }

  function handlePublishSuccessAcknowledge() {
    setShowPublishSuccessModal(false);
    window.location.href = '/admin?tab=pri-tests&published=1';
  }

  function handleLogout() {
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_role');
    window.location.href = '/';
  }

  if (!mounted || !token) return null;

  const sidebarItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/admin',
    },
    {
      label: 'PRI Test Builder',
      icon: ClipboardList,
      href: '/admin/pri-test',
      active: true,
    },
    {
      label: 'Institution Management',
      icon: Building2,
      href: '/admin?tab=institutions',
    },
    {
      label: 'PRI Management',
      icon: ClipboardList,
      href: '/admin?tab=pri-tests',
    },
    {
      label: 'Approved Bank',
      icon: BookOpen,
      href: '/admin?tab=approved-bank',
    },
    {
      label: 'Contributors',
      icon: Users,
      href: '/admin?tab=contributors',
    },
    {
      label: 'Contribution Review',
      icon: ClipboardCheck,
      href: '/admin?tab=review',
    },
  ];

  return (
    <DashboardLayout
      userType="Admin"
      username={adminUser}
      onLogout={handleLogout}
      sidebarItems={sidebarItems}
      onBack={() => {
        if (stepIndex > 0) {
          setStepIndex(stepIndex - 1);
        } else {
          window.location.href = '/admin';
        }
      }}
      headerTitle="PRI Test Builder"
      headerSubtitle="Generate the question bank and share it with institutions"
      isBlurred={showPublishSuccessModal}
    >
      {showPublishSuccessModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">PRI Management</p>
              <h3 className="mt-2 text-xl font-black text-zinc-900 tracking-tight">PRI Published Successfully</h3>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm font-medium text-zinc-600 leading-relaxed">
                Your PRI test has been published. Click OK to open PRI Management and view it in Published status.
              </p>
              <div className="mt-6 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handlePublishSuccessAcknowledge}
                  className="rounded-xl bg-[#D62027] text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-[#b71b20] transition-all"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-9999 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border text-sm font-bold transition-all animate-in fade-in slide-in-from-top-2 ${toast.type === 'error' ? 'bg-red-50 border-red-200 text-[#D62027]' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
          {toast.message}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-xs font-bold uppercase tracking-widest text-[#D62027]">
          {error}
        </div>
      )}

      <div className="g360-card no-hover p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Step {stepIndex + 1} / {steps.length}</p>
            <h2 className="text-3xl font-black text-zinc-900 tracking-tight mt-2">{steps[stepIndex]}</h2>
          </div>
          <div className="flex items-center gap-2">
<button
              disabled={stepIndex === 0}
              onClick={() => {
                // If going back from preview, clear stale questions
                if (stepIndex === 4) {
                  setGeneratedQuestions([]);
                  setBankId(null);
                }
                setStepIndex((prev) => Math.max(0, prev - 1));
              }}
              className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-black uppercase tracking-widest text-zinc-500 disabled:opacity-40"
            >
              Back
            </button>
            {stepIndex < steps.length - 1 && (
              <button
                onClick={() => {
                  const err = validateCurrentStep();
                  if (err) { setError(err); return; }
                  setError('');
                  setStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
                }}
                className="rounded-xl bg-black text-white px-4 py-2 text-xs font-black uppercase tracking-widest"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>

      {stepIndex === 0 && (
        <div className="g360-card no-hover p-6 md:p-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-zinc-50/50 rounded-2xl border border-zinc-100">
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-zinc-900">Test Schedule Mode</h4>
              <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Is this evaluation for a single day or a seasonal period?</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-black uppercase tracking-widest ${!isSingleDay ? 'text-[#D62027]' : 'text-zinc-400'}`}>Seasonal Range</span>
              <button 
                onClick={() => {
                  const newIsSingleDay = !isSingleDay;
                  setIsSingleDay(newIsSingleDay);
                  if (newIsSingleDay && examStartDate) {
                    setExamEndDate(examStartDate);
                  }
                }}
                className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isSingleDay ? 'bg-black' : 'bg-zinc-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${isSingleDay ? 'left-7' : 'left-1'}`} />
              </button>
              <span className={`text-[10px] font-black uppercase tracking-widest ${isSingleDay ? 'text-black' : 'text-zinc-400'}`}>Single Day</span>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Test Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="January PRI Test"
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-base focus:ring-2 focus:ring-[#D62027]/10 focus:border-[#D62027] transition-all font-medium placeholder:text-zinc-300"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Program</label>
              <select
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#D62027]/10 focus:border-[#D62027] transition-all font-medium"
              >
                {['FSE'].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={`grid gap-6 ${isSingleDay ? 'md:grid-cols-1' : 'md:grid-cols-2'}`}>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">{isSingleDay ? 'Evaluation Date' : 'Exam Start Date'}</label>
              <input
                type="date"
                value={examStartDate}
                onChange={(e) => {
                  setExamStartDate(e.target.value);
                  if (isSingleDay) setExamEndDate(e.target.value);
                }}
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#D62027]/10 focus:border-[#D62027] transition-all font-medium"
              />
            </div>
            {!isSingleDay && (
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Exam End Date</label>
                <input
                  type="date"
                  value={examEndDate}
                  onChange={(e) => setExamEndDate(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#D62027]/10 focus:border-[#D62027] transition-all font-medium"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {stepIndex === 1 && (
        <div className="g360-card no-hover p-0 overflow-hidden space-y-0">
          {/* Step 2 Header */}
          <div className="p-6 md:p-8 border-b border-zinc-50 bg-white space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-zinc-900 leading-none mb-1">Domain Weightage</h3>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Select domains, allocate shares and set timings</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-56">
                  <input
                    type="text"
                    placeholder="Search domains..."
                    value={domainSearch}
                    onChange={(e) => setDomainSearch(e.target.value)}
                    className="w-full bg-zinc-50 border-none rounded-xl pl-4 pr-10 py-2.5 text-xs font-bold uppercase tracking-widest placeholder:text-zinc-300 focus:ring-2 focus:ring-black/5 transition-all outline-none"
                  />
                </div>
                <div className="px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total:</span>
                  <span className={`text-sm font-black ${Math.abs(domainShareSum - 100) < 0.001 ? 'text-green-600' : 'text-amber-600'}`}>
                    {Number(domainShareSum.toFixed(4))}%
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDomainTemplate(prev => !prev)}
                  className={`whitespace-nowrap text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl shadow transition-all flex items-center gap-2 ${showDomainTemplate ? 'bg-zinc-200 text-zinc-600' : 'bg-black text-white hover:bg-zinc-800'}`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {showDomainTemplate ? 'Close AI Setup' : 'Quick AI Setup'}
                </button>
              </div>
            </div>


            {/* Domain template paste zone */}
            {showDomainTemplate && (
              <div className="p-6 bg-zinc-50 border-b border-zinc-100 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="max-w-3xl space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        const nonPsycho = domains.filter(d => d.domainId !== 'workspace-psychology');
                        const lines = nonPsycho.map(d =>
                          `[DOMAIN] ${d.domainName}\n  SHARE: XX.XXXX%\n  TIME: HH:MM AM/PM - HH:MM AM/PM`
                        );
                        const psychoLine = includePsychometric
                          ? `\n\n[DOMAIN] Workspace Psychology GATE\n  TIME: HH:MM AM/PM - HH:MM AM/PM   (No SHARE needed — Pass/Fail)`
                          : '';
                        const templateStrict = lines.join('\n\n') + psychoLine;

                        const promptText = `Please act as an instructional designer configuring a PRI Assessment. 

Before generating the final configuration, answer these questions:
1. What is the overall Start Time for the assessment?
2. What is the Test Duration for EACH domain?
3. What is the Time Gap between each domain test (if any)?
4. Should the domains have an equal SHARE (%), or a specific share? If specific, how much for each?

Constraints to evaluate:
- Ensure all SHARE percentages sum strictly to exactly 100%. Use high-precision fractional values (e.g., 16.6667%) where necessary for mathematical precision.
- Provide weights for ALL domains listed below, including "Digital Business".
- Ensure the start and end TIME for each domain is calculated chronologically, considering duration and gaps.
- The TIME must be in 12-hour HH:MM AM/PM format (e.g., 09:30 AM, 02:45 PM).

After answering the questions and verifying the math and timing constraints, provide ONLY the final configuration precisely in the strict format below. Do not deviate from the format:

${templateStrict}`;

                        navigator.clipboard.writeText(promptText);
                        showToast('Domain AI prompt copied! Paste into AI to generate configuration.');
                      }}
                      className="whitespace-nowrap w-fit text-[10px] font-black uppercase tracking-widest px-6 py-3 bg-[#D62027] text-white rounded-xl shadow hover:bg-[#b71b20] transition-all flex items-center gap-2"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy AI Prompt
                    </button>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      Step 1: Copy prompt and ask your AI assistant
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700">Step 2: Paste AI Response Here</span>
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest hidden sm:inline">
                        Format: [DOMAIN] Name · SHARE: N.NN% · TIME: 09:00 AM - 10:00 AM
                      </span>
                    </div>
                    <textarea
                      value={domainTemplateText}
                      onChange={(e) => setDomainTemplateText(e.target.value)}
                      placeholder={`[DOMAIN] Cognitive Intelligence\n  SHARE: 20.0000%\n  TIME: 09:00 AM - 09:45 AM\n\n[DOMAIN] Business Intelligence\n  SHARE: 20.0000%\n  TIME: 10:00 AM - 10:45 AM`}
                      rows={8}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-xs font-mono focus:ring-2 focus:ring-[#D62027]/10 focus:border-[#D62027] transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!domainTemplateText.trim()) return;
                        const { domains: parsed, errors: parseErrors } = parseDomainTemplate(domainTemplateText, domains);
                        if (parseErrors.length > 0) {
                          setError(parseErrors.join(' | '));
                          return;
                        }
                        // Validate time: start < end
                        const timeError = parsed.find(d => d.selected && d.domainStartTime && d.domainEndTime && (
                          (parseTimeToMinutes(d.domainStartTime) ?? 0) >= (parseTimeToMinutes(d.domainEndTime) ?? 0)
                        ));
                        if (timeError) {
                          setError(`End time must be after start time for ${timeError.domainName}.`);
                          return;
                        }
                        setDomains(parsed);
                        setError('');
                        setDomainTemplateText('');
                        setShowDomainTemplate(false);
                        showToast('Domain configuration applied!');
                      }}
                      className="w-full py-3 rounded-xl bg-black text-white text-[10px] font-black uppercase tracking-widest shadow hover:bg-zinc-800 transition-all flex justify-center items-center gap-2"
                    >
                      <Check className="w-3.5 h-3.5" /> Apply Domain Config
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="overflow-auto max-h-150 custom-scrollbar">
            <div className="p-6 md:p-8 space-y-4">
              {domains
                .filter(d => {
                  if (!includePsychometric && d.domainId === 'workspace-psychology') return false;
                  return d.domainName.toLowerCase().includes(domainSearch.toLowerCase());
                })
                .map((domain) => (
                <div key={domain.domainId} className="rounded-2xl border border-zinc-100 bg-white p-5">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <label className="flex items-center gap-4 text-sm font-black text-zinc-900 group cursor-pointer">
                        <input
                          type="checkbox"
                          checked={domain.selected}
                          onChange={(e) => {
                            updateDomain(domain.domainId, (prev) => ({ ...prev, selected: e.target.checked }));
                          }}
                          className="w-5 h-5 rounded-lg border-zinc-300 text-black focus:ring-black accent-black"
                        />
                        <div className="flex flex-col gap-0.5">
                          <span className="uppercase tracking-tight leading-none">{domain.domainName}</span>
                          <span className="text-[9px] font-bold text-zinc-400 tracking-widest uppercase">
                            {domain.domainId === 'workspace-psychology'
                              ? 'Pass / Fail'
                              : `${domain.subskills.length} Subskills defined`}
                          </span>
                        </div>
                      </label>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3 w-full md:w-auto">
                      {domain.domainId !== 'workspace-psychology' && (
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Weightage %</label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            disabled={!domain.selected}
                            value={domain.domainShare}
                            step="any"
                            onChange={(e) => updateDomain(domain.domainId, (prev) => ({ ...prev, domainShare: Number(e.target.value) }))}
                            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#D62027]/10 disabled:opacity-30 disabled:bg-zinc-50"
                            placeholder="0.0000"
                          />
                        </div>
                      )}
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Start Time</label>
                        <input
                          type="time"
                          disabled={!domain.selected}
                          value={domain.domainStartTime}
                          onChange={(e) => updateDomain(domain.domainId, (prev) => ({ ...prev, domainStartTime: e.target.value }))}
                          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#D62027]/10 disabled:opacity-30 disabled:bg-zinc-50"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">End Time</label>
                        <input
                          type="time"
                          disabled={!domain.selected}
                          value={domain.domainEndTime}
                          onChange={(e) => updateDomain(domain.domainId, (prev) => ({ ...prev, domainEndTime: e.target.value }))}
                          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#D62027]/10 disabled:opacity-30 disabled:bg-zinc-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {domains.filter(d => d.domainName.toLowerCase().includes(domainSearch.toLowerCase())).length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-zinc-400 font-black uppercase tracking-widest text-xs">No domains matching &ldquo;{domainSearch}&rdquo;</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {stepIndex === 2 && (
        <div className="space-y-6 relative">
          {/* Subskill Template Paste Zone */}
          <div className="g360-card no-hover p-0 overflow-hidden">
            <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-50 bg-white">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-zinc-700">Subskill Configuration</p>
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Configure each subskill share per domain — must total 100% per domain</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowSubskillTemplate(prev => !prev)}
                  className={`whitespace-nowrap text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl shadow transition-all flex items-center gap-2 ${showSubskillTemplate ? 'bg-zinc-200 text-zinc-600' : 'bg-black text-white hover:bg-zinc-800'}`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {showSubskillTemplate ? 'Close AI Setup' : 'Quick AI Setup'}
                </button>
              </div>
            </div>

            {/* AI Setup Zone Subskill */}
            {showSubskillTemplate && (
              <div className="p-6 bg-zinc-50 border-b border-zinc-100 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="max-w-3xl space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        const lines = selectedDomains
                          .filter(d => d.domainId !== 'workspace-psychology')
                          .map(d => {
                            const subLines = d.subskills.map(s =>
                              `  [SUBSKILL] ${s.name}  SHARE: XX.XXXX%  TYPE: MCQ  EASY: 0  MEDIUM: 0  HARD: 0`
                            ).join('\n');
                            return `[DOMAIN] ${d.domainName}\n${subLines}`;
                          });
                        if (lines.length === 0) {
                          showToast('Select at least one non-psychometric domain first.', 'error');
                          return;
                        }

                        const templateStrict = lines.join('\n\n');
                        
                        const promptText = `Please act as an instructional designer configuring PRI test subskills.

Before generating the final configuration, answer these questions:
1. For each domain, should subskills have an equal SHARE (%), or specific weights? If specific, how much for each?
2. What is the target difficulty distribution (EASY, MEDIUM, HARD question counts) for each subskill?
3. Should questions be MCQ or WRITTEN?

Constraints to evaluate:
- Ensure the subskill SHARE percentages within EACH domain sum strictly to exactly 100%. Evaluate each domain's sum separately.
- Use high-precision fractional values (e.g., 33.3333%) for shares where necessary for exact mathematical precision.
- Question counts must be numeric integers.

After answering the questions and verifying the math constraints, provide ONLY the final configuration precisely in the strict format below. Do not deviate from the format:

${templateStrict}`;

                        navigator.clipboard.writeText(promptText);
                        showToast('Subskill AI prompt copied! Paste into AI to generate configuration.');
                      }}
                      className="whitespace-nowrap w-fit text-[10px] font-black uppercase tracking-widest px-6 py-3 bg-[#D62027] text-white rounded-xl shadow hover:bg-[#b71b20] transition-all flex items-center gap-2"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy AI Prompt
                    </button>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      Step 1: Copy prompt and ask your AI assistant
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700">Step 2: Paste AI Response Here</span>
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest hidden sm:inline">
                        Format: [DOMAIN] Name → [SUBSKILL] Name · SHARE: N% · TYPE: MCQ/WRITTEN · EASY: N · MEDIUM: N · HARD: N
                      </span>
                    </div>
                    <textarea
                      value={subskillTemplateText}
                      onChange={(e) => setSubskillTemplateText(e.target.value)}
                      placeholder={`[DOMAIN] Cognitive Intelligence\n  [SUBSKILL] Logical Reasoning  SHARE: 30%  TYPE: MCQ  EASY: 5  MEDIUM: 3  HARD: 2\n  [SUBSKILL] Numerical Reasoning  SHARE: 70%  TYPE: MCQ  EASY: 4  MEDIUM: 2  HARD: 1`}
                      rows={10}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-xs font-mono focus:ring-2 focus:ring-[#D62027]/10 focus:border-[#D62027] transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!subskillTemplateText.trim()) return;
                        const { domains: parsed, errors: parseErrors } = parseSubskillTemplate(subskillTemplateText, domains);
                        if (parseErrors.length > 0) {
                          setError(parseErrors.join(' | '));
                          return;
                        }
                        setDomains(parsed);
                        setError('');
                        setSubskillTemplateText('');
                        setShowSubskillTemplate(false);
                        showToast('Subskill configuration applied!');
                      }}
                      className="w-full py-3 rounded-xl bg-black text-white text-[10px] font-black uppercase tracking-widest shadow hover:bg-zinc-800 transition-all flex justify-center items-center gap-2"
                    >
                      <Check className="w-3.5 h-3.5" /> Apply Subskill Config
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Domain tab bar — only selected domains */}
          {selectedDomains.length > 0 && (
            <div className="sticky top-0 z-40 bg-zinc-50/90 backdrop-blur-md p-3 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-2 overflow-x-auto custom-scrollbar">
              <div className="flex gap-2">
                {selectedDomains.map((d) => (
                  <button
                    key={d.domainId}
                    type="button"
                    className={`whitespace-nowrap rounded-xl border px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                      (activeSubskillTab || selectedDomains[0]?.domainId) === d.domainId
                        ? 'bg-black text-white border-black shadow-md'
                        : 'bg-white border-zinc-200 text-zinc-600'
                    }`}
                    onClick={() => setActiveSubskillTab(d.domainId)}
                  >
                    {d.domainName}
                    {d.domainId !== 'workspace-psychology' && d.domainShare > 0 && (
                      <span className="ml-2 opacity-60">({d.domainShare}%)</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          {(() => {
            const domain = selectedDomains.find(d => d.domainId === (activeSubskillTab || selectedDomains[0]?.domainId));
            if (!domain) return null;
            const shareTotal = sum(domain.subskills.map((s) => s.share));
            const activeTrait = domain.subskills.find(s => s.name === activeTraitName) || domain.subskills[0];

            return (
              <div key={domain.domainId} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="g360-card no-hover p-4 md:p-6 bg-zinc-50/30 border-dashed">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black uppercase tracking-tight text-zinc-600">{domain.domainName}</h3>
                    {domain.domainId !== 'workspace-psychology' ? (
                      <span className={`text-[10px] font-black uppercase tracking-widest ${Math.abs(shareTotal - 100) < 0.001 ? 'text-green-600' : 'text-amber-600'}`}>
                        Share total: {Number(shareTotal.toFixed(4))}%
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Trait Config
                      </span>
                    )}
                  </div>
                </div>

                {/* Traits Navbar */}
                <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
                  {domain.subskills.map((sub) => {
                    const contribution = computePriContribution(domain.domainShare, sub.share);
                    return (
                      <button
                        key={sub.name}
                        type="button"
                        onClick={() => setActiveTraitName(sub.name)}
                        className={`whitespace-nowrap px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                          activeTraitName === sub.name
                            ? 'bg-[#D62027]/5 border-[#D62027]/20 text-[#D62027] shadow-sm ring-1 ring-[#D62027]/10'
                            : 'bg-white border-zinc-100 text-zinc-500 hover:border-zinc-300'
                        }`}
                      >
                        {sub.name}
                        {domain.domainId !== 'workspace-psychology' ? (
                           <span className="bg-zinc-100 px-1.5 py-0.5 rounded text-[9px] text-zinc-600">
                             {contribution}% PRI
                           </span>
                        ) : (
                          <span className="bg-zinc-100 px-1.5 py-0.5 rounded text-[9px] text-zinc-600">
                            {sub.difficultyShare.easy + sub.difficultyShare.medium + sub.difficultyShare.hard} Qs
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                <div className="max-h-150 overflow-y-auto pr-2 custom-scrollbar">
                  {activeTrait && (
                    <div key={activeTrait.name} className="g360-card no-hover p-6 md:p-8">
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="md:col-span-2">
                          <p className="text-xl font-black text-zinc-900">{activeTrait.name}</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1">Configure trait properties and difficulty distribution</p>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Total Questions</label>
                          <input
                            type="number"
                            disabled
                            value={activeTrait.difficultyShare.easy + activeTrait.difficultyShare.medium + activeTrait.difficultyShare.hard}
                            className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs bg-slate-50 text-slate-500 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <div className="mt-6 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 grid gap-6">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Assessment Type</label>
                          <div className="flex gap-2">
                            {['mcq', 'written'].map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setSubskill(domain.domainId, activeTrait.name, (prev) => ({
                                  ...prev,
                                  questionType: type as QuestionType,
                                }))}
                                className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                                  activeTrait.questionType === type
                                    ? 'bg-black text-white border-black'
                                    : 'bg-white text-zinc-400 border-zinc-100 hover:border-zinc-200'
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>

                        {domain.domainId !== 'workspace-psychology' ? (
                          <>
                            <div className="grid gap-4 md:grid-cols-3">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Easy Count</label>
                                <input
                                  type="number"
                                  min={0}
                                  value={activeTrait.difficultyShare.easy}
                                  onChange={(e) => {
                                    const easy = Number(e.target.value);
                                    setSubskill(domain.domainId, activeTrait.name, (prev) => ({
                                      ...prev,
                                      difficultyShare: { ...prev.difficultyShare, easy },
                                      questionCount: easy + prev.difficultyShare.medium + prev.difficultyShare.hard
                                    }));
                                  }}
                                  className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Medium Count</label>
                                <input
                                  type="number"
                                  min={0}
                                  value={activeTrait.difficultyShare.medium}
                                  onChange={(e) => {
                                    const medium = Number(e.target.value);
                                    setSubskill(domain.domainId, activeTrait.name, (prev) => ({
                                      ...prev,
                                      difficultyShare: { ...prev.difficultyShare, medium },
                                      questionCount: prev.difficultyShare.easy + medium + prev.difficultyShare.hard
                                    }));
                                  }}
                                  className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Hard Count</label>
                                <input
                                  type="number"
                                  min={0}
                                  value={activeTrait.difficultyShare.hard}
                                  onChange={(e) => {
                                    const hard = Number(e.target.value);
                                    setSubskill(domain.domainId, activeTrait.name, (prev) => ({
                                      ...prev,
                                      difficultyShare: { ...prev.difficultyShare, hard },
                                      questionCount: prev.difficultyShare.easy + prev.difficultyShare.medium + hard
                                    }));
                                  }}
                                  className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm"
                                />
                              </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 pt-2 border-t border-zinc-200/50">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Subskill Share (%)</label>
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  step="any"
                                  value={activeTrait.share}
                                  onChange={(e) => setSubskill(domain.domainId, activeTrait.name, (prev) => ({ ...prev, share: Number(e.target.value) }))}
                                  className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">PRI Contribution (%)</label>
                                <div className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm bg-zinc-100/50 font-bold text-zinc-900 flex items-center justify-between">
                                  {computePriContribution(domain.domainShare, activeTrait.share)}%
                                  <span className="text-[8px] opacity-40">AUTO-CALCULATED</span>
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="space-y-2">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Question Count</label>
                            <input
                              type="number"
                              min={0}
                              value={activeTrait.difficultyShare.easy + activeTrait.difficultyShare.medium + activeTrait.difficultyShare.hard}
                              onChange={(e) => {
                                const count = Number(e.target.value);
                                setSubskill(domain.domainId, activeTrait.name, (prev) => ({
                                  ...prev,
                                  difficultyShare: { easy: count, medium: 0, hard: 0 },
                                  questionCount: count,
                                }));
                              }}
                              className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-base font-bold"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
          {selectedDomains.length === 0 && (
            <div className="g360-card no-hover p-6 md:p-8 text-sm text-zinc-500">Select domains to configure subskills.</div>
          )}
        </div>
      )}

      {stepIndex === 3 && (
        <div className="g360-card no-hover p-0 overflow-hidden">
          <div className="p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-100 bg-white">
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-zinc-900 leading-none mb-1">Target Institutions</h3>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Select the institutions that will receive this test</p>
            </div>
            <div className="relative w-full sm:w-64 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-[#D62027] transition-colors" />
              <input 
                type="text"
                placeholder="Search institutions..."
                value={institutionSearch}
                onChange={(e) => setInstitutionSearch(e.target.value)}
                className="w-full bg-zinc-50 border-none rounded-xl pl-11 pr-4 py-3 text-xs font-bold uppercase tracking-widest placeholder:text-zinc-300 focus:ring-2 focus:ring-[#D62027]/10 transition-all outline-none"
              />
            </div>
          </div>

          <div className="overflow-auto max-h-150 custom-scrollbar">
            <div className="p-6 md:p-8 space-y-4">
              {institutions.filter(inst => 
                inst.name.toLowerCase().includes(institutionSearch.toLowerCase()) || 
                inst.code.toLowerCase().includes(institutionSearch.toLowerCase())
              ).length === 0 && (
                <div className="py-20 text-center">
                   <p className="text-zinc-400 font-black uppercase tracking-widest text-xs">No institutions matching "{institutionSearch}"</p>
                </div>
              )}
              {institutions.filter(inst => 
                inst.name.toLowerCase().includes(institutionSearch.toLowerCase()) || 
                inst.code.toLowerCase().includes(institutionSearch.toLowerCase())
              ).map((inst) => {
                const selection = institutionSelections[inst._id];
                return (
                  <div key={inst._id} className="rounded-2xl border border-zinc-100 bg-white p-5 no-hover">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <label className="flex items-center gap-4 text-sm font-black text-zinc-900 group cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selection?.selected ?? false}
                            onChange={(e) =>
                              setInstitutionSelections((prev) => ({
                                ...prev,
                                [inst._id]: {
                                  ...(prev[inst._id] ?? { examStartDate: '', examEndDate: '' }),
                                  selected: e.target.checked,
                                  ...(e.target.checked && examStartDate && !(prev[inst._id]?.examStartDate)
                                    ? { examStartDate }
                                    : {}),
                                  ...(e.target.checked && examEndDate && !(prev[inst._id]?.examEndDate)
                                    ? { examEndDate }
                                    : {}),
                                },
                              }))
                            }
                            className="w-5 h-5 rounded-lg border-zinc-300 text-black focus:ring-black accent-black"
                          />
                          <div className="flex flex-col gap-0.5">
                             <span className="uppercase tracking-tight leading-none">{inst.name}</span>
                             <span className="text-[9px] font-bold text-zinc-400 tracking-widest uppercase">{inst.code}</span>
                          </div>
                        </label>
                      </div>
                      <div className={isSingleDay ? 'grid gap-2 md:grid-cols-1' : 'grid gap-2 md:grid-cols-2'}>
                        <div className="space-y-1.5">
                          {!isSingleDay && <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Start Date</label>}
                          <input
                            type="date"
                            readOnly
                            value={selection?.examStartDate ?? ''}
                            className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-xs bg-zinc-50 text-zinc-500 cursor-not-allowed font-bold"
                          />
                        </div>
                        {!isSingleDay && (
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">End Date</label>
                            <input
                              type="date"
                              readOnly
                              value={selection?.examEndDate ?? ''}
                              className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-xs bg-zinc-50 text-zinc-500 cursor-not-allowed font-bold"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="p-6 md:p-8 bg-zinc-50 border-t border-zinc-100 flex justify-end">
            <button
              onClick={handleGeneratePreview}
              disabled={loading}
              className="rounded-xl bg-black text-white px-8 py-3 text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
            >
              {loading ? 'Generating...' : 'Generate Test Preview'}
            </button>
          </div>
        </div>
      )}

      {stepIndex === 4 && (
        <div className="space-y-6 relative animate-in fade-in duration-500">
          {/* Visual Summary Section */}
          <div className="g360-card no-hover p-6 md:p-8 overflow-hidden">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D62027]">Final Review</p>
            <h3 className="text-3xl font-black mt-2 tracking-tight uppercase text-zinc-900">{title || 'Untitled Test'}</h3>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <span className="px-3 py-1 bg-zinc-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-600 border border-zinc-200">
                Program: {program}
              </span>
              <span className="px-3 py-1 bg-zinc-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-600 border border-zinc-200">
                Window: {examStartDate}{examEndDate !== examStartDate ? ` → ${examEndDate}` : ''}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="g360-card no-hover p-6 md:p-8 overflow-hidden">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-8">Domain Execution Timeline</p>
            <div className="relative pb-2">
              {/* Black horizontal line — spans between first and last dot centres */}
              <div className="absolute top-2.5 h-0.5 bg-zinc-900"
                style={{
                  left: `${100 / (2 * selectedDomains.length)}%`,
                  right: `${100 / (2 * selectedDomains.length)}%`,
                }}
              />
              <div className="flex justify-between items-start relative">
                {[...selectedDomains]
                  .sort((a, b) => (parseTimeToMinutes(a.domainStartTime) ?? 0) - (parseTimeToMinutes(b.domainStartTime) ?? 0))
                  .map((domain) => (
                    <div key={domain.domainId} className="flex-1 group">
                      <div className="flex flex-col items-center">
                        <div className="w-5 h-5 rounded-full bg-white border-2 border-zinc-900 flex items-center justify-center mb-3 group-hover:bg-[#D62027] group-hover:border-[#D62027] transition-all duration-200 shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 group-hover:bg-white transition-colors duration-200" />
                        </div>
                        <p className="text-[8px] font-black uppercase tracking-tight text-center leading-tight text-zinc-700 px-1 mb-1">{domain.domainName}</p>
                        <p className="text-[9px] font-bold text-[#D62027] text-center">{domain.domainStartTime} – {domain.domainEndTime}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Domain Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {selectedDomains.map((domain) => (
              <div key={domain.domainId} className="g360-card no-hover p-5 overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{domain.domainId === 'workspace-psychology' ? 'Psychology' : `${domain.domainShare}% Weight`}</p>
                    <h4 className="text-sm font-black mt-1 uppercase leading-tight text-zinc-900">{domain.domainName}</h4>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-[10px] font-black text-zinc-600 border border-zinc-200 shrink-0">
                    {domain.subskills.length}
                  </div>
                </div>
                <div className="space-y-2.5 mt-3">
                  {domain.subskills.map(sub => (
                    <div key={sub.name} className="flex items-center justify-between">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase truncate max-w-37.5">{sub.name}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        {domain.domainId !== 'workspace-psychology' && (
                          <span className="text-[9px] font-black text-zinc-400">{sub.share}%</span>
                        )}
                        <span className="text-[9px] font-black text-[#D62027]">{sub.questionCount} Qs</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Institutions */}
          {Object.values(institutionSelections).some(v => v.selected) && (
            <div className="g360-card no-hover p-6 overflow-hidden">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Target Institutions</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(institutionSelections)
                  .filter(([, v]) => v.selected)
                  .map(([id]) => {
                    const inst = institutions.find(i => i._id === id);
                    return (
                      <span key={id} className="px-3 py-1.5 rounded-xl bg-[#D62027]/8 border border-[#D62027]/20 text-[#D62027] text-[10px] font-black uppercase tracking-widest">
                        {inst?.name || id}
                      </span>
                    );
                  })}
              </div>
            </div>
          )}

          {selectedDomains.length > 0 && generatedQuestions.length > 0 && (
            <div className="sticky top-0 z-40 bg-zinc-50/90 backdrop-blur-md p-3 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-2 overflow-x-auto custom-scrollbar">
              <div className="flex gap-2">
                {selectedDomains.map((d) => (
                  <button
                    key={d.domainId}
                    type="button"
                    className={`whitespace-nowrap rounded-xl border px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                      (activePreviewTab || selectedDomains[0]?.domainId) === d.domainId 
                        ? 'bg-black text-white border-black shadow-md' 
                        : 'bg-white border-zinc-200 text-zinc-600 no-hover'
                    }`}
                    onClick={() => setActivePreviewTab(d.domainId)}
                  >
                    {d.domainName}
                    {d.domainId !== 'workspace-psychology' && d.domainShare > 0 && (
                      <span className="ml-2 opacity-60">({d.domainShare}%)</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="g360-card no-hover p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl font-black uppercase tracking-tight">Preview & Edit Questions</h3>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                <span>Page {questionPage} / {totalQuestionPages}</span>
                <button
                  type="button"
                  onClick={() => setQuestionPage((prev) => Math.max(1, prev - 1))}
                  disabled={questionPage === 1}
                  className="rounded-lg border border-zinc-200 px-3 py-2 disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setQuestionPage((prev) => Math.min(totalQuestionPages, prev + 1))}
                  disabled={questionPage === totalQuestionPages}
                  className="rounded-lg border border-zinc-200 px-3 py-2 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
            {generatedQuestions.length === 0 && (
              <p className="text-sm text-zinc-500 mt-4">Generate the question bank to preview questions.</p>
            )}
          </div>

          {selectedDomains.length > 0 && (
            <div className="g360-card no-hover p-6 md:p-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Domain Time Slots</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {selectedDomains.map((domain) => (
                  <div key={domain.domainId} className="rounded-xl border border-zinc-100 bg-white px-4 py-3">
                    <p className="text-sm font-black text-zinc-900">{domain.domainName}</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mt-1">
                      {domain.domainStartTime || '--:--'} - {domain.domainEndTime || '--:--'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pagedQuestions.map((question, pageIndex) => {
            const absoluteIndex = (questionPage - 1) * pageSize + pageIndex;
            const actualIndex = generatedQuestions.indexOf(question);
            return (
            <div key={`${question.domainId}-${actualIndex}`} className="g360-card no-hover p-6 md:p-8">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{question.domainName} / {question.subSkill}</p>
                  <p className="text-lg font-black text-zinc-900">Question {absoluteIndex + 1}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-widest bg-zinc-100 px-3 py-1 rounded-lg">
                    {question.questionType}
                  </span>
                  {question.domainId !== 'workspace-psychology' && (
                  <span className="text-xs font-black uppercase tracking-widest bg-zinc-100 px-3 py-1 rounded-lg">
                    {question.difficulty}
                  </span>
                  )}
                </div>
              </div>
              {question.caseContext && (
                <div className="mb-4 rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-4">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Case Study</p>
                  {question.caseContextImageUrl && (
                    <img
                      src={question.caseContextImageUrl}
                      alt="Case context"
                      className="mb-3 max-h-48 rounded-lg object-contain"
                    />
                  )}
                  <p className="text-sm text-zinc-700 whitespace-pre-wrap">{question.caseContext}</p>
                </div>
              )}

              {question.questionImageUrl && !question.caseContext && (
                <div className="mb-4">
                  <img
                    src={question.questionImageUrl}
                    alt="Question"
                    className="max-h-48 rounded-xl object-contain border border-zinc-200"
                  />
                </div>
              )}

              <textarea
                value={question.questionText}
                onChange={(e) =>
                  setGeneratedQuestions((prev) =>
                    prev.map((q, idx) => (idx === actualIndex ? { ...q, questionText: e.target.value } : q))
                  )
                }
                rows={3}
                className="w-full rounded-2xl border border-zinc-200 px-5 py-4 text-sm focus:ring-2 focus:ring-[#D62027]/10 focus:border-[#D62027] transition-all font-medium"
              />

              {question.questionImageUrl && question.caseContext && (
                <div className="mt-3">
                  <img
                    src={question.questionImageUrl}
                    alt="Question"
                    className="max-h-40 rounded-xl object-contain border border-zinc-200"
                  />
                </div>
              )}

              {question.questionType === 'mcq' && (
                <div className="grid gap-3 md:grid-cols-2 mt-5">
                  {question.options.map((opt, optIndex) => (
                    <div key={opt.label} className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Option {opt.label}</label>
                      <input
                        value={opt.text}
                        onChange={(e) =>
                          setGeneratedQuestions((prev) =>
                            prev.map((q, idx) => {
                              if (idx !== actualIndex) return q;
                              const nextOptions = q.options.map((option, innerIdx) =>
                                innerIdx === optIndex ? { ...option, text: e.target.value } : option
                              );
                              return { ...q, options: nextOptions };
                            })
                          )
                        }
                        className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs"
                      />
                    </div>
                  ))}
                  <div className="md:col-span-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Correct Answer</label>
                    <div className="flex gap-2 mt-2">
                      {question.options.map((opt) => (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() =>
                            setGeneratedQuestions((prev) =>
                              prev.map((q, idx) => (idx === actualIndex ? { ...q, correctAnswer: opt.label } : q))
                            )
                          }
                          className={`w-10 h-10 rounded-xl border font-black text-xs ${
                            question.correctAnswer === opt.label
                              ? 'bg-black text-white border-black'
                              : 'bg-white text-zinc-400 border-zinc-200'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            );
          })}

          {generatedQuestions.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
                Showing {(questionPage - 1) * pageSize + 1}–{Math.min(questionPage * pageSize, filteredPreviewQuestions.length)} of {filteredPreviewQuestions.length} questions
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuestionPage((prev) => Math.max(1, prev - 1))}
                  disabled={questionPage === 1}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-[10px] font-black uppercase tracking-widest disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setQuestionPage((prev) => Math.min(totalQuestionPages, prev + 1))}
                  disabled={questionPage === totalQuestionPages}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-[10px] font-black uppercase tracking-widest disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handlePublish}
              disabled={loading || generatedQuestions.length === 0}
              className="rounded-xl bg-[#D62027] text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest shadow-lg"
            >
              {loading ? 'Publishing...' : 'Publish PRI Test'}
            </button>
          </div>
        </div>
      )}

      </div>
    </DashboardLayout>
  );
}
