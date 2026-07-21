'use client';

import React, { useEffect, useState } from 'react';
import { Domain } from '@/lib/domains';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];

interface Option {
  label: string;
  text: string;
  imageUrl?: string;
  score?: number;
}

interface QuestionFormProps {
  domain: Domain;
  token: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function QuestionForm({ domain, token, onSuccess, onCancel }: QuestionFormProps) {
  const defaultOptionCount = 4;
  const CLOUDINARY_CLOUD_NAME = 'dvgllw3rq';
  const CLOUDINARY_UPLOAD_PRESET = 'grad360mba';

  const [trait, setTrait] = useState(domain.skills[0] ?? '');
  const isWorkspacePsychology = (domain.id as string) === 'workspace-psychology';
  const isCommunication = (domain.id as string) === 'communication';
  const [questionType, setQuestionType] = useState<'mcq' | 'written'>('mcq');
  const [questionText, setQuestionText] = useState('');
  const [questionImageUrl, setQuestionImageUrl] = useState('');
  const [sourceDetails, setSourceDetails] = useState('');
  const [caseContext, setCaseContext] = useState('');
  const [caseContextImageUrl, setCaseContextImageUrl] = useState('');
  const [bloomLevel, setBloomLevel] = useState<'Remember' | 'Understand' | 'Apply' | 'Analyse' | 'Create' | 'Evaluate'>(
    'Remember'
  );
  const [options, setOptions] = useState<Option[]>(
    OPTION_LABELS.slice(0, defaultOptionCount).map((l) => ({ label: l, text: '', score: 0 }))
  );
  const [correctAnswer, setCorrectAnswer] = useState('A');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [estimatedTimeMinutes, setEstimatedTimeMinutes] = useState(5);
  const [error, setError] = useState('');
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<{ field: string; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTrait(domain.skills[0] ?? '');
  }, [domain]);

  // For Communication domain, auto-set question type based on trait
  useEffect(() => {
    if (isCommunication) {
      setQuestionType(trait === 'Business Writing Task' ? 'written' : 'mcq');
    }
  }, [trait, isCommunication]);

  function updateOptionText(idx: number, text: string) {
    setOptions((prev) => prev.map((o, i) => (i === idx ? { ...o, text } : o)));
  }

  function updateOptionImage(idx: number, imageUrl: string) {
    setOptions((prev) => prev.map((o, i) => (i === idx ? { ...o, imageUrl } : o)));
  }

  function updateOptionScore(idx: number, score: number) {
    setOptions((prev) => prev.map((o, i) => (i === idx ? { ...o, score } : o)));
  }

  async function uploadToCloudinary(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error('Upload failed');
    }

    const data = await res.json();
    return (data.secure_url as string) || (data.url as string);
  }

  async function handleFileUpload(file: File | null, field: string, onUrl: (url: string) => void) {
    if (!file) return;
    setUploadingField(field);
    setUploadError(null);

    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadError({ field, message: 'Image size must be 5MB or less.' });
      setUploadingField(null);
      return;
    }

    try {
      const url = await uploadToCloudinary(file);
      onUrl(url);
    } catch {
      setUploadError({ field, message: 'Image upload failed. Please try again.' });
    } finally {
      setUploadingField(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!trait.trim()) {
      setError('Please select a trait.');
      return;
    }

    if (isWorkspacePsychology && trait.toLowerCase().trim() === 'general') {
      setError("Questions with 'General' trait cannot be submitted for Workplace Psychology.");
      return;
    }

    if (questionType === 'mcq' && options.some((o) => !o.text.trim())) {
      setError('All option fields must be filled in.');
      return;
    }

    if (
      questionType === 'mcq' &&
      isWorkspacePsychology &&
      options.some((o) => typeof o.score !== 'number' || ![-1, 0, 0.5, 1].includes(o.score))
    ) {
      setError('Each option must have a score of -1, 0, 0.5, or 1.');
      return;
    }

    if (!Number.isFinite(estimatedTimeMinutes) || estimatedTimeMinutes <= 0) {
      setError('Estimated time must be a positive number of minutes.');
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        domain: domain.id,
        subSkill: trait.trim(),
        questionType,
        questionText,
        ...(questionImageUrl.trim() ? { questionImageUrl: questionImageUrl.trim() } : {}),
        ...(sourceDetails.trim() ? { sourceDetails: sourceDetails.trim() } : {}),
        ...(caseContext.trim() ? { caseContext: caseContext.trim() } : {}),
        ...(caseContextImageUrl.trim() ? { caseContextImageUrl: caseContextImageUrl.trim() } : {}),
        ...(questionType === 'mcq'
          ? {
              options: options.map((o) => ({
                ...o,
                text: o.text.trim(),
                ...(o.imageUrl?.trim() ? { imageUrl: o.imageUrl.trim() } : {}),
                ...(typeof o.score === 'number' ? { score: o.score } : {}),
              })),
            }
          : { options: [] }),
        difficulty,
        ...(questionType === 'mcq' && !isWorkspacePsychology ? { correctAnswer } : {}),
        estimatedTimeMinutes,
        ...(!isWorkspacePsychology ? { bloomLevel } : {}),
      };

      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to submit question');
        return;
      }
      onSuccess();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputClasses = "w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm text-[#000000] placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#D62027]/5 focus:border-[#D62027] transition-all font-medium";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Domain Header */}
      <div className="bg-[#000000] text-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden mb-2">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D62027]/15 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-[#D62027] text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                  Domain {domain.number}
                </span>
                <div className="h-px w-8 bg-white/20" />
                <span className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em]">
                  Active Workspace
                </span>
              </div>
              <h2 className="text-3xl text-white md:text-4xl font-black tracking-tight uppercase">
                {domain.name}
              </h2>
            </div>
            
            <div className="flex flex-col items-start md:items-end gap-1">
               <span className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] mb-1">
                 Core Topics
               </span>
               <div className="flex flex-wrap gap-2 md:justify-end">
                 {Array.from(new Set(domain.skills.map(s => s.split(' - ')[0].trim()))).map((skill) => (
                   <span key={skill} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-white/80 backdrop-blur-sm">
                     {skill}
                   </span>
                 ))}
               </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 pt-6 border-t border-white/10">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-[#000000] bg-zinc-800 flex items-center justify-center text-[8px] font-bold text-white/50">
                  {i}
                </div>
              ))}
            </div>
            <p className="text-xs font-bold text-white/60 italic">
              &ldquo;Contributing to high-quality professional assessments.&rdquo;
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-10 bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
        {error && (
          <div className="bg-red-50 border border-red-100 text-[#D62027] text-xs px-5 py-4 rounded-2xl flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <p className="font-bold uppercase tracking-tight">{error}</p>
          </div>
        )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Trait
          </label>
          <select
            value={trait}
            onChange={(e) => setTrait(e.target.value)}
            className={inputClasses}
          >
            {domain.skills.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>
        </div>

        {!isWorkspacePsychology && (
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Bloom Level
            </label>
            <select
              value={bloomLevel}
              onChange={(e) => setBloomLevel(e.target.value as typeof bloomLevel)}
              className={inputClasses}
            >
              {['Remember', 'Understand', 'Apply', 'Analyse', 'Create', 'Evaluate'].map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Question Type
          </label>
          <div className="flex gap-2">
            {(['mcq', 'written'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => !isCommunication && setQuestionType(type)}
                disabled={isCommunication}
                className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all duration-200 ${
                  questionType === type
                    ? 'bg-[#000000] border-[#000000] text-white'
                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                } ${isCommunication ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Case Context Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1.5 h-6 bg-[#D62027] rounded-full" />
          <label className="text-sm font-black text-[#000000] uppercase tracking-widest">
            Case / Scenario Context (Optional)
          </label>
        </div>
        <p className="text-xs font-medium text-slate-400 ml-4 pb-2">
          Add a scenario or business narrative if it helps frame the question.
        </p>
        <textarea
          rows={6}
          value={caseContext}
          onChange={(e) => setCaseContext(e.target.value)}
          className={inputClasses}
          placeholder={
            domain.assessmentType === 'Situational Judgment Test'
              ? 'Describe the workplace scenario in detail (optional)...'
              : 'Enter the case or scenario context (optional)...'
          }
        />
        <input
          type="url"
          value={caseContextImageUrl}
          onChange={(e) => setCaseContextImageUrl(e.target.value)}
          className={inputClasses}
          placeholder="Case scenario image URL (optional)"
        />
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer hover:border-slate-300">
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) =>
                handleFileUpload(e.target.files?.[0] ?? null, 'case-context-image', setCaseContextImageUrl)
              }
            />
            {uploadingField === 'case-context-image' ? 'Uploading...' : 'Upload Image'}
          </label>
          <span className="text-[10px] font-semibold text-slate-400">
            Upload to Cloudinary and paste the image URL here.
          </span>
        </div>
        {uploadError?.field === 'case-context-image' && (
          <p className="text-[10px] font-semibold text-[#D62027] ml-1">{uploadError.message}</p>
        )}
      </div>

      {/* Question Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1.5 h-6 bg-[#D62027] rounded-full" />
          <label className="text-sm font-black text-[#000000] uppercase tracking-widest">
            Question Statement
          </label>
        </div>
        <textarea
          required
          rows={3}
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          className={inputClasses}
          placeholder="Write the core question here..."
        />
        <input
          type="url"
          value={questionImageUrl}
          onChange={(e) => setQuestionImageUrl(e.target.value)}
          className={inputClasses}
          placeholder="Question image URL (optional)"
        />
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer hover:border-slate-300">
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) =>
                handleFileUpload(e.target.files?.[0] ?? null, 'question-image', setQuestionImageUrl)
              }
            />
            {uploadingField === 'question-image' ? 'Uploading...' : 'Upload Image'}
          </label>
          <span className="text-[10px] font-semibold text-slate-400">
            Upload to Cloudinary and paste the image URL here.
          </span>
        </div>
        {uploadError?.field === 'question-image' && (
          <p className="text-[10px] font-semibold text-[#D62027] ml-1">{uploadError.message}</p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1.5 h-6 bg-[#D62027] rounded-full" />
          <label className="text-sm font-black text-[#000000] uppercase tracking-widest">
            Source / Outsource Details (Optional)
          </label>
        </div>
        <textarea
          rows={3}
          value={sourceDetails}
          onChange={(e) => setSourceDetails(e.target.value)}
          className={inputClasses}
          placeholder="Provide the source or outsourcing details for this question (optional)..."
        />
      </div>

      {/* Options Section */}
      {questionType === 'mcq' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-6 bg-[#e62727] rounded-full" />
            <label className="text-sm font-black text-[#000000] uppercase tracking-widest">
              Multiple Choice Options
            </label>
          </div>
          <div className="grid gap-4">
            {options.map((opt, idx) => (
              <div key={opt.label} className="space-y-2">
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                    {opt.label}
                  </div>
                  <input
                    type="text"
                    required
                    value={opt.text}
                    onChange={(e) => updateOptionText(idx, e.target.value)}
                    className={`${inputClasses} pl-16`}
                    placeholder={`Option ${opt.label} text`}
                  />
                </div>
                <input
                  type="url"
                  value={opt.imageUrl ?? ''}
                  onChange={(e) => updateOptionImage(idx, e.target.value)}
                  className={inputClasses}
                  placeholder={`Option ${opt.label} image URL (optional)`}
                />
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer hover:border-slate-300">
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) =>
                        handleFileUpload(
                          e.target.files?.[0] ?? null,
                          `option-image-${idx}`,
                          (url) => updateOptionImage(idx, url)
                        )
                      }
                    />
                    {uploadingField === `option-image-${idx}` ? 'Uploading...' : 'Upload Image'}
                  </label>
                  <span className="text-[10px] font-semibold text-slate-400">
                    Upload to Cloudinary and paste the image URL here.
                  </span>
                </div>
                {uploadError?.field === `option-image-${idx}` && (
                  <p className="text-[10px] font-semibold text-[#D62027] ml-1">{uploadError.message}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Core Logic Section (Redux of original select & radios) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Correct Answer */}
        {questionType === 'mcq' && !isWorkspacePsychology && (
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Correct Answer
            </label>
            <div className="flex flex-wrap gap-2">
              {options.map((o) => (
                <button
                  key={o.label}
                  type="button"
                  onClick={() => setCorrectAnswer(o.label)}
                  className={`w-12 h-12 rounded-2xl font-black text-sm transition-all duration-200 border-2 ${
                    correctAnswer === o.label
                      ? 'bg-[#D62027] border-[#D62027] text-white shadow-lg shadow-[#D62027]/20 scale-110'
                      : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {questionType === 'mcq' && isWorkspacePsychology && (
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Option Scores
            </label>
            <div className="grid gap-3">
              {options.map((o, idx) => (
                <div key={o.label} className="flex items-center gap-4">
                  <span className="w-10 text-xs font-black text-slate-400">{o.label}</span>
                  <select
                    value={typeof o.score === 'number' ? o.score : 0}
                    onChange={(e) => updateOptionScore(idx, Number(e.target.value))}
                    className={inputClasses}
                  >
                    {[-1, 0, 0.5, 1].map((score) => (
                      <option key={score} value={score}>
                        {score}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Difficulty Selector */}
        {!isWorkspacePsychology && (
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Setting Difficulty
            </label>
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all duration-200 ${
                    difficulty === d
                      ? 'bg-[#000000] border-[#000000] text-white'
                      : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Estimated Time */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Estimated Time (Minutes)
          </label>
          <input
            type="number"
            min={0.1}
            max={240}
            step={0.1}
            value={estimatedTimeMinutes}
            onChange={(e) => setEstimatedTimeMinutes(Number(e.target.value))}
            className={inputClasses}
            placeholder="e.g. 2.5"
            required
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 mt-10 border-t border-slate-100">
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:flex-1 rounded-[1.25rem] bg-[#D62027] py-5 text-sm font-black text-white uppercase tracking-widest shadow-xl shadow-[#D62027]/10 hover:bg-[#cc1f1f] transition-all active:scale-[0.98] flex items-center justify-center gap-3"
        >
          {loading ? (
            'Processing...'
          ) : (
            <>
              <span>Submit for Review</span>
              <CheckCircle2 className="w-4 h-4" />
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto sm:px-10 rounded-[1.25rem] bg-white border border-slate-200 text-slate-400 text-sm font-black uppercase tracking-widest py-5 hover:bg-slate-50 transition-all"
        >
          Cancel
        </button>
      </div>
      </form>
    </div>
  );
}
