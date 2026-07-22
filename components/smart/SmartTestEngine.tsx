'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, Timer, Award, ArrowRight, Flag, Check, Lock, CheckCircle2, User } from 'lucide-react';
import { SMART_QUESTIONS, ISmartQuestion } from '@/lib/smart-questions';

interface SmartTestEngineProps {
  sessionId: string;
  candidateInfo?: {
    fullName: string;
    email: string;
    phone?: string;
    age?: number;
    gender?: string;
  } | null;
  onSubmitTest: (answers: Array<{ questionId: string; studentAnswer: any; timeSpentSeconds: number }>) => void;
}

const DOMAIN_ORDER = [
  'computational-thinking',
  'programming-fundamentals',
  'frontend-engineering',
  'backend-engineering',
  'database-engineering',
  'debugging-quality',
  'system-design',
  'ai-augmented'
];

const DOMAIN_NAMES: Record<string, string> = {
  'computational-thinking': 'Computational Thinking',
  'programming-fundamentals': 'Programming Fundamentals',
  'frontend-engineering': 'Frontend Engineering',
  'backend-engineering': 'Backend Engineering',
  'database-engineering': 'Database Engineering',
  'debugging-quality': 'Debugging & Quality Engineering',
  'system-design': 'System Design & Architecture',
  'ai-augmented': 'AI-Augmented Engineering',
};

const TIMERS: Record<string, number> = {
  'easy': 60,
  'medium': 90,
  'hard': 120
};

export default function SmartTestEngine({ sessionId, candidateInfo, onSubmitTest }: SmartTestEngineProps) {
  // CAT-state
  const [currentDomainIdx, setCurrentDomainIdx] = useState(0);
  const [currentQuestInDomain, setCurrentQuestInDomain] = useState(1); // 1 or 2
  const [answersAccumulator, setAnswersAccumulator] = useState<Array<{
    questionId: string;
    studentAnswer: any;
    timeSpentSeconds: number;
    isCorrect: boolean;
  }>>([]);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});

  const toggleFlagged = () => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [totalQuestionsDone]: !prev[totalQuestionsDone],
    }));
  };

  // Active question state
  const [currentQuestion, setCurrentQuestion] = useState<ISmartQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>(''); // For MCQ
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]); // For MAQ
  const [clickedCoords, setClickedCoords] = useState<{ x: number; y: number } | null>(null); // For Touchboard
  const [oralTranscript, setOralTranscript] = useState<string>(''); // For Oral
  
  // Timers & metrics
  const [timeLeft, setTimeLeft] = useState(90);
  const [questionTimeSpent, setQuestionTimeSpent] = useState(0);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingAvailable, setRecordingAvailable] = useState(false);
  const [recognitionError, setRecognitionError] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const submittedRef = useRef(false);

  // Load question dynamically based on CAT-style adaptive path
  useEffect(() => {
    if (currentDomainIdx >= DOMAIN_ORDER.length) {
      if (submittedRef.current) return;
      submittedRef.current = true;
      const finalPayload = answersAccumulator.map((ans) => ({
        questionId: ans.questionId,
        studentAnswer: ans.studentAnswer,
        timeSpentSeconds: ans.timeSpentSeconds
      }));
      onSubmitTest(finalPayload);
      return;
    }

    const domainId = DOMAIN_ORDER[currentDomainIdx];
    let difficulty: 'easy' | 'medium' | 'hard' = 'medium';

    if (currentQuestInDomain === 2) {
      const prevAnswer = answersAccumulator.find(
        (ans) => {
          const q = SMART_QUESTIONS.find((item) => item.id === ans.questionId);
          return q?.domainId === domainId;
        }
      );
      if (prevAnswer && prevAnswer.isCorrect) {
        difficulty = 'hard';
      } else {
        difficulty = 'easy';
      }
    }

    const matchedQ = SMART_QUESTIONS.find(
      (item) => item.domainId === domainId && item.difficulty === difficulty
    ) || SMART_QUESTIONS.find((item) => item.domainId === domainId); // fallback

    if (matchedQ) {
      setCurrentQuestion(matchedQ);
      setTimeLeft(TIMERS[matchedQ.difficulty] || 90);
      setQuestionTimeSpent(0);
      
      // Reset inputs
      setSelectedOption('');
      setSelectedOptions([]);
      setClickedCoords(null);
      setOralTranscript('');
      setRecordingAvailable(false);
    }
  }, [currentDomainIdx, currentQuestInDomain, answersAccumulator, onSubmitTest]);

  // Handle Question level countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleNext();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
      setQuestionTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Speech Recognition API setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setOralTranscript(transcript);
        };

        recognition.onerror = (event: any) => {
          if (event.error === 'network') {
            console.warn('Speech recognition network warning: Google recognition servers unreachable.');
            setRecognitionError('Speech recognition service offline. Please type your answer directly in the editor.');
          } else {
            console.error('Speech recognition error:', event.error);
            setRecognitionError('Microphone transcription failed. Please type your answer directly in the editor.');
          }
          stopRecording();
        };

        recognitionRef.current = recognition;
      } else {
        setRecognitionError('Speech-to-text not supported in this browser. Please type your response.');
      }
    }
  }, []);

  // Clean up media streams
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Web Audio Waveform visualizer
  const startRecording = async () => {
    setRecognitionError('');
    setOralTranscript('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      if (recognitionRef.current) {
        recognitionRef.current.start();
      }

      setIsRecording(true);
      setRecordingAvailable(true);

      // Web Audio setup
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);

      drawWaveform();
    } catch (err) {
      console.error('Mic permission denied:', err);
      setRecognitionError('Microphone access denied. Please allow permissions or type below.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsRecording(false);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const width = canvas.width;
    const height = canvas.height;

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      // Light background for waveforms
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 3;
      ctx.strokeStyle = '#2563eb'; // Royal/Electric blue wave
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();
    };

    draw();
  };

  // Convert SVG static backgrounds dynamically for light theme
  const getLightThemedSVG = (svgString: string) => {
    if (!svgString) return '';
    return svgString
      .replaceAll('background:#0b0f19', 'background:#ffffff')
      .replaceAll('border: 2px solid #1e293b', 'border: 2px solid #e2e8f0')
      .replaceAll('fill="#0b0f19"', 'fill="#ffffff"')
      .replaceAll('fill="#1e293b"', 'fill="#f8fafc"')
      .replaceAll('stroke="#3b82f6"', 'stroke="#2563eb"')
      .replaceAll('stroke="#475569"', 'stroke="#cbd5e1"')
      .replaceAll('fill="#fff"', 'fill="#0f172a"')
      .replaceAll('fill="#64748b"', 'fill="#475569"')
      .replaceAll('fill="#94a3b8"', 'fill="#334155"')
      .replaceAll('fill="#ef4444"', 'fill="#dc2626"')
      .replaceAll('fill-opacity="0.08"', 'fill-opacity="0.04"')
      .replaceAll('stroke-opacity="0.2"', 'stroke-opacity="0.1"')
      .replaceAll('fill="#f87171"', 'fill="#b91c1c"');
  };

  // Evaluate answer correctness locally to drive CAT adaptive difficulty
  const checkAnswerCorrectness = (q: ISmartQuestion, ans: any): boolean => {
    if (!q) return false;
    const correct = q.correctAnswer;

    if (q.questionType === 'mcq') {
      return String(ans).trim().toLowerCase() === String(correct).trim().toLowerCase();
    }
    
    if (q.questionType === 'maq') {
      if (Array.isArray(ans) && Array.isArray(correct)) {
        const sSet = new Set(ans.map(v => String(v).trim().toLowerCase()));
        const cSet = new Set(correct.map(v => String(v).trim().toLowerCase()));
        return sSet.size === cSet.size && [...sSet].every((val) => cSet.has(val));
      }
    }

    if (q.questionType === 'touchboard') {
      if (ans && typeof ans.x === 'number' && typeof ans.y === 'number') {
        const { x, y } = ans;
        const { xMin, xMax, yMin, yMax } = correct;
        return x >= xMin && x <= xMax && y >= yMin && y <= yMax;
      }
    }

    if (q.questionType === 'oral') {
      const transcript = String(ans || '').toLowerCase();
      if (Array.isArray(correct)) {
        const matches = correct.filter((keyword) => transcript.includes(keyword.toLowerCase()));
        return matches.length >= 2;
      }
    }

    return false;
  };

  // Transition to next question
  const handleNext = () => {
    if (!currentQuestion) return;

    if (isRecording) {
      stopRecording();
    }

    let studentAnswer: any = null;
    if (currentQuestion.questionType === 'mcq') {
      studentAnswer = selectedOption;
    } else if (currentQuestion.questionType === 'maq') {
      studentAnswer = selectedOptions;
    } else if (currentQuestion.questionType === 'touchboard') {
      studentAnswer = clickedCoords;
    } else if (currentQuestion.questionType === 'oral') {
      studentAnswer = oralTranscript;
    }

    const isCorrect = checkAnswerCorrectness(currentQuestion, studentAnswer);

    const answeredItem = {
      questionId: currentQuestion.id,
      studentAnswer,
      timeSpentSeconds: questionTimeSpent,
      isCorrect
    };

    setAnswersAccumulator((prev) => [...prev, answeredItem]);

    if (currentQuestInDomain === 1) {
      setCurrentQuestInDomain(2);
    } else {
      setCurrentQuestInDomain(1);
      setCurrentDomainIdx((prev) => prev + 1);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="w-full max-w-lg mx-auto bg-white border border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-500 text-sm font-semibold">Configuring adaptive test questions...</p>
      </div>
    );
  }

  const totalQuestionsDone = answersAccumulator.length;
  const progressPercent = Math.round((totalQuestionsDone / 16) * 100);

  return (
    <div className="w-full pt-1 pb-6 text-slate-800 font-sans">
      {/* Top Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img src="/sona__1_-removebg-preview.png" alt="Sona Logo" className="h-6 object-contain" />
            <div className="w-px h-4 bg-slate-200"></div>
            <img src="/Scale Logo High Res (1).png" alt="Scale Logo" className="h-6 object-contain" />
            <div className="w-px h-4 bg-slate-200"></div>
            <img src="/SMART_Logo_New__1_-removebg-preview.png" alt="SMART Logo" className="h-8 object-contain" />
          </div>
          <div className="w-px h-6 bg-slate-200 hidden md:block"></div>
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-900 text-sm tracking-tight uppercase">SDE Assessment</span>
            <span className="hidden md:inline text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
              v1.0
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-slate-600">
          <div className="hidden sm:flex items-center gap-2 border-r border-slate-200 pr-6">
            <User className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-700">{candidateInfo?.fullName || 'Demo Candidate'}</span>
            <span className="text-slate-400 text-xs font-normal">({candidateInfo?.email || 'demo@hiresapien.in'})</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl text-slate-700 font-bold font-mono">
            <Timer className="w-4 h-4 text-slate-500 animate-pulse" />
            <span>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column - Question Panel */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col min-h-[500px]">
          {/* Header Info */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 flex items-center gap-1.5">
                <span className="text-[10px] font-black tracking-wider text-slate-700 uppercase">
                  {DOMAIN_NAMES[currentQuestion.domainId]}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Difficulty: <span className={`font-black ${currentQuestion.difficulty === 'hard' ? 'text-red-500' : currentQuestion.difficulty === 'medium' ? 'text-amber-600' : 'text-emerald-600'}`}>{currentQuestion.difficulty}</span>
              </span>
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Question {totalQuestionsDone + 1} of 16
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-6 border border-slate-200">
            <div 
              className="bg-blue-600 h-full transition-all duration-500 rounded-full" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Question Text */}
          <div className="flex-1">
            <div className="text-base md:text-lg font-bold leading-relaxed mb-8 text-slate-900">
              {currentQuestion.questionText.includes('```') ? (
                <div className="space-y-4">
                  <p>{currentQuestion.questionText.split('```')[0]}</p>
                  <pre className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-xs overflow-x-auto font-mono text-slate-700">
                    <code>
                      {currentQuestion.questionText.split('```')[1]?.replace(/^[a-zA-Z]+\n/, '') || ''}
                    </code>
                  </pre>
                  <p>{currentQuestion.questionText.split('```')[2] || ''}</p>
                </div>
              ) : (
                currentQuestion.questionText
              )}
            </div>

            {/* Answer Layouts based on Question Type */}
            
            {/* MCQ Layout */}
            {currentQuestion.questionType === 'mcq' && currentQuestion.options && (
              <div className="grid grid-cols-1 gap-3.5 mb-8">
                {currentQuestion.options.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => setSelectedOption(opt.label)}
                    className={`w-full text-left p-4.5 rounded-xl border text-sm font-semibold transition-all duration-200 flex items-center gap-4 cursor-pointer ${
                      selectedOption === opt.label
                        ? 'bg-slate-100/70 border-blue-500 text-slate-900 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border transition-all ${
                      selectedOption === opt.label
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-slate-300 text-slate-500'
                    }`}>
                      {opt.label}
                    </span>
                    <span className="flex-1">{opt.text}</span>
                  </button>
                ))}
              </div>
            )}

            {/* MAQ Layout */}
            {currentQuestion.questionType === 'maq' && currentQuestion.options && (
              <div className="grid grid-cols-1 gap-3.5 mb-8">
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-2 ml-1">
                  Select all options that apply:
                </p>
                {currentQuestion.options.map((opt) => {
                  const isSelected = selectedOptions.includes(opt.label);
                  return (
                    <button
                      key={opt.label}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedOptions(selectedOptions.filter((o) => o !== opt.label));
                        } else {
                          setSelectedOptions([...selectedOptions, opt.label]);
                        }
                      }}
                      className={`w-full text-left p-4.5 rounded-xl border text-sm font-semibold transition-all duration-200 flex items-center gap-4 cursor-pointer ${
                        isSelected
                          ? 'bg-slate-100/70 border-blue-500 text-slate-900 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-black border transition-all ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-slate-300 text-slate-500'
                      }`}>
                        {opt.label}
                      </span>
                      <span className="flex-1">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Touch Board Layout */}
            {currentQuestion.questionType === 'touchboard' && currentQuestion.svgData && (
              <div className="mb-8 flex flex-col items-center">
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-3 w-full text-left ml-1">
                  Click/Tap directly on the correct component in the diagram below:
                </p>
                <div className="relative w-full overflow-hidden select-none border border-slate-200 rounded-xl bg-slate-50">
                  <div 
                    className="w-full relative" 
                    dangerouslySetInnerHTML={{ 
                      __html: getLightThemedSVG(currentQuestion.svgData).replace(
                        '<svg ', 
                        '<svg id="touchboard-svg" '
                      ) 
                    }} 
                    onClick={(e: any) => {
                      const svgEl = document.getElementById('touchboard-svg') as any;
                      if (svgEl) {
                        const rect = svgEl.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const clickY = e.clientY - rect.top;
                        const viewX = Math.round((clickX / rect.width) * 500);
                        const viewY = Math.round((clickY / rect.height) * 240);
                        setClickedCoords({ x: viewX, y: viewY });
                      }
                    }}
                  />

                  {/* Pin Indicator */}
                  {clickedCoords && (
                    <div 
                      className="absolute pointer-events-none"
                      style={{
                        left: `calc(${(clickedCoords.x / 500) * 100}% - 8px)`,
                        top: `calc(${(clickedCoords.y / 240) * 100}% - 8px)`,
                      }}
                    >
                      <span className="relative flex h-4 w-4">
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-600 border-2 border-white shadow-sm"></span>
                      </span>
                    </div>
                  )}
                </div>
                
                {clickedCoords && (
                  <p className="text-xs text-slate-500 font-semibold mt-3 self-start ml-1">
                    Selected Coordinates: <span className="font-mono text-blue-600">X: {clickedCoords.x}, Y: {clickedCoords.y}</span>
                  </p>
                )}
              </div>
            )}

            {/* Oral Response Layout */}
            {currentQuestion.questionType === 'oral' && (
              <div className="mb-8 space-y-4">
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider ml-1">
                  Oral response interface:
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col items-center relative overflow-hidden">
                  <canvas 
                    ref={canvasRef} 
                    className="w-full h-16 bg-slate-100 rounded-lg mb-3 border border-slate-200"
                    width={500}
                    height={64}
                  />

                  <div className="flex gap-4 mb-2">
                    {!isRecording ? (
                      <button
                        onClick={startRecording}
                        className="bg-blue-600 hover:bg-blue-700 font-bold text-xs uppercase tracking-wider text-white px-5 py-3 rounded-lg flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                      >
                        <Mic className="w-4 h-4" />
                        Record Answer
                      </button>
                    ) : (
                      <button
                        onClick={stopRecording}
                        className="bg-red-600 hover:bg-red-700 font-bold text-xs uppercase tracking-wider text-white px-5 py-3 rounded-lg flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                      >
                        <MicOff className="w-4 h-4" />
                        Stop Recording
                      </button>
                    )}
                  </div>

                  {recognitionError && (
                    <div className="text-[11px] text-red-600 bg-red-50 border border-red-100 px-4 py-2 rounded-lg flex items-center gap-2 w-full font-semibold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{recognitionError}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-wider text-slate-500 uppercase ml-1">
                    Transcript / Text Reply
                  </label>
                  <textarea
                    value={oralTranscript}
                    onChange={(e) => setOralTranscript(e.target.value)}
                    rows={3}
                    placeholder={currentQuestion.promptPlaceholder || 'Your oral response transcription will appear here... Feel free to type or edit.'}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl p-4 text-sm font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all shadow-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-6">
            <button
              onClick={toggleFlagged}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                flaggedQuestions[totalQuestionsDone]
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Flag className={`w-4 h-4 ${flaggedQuestions[totalQuestionsDone] ? 'fill-amber-600 text-amber-600' : ''}`} />
              <span>{flaggedQuestions[totalQuestionsDone] ? 'Flagged for Review' : 'Flag for Review'}</span>
            </button>

            <button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black tracking-wider uppercase rounded-xl py-3 px-6 shadow-[0_8px_20px_-6px_rgba(37,99,235,0.3)] flex items-center gap-2 hover:gap-3 transition-all duration-300 cursor-pointer"
            >
              <span>{totalQuestionsDone === 15 ? 'Submit Assessment' : 'Next Question'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column - Navigator Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Navigator Sidebar Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                Assessment Navigator
              </h3>
              <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
                {totalQuestionsDone} of 16 Answered
              </p>
            </div>

            {/* Grid of 16 questions */}
            <div className="grid grid-cols-4 gap-2.5">
              {Array.from({ length: 16 }).map((_, idx) => {
                const qNum = idx + 1;
                const isActive = qNum === totalQuestionsDone + 1;
                const isAnswered = qNum < totalQuestionsDone + 1;
                const isFlagged = flaggedQuestions[idx] === true;

                let btnClass = "";
                if (isActive) {
                  btnClass = "bg-blue-600 border-blue-600 text-white font-black";
                } else if (isFlagged) {
                  btnClass = "bg-amber-50 border-amber-300 text-amber-700 font-bold";
                } else if (isAnswered) {
                  btnClass = "bg-blue-50 border-blue-100 text-blue-700 font-bold";
                } else {
                  btnClass = "bg-slate-50 border-slate-200 text-slate-400 font-semibold cursor-not-allowed";
                }

                return (
                  <div
                    key={idx}
                    className={`h-10 rounded-xl border flex items-center justify-center text-xs relative select-none ${btnClass}`}
                  >
                    {isFlagged && (
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                      </div>
                    )}
                    {isAnswered && !isFlagged ? (
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] leading-none opacity-60">Q{qNum}</span>
                        <Check className="w-2.5 h-2.5 text-blue-500 stroke-[3]" />
                      </div>
                    ) : (
                      <span>Q{qNum}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-blue-600 rounded-md"></div>
                <span>Current</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-blue-50 border border-blue-100 rounded-md"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-amber-50 border border-amber-300 rounded-md"></div>
                <span>Flagged</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-slate-50 border border-slate-200 rounded-md"></div>
                <span>Locked</span>
              </div>
            </div>
          </div>

          {/* Competency Progress Area - Segmented Radial Gauge */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col items-center">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 w-full text-left mb-6">
              Competency Progress
            </h3>

            {/* Segmented Conic Gradient circular bar */}
            <div 
              className="relative w-36 h-36 rounded-full flex items-center justify-center overflow-hidden mb-5 transition-all duration-700 ease-out border border-slate-100 shadow-sm"
              style={{
                background: `conic-gradient(#2563eb ${(currentDomainIdx / 8) * 360}deg, #f8fafc ${(currentDomainIdx / 8) * 360}deg)`
              }}
            >
              {/* Radiating thin divider lines to create 8 segments */}
              {Array.from({ length: 8 }).map((_, idx) => (
                <div 
                  key={idx}
                  className="absolute top-0 bottom-0 left-1/2 w-[3px] bg-white origin-center"
                  style={{ transform: `rotate(${idx * 45}deg) translateX(-50%)` }}
                />
              ))}

              {/* Inner cutout to mask center */}
              <div className="absolute inset-[11px] bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                <span className="text-3xl font-black text-slate-900 leading-none">
                  {currentDomainIdx}
                </span>
                <div className="w-8 h-px bg-slate-200 my-1.5"></div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider text-center">
                  of 8 Domains
                </span>
              </div>
            </div>

            {/* Active Domain Info */}
            <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
              <span className="text-[9px] font-black text-slate-600 bg-slate-200 border border-slate-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Current Domain
              </span>
              <p className="text-xs font-black text-slate-800 mt-2">
                {DOMAIN_NAMES[DOMAIN_ORDER[currentDomainIdx]] || 'Assessment Complete'}
              </p>
              {currentDomainIdx < 8 && (
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                  Question {currentQuestInDomain} of 2
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
