import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { testData, Option } from '@/lib/psychometric/questions';
import { Clock, Target, ArrowRight, AlertTriangle } from 'lucide-react';

interface TestRunnerProps {
  onComplete: (results: Record<string, number>) => void;
  onTerminate: () => void;
}

export function TestRunner({ onComplete, onTerminate }: TestRunnerProps) {
  const [currentTraitIndex, setCurrentTraitIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [scores, setScores] = useState<Record<string, number>>({});
  const scoresRef = useRef<Record<string, number>>({});
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [violationCount, setViolationCount] = useState(0);

  const currentTrait = testData[currentTraitIndex];
  const currentQuestion = currentTrait.questions[currentQuestionIndex];

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    scoresRef.current = scores;
  }, [scores]);

  useEffect(() => {
    const elem = document.documentElement;
    const requestFS = () => {
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch((err) => {
          console.warn(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      }
    };
    
    requestFS();

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        setViolationCount(prev => {
          const newCount = prev + 1;
          if (newCount >= 5) {
            onTerminate();
          }
          return newCount;
        });
      } else {
        setIsFullscreen(true);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [onTerminate]);

  useEffect(() => {
    setTimeLeft(30);
    setSelectedOption(null);
  }, [currentTraitIndex, currentQuestionIndex]);

  useEffect(() => {
    if (!isFullscreen) return; // Pause timer if not in fullscreen

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNext(null);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentTraitIndex, currentQuestionIndex, isFullscreen]);

  const handleNext = (option: Option | null) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const score = option ? option.score : -1;
    setScores((prev) => ({
      ...prev,
      [currentTrait.id]: (prev[currentTrait.id] || 0) + score,
    }));

    if (currentQuestionIndex < currentTrait.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else if (currentTraitIndex < testData.length - 1) {
      setCurrentTraitIndex((prev) => prev + 1);
      setCurrentQuestionIndex(0);
    } else {
      const finalScores = {
        ...scoresRef.current,
        [currentTrait.id]: (scoresRef.current[currentTrait.id] || 0) + score,
      };
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      onComplete(finalScores);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const requestFullscreenAgain = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => {
        console.warn(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    }
  };

  if (!isFullscreen) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center p-6 font-sans text-white">
        <AlertTriangle className="w-20 h-20 text-[#E13737] mb-6" />
        <h2 className="text-3xl font-display font-bold mb-4 text-center">Full Screen Required</h2>
        <p className="text-gray-400 mb-8 text-center max-w-md">
          You have exited full-screen mode. This is a violation of the test rules. 
          <br /><br />
          <span className="text-[#E13737] font-bold">Warning {violationCount} of 5.</span> 
          <br />If you reach 5 warnings, your test will be terminated.
        </p>
        <button
          onClick={requestFullscreenAgain}
          className="bg-[#E13737] text-white font-display font-bold text-lg px-10 py-4 rounded-full hover:bg-red-700 transition-colors tracking-widest uppercase"
        >
          Return to Full Screen
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-[#0B0F19]">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <div className="text-2xl font-display font-black tracking-tight">
          <span className="text-[#E13737]">Grad</span>360°
        </div>
        
        <div className="hidden md:flex items-center bg-[#F8F9FA] rounded-full p-1 border border-gray-200 shadow-sm">
          {testData.map((trait, idx) => (
            <div
              key={trait.id}
              className={`px-6 py-2 rounded-full text-sm font-bold tracking-widest uppercase transition-colors ${
                idx === currentTraitIndex
                  ? 'bg-white text-[#E13737] shadow-sm'
                  : 'text-[#8A94A6]'
              }`}
            >
              {trait.title.split(' ')[0]}
            </div>
          ))}
        </div>

        <div className="flex items-center bg-[#0B0F19] text-white px-6 py-3 rounded-full shadow-lg">
          <Clock className="w-5 h-5 text-[#E13737] mr-3" />
          <span className="font-display font-bold text-xl tracking-wider">{formatTime(timeLeft)}</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Main Content */}
        <main className="flex-1 p-8 lg:p-16 flex flex-col">
          <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col">
            <div className="inline-flex items-center bg-red-50 text-[#E13737] px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-8 self-start border border-red-100">
              <Target className="w-4 h-4 mr-2" />
              Trait: {currentTrait.title}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-black leading-tight mb-12 text-[#0B0F19]">
                  {currentQuestion.text}
                </h1>

                <div className="space-y-4">
                  {currentQuestion.options.map((option, index) => {
                    const letters = ['A', 'B', 'C', 'D'];
                    const isSelected = selectedOption?.id === option.id;
                    
                    return (
                      <button
                        key={option.id}
                        onClick={() => setSelectedOption(option)}
                        className={`w-full text-left p-6 rounded-3xl border-2 transition-all duration-200 flex items-center group ${
                          isSelected 
                            ? 'border-[#E13737] bg-white shadow-[0_8px_30px_rgba(225,55,55,0.12)]' 
                            : 'border-gray-100 bg-white hover:border-gray-300 hover:shadow-md'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-6 font-display font-bold text-xl transition-colors shrink-0 ${
                          isSelected ? 'bg-[#E13737] text-white' : 'bg-[#F8F9FA] text-[#8A94A6] group-hover:bg-gray-200'
                        }`}>
                          {letters[index]}
                        </div>
                        <span className={`text-xl font-bold ${isSelected ? 'text-[#0B0F19]' : 'text-[#4A5568]'}`}>
                          {option.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-12 flex justify-end items-center pt-8 border-t border-gray-100">
              <button
                onClick={() => handleNext(selectedOption)}
                className={`group flex items-center font-display font-bold text-lg px-10 py-4 rounded-full transition-all duration-200 tracking-widest uppercase ${
                  selectedOption 
                    ? 'bg-[#0B0F19] text-white hover:bg-black shadow-xl' 
                    : 'bg-[#F8F9FA] text-[#8A94A6] hover:bg-gray-200 border border-gray-100'
                }`}
              >
                {selectedOption ? 'Next Question' : 'Skip (-1 Point)'}
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-full lg:w-96 bg-[#F8F9FA] border-l-4 border-[#E13737] p-8 flex flex-col">
          <h2 className="text-2xl font-display font-black text-[#0B0F19] mb-2">Question Navigation</h2>
          <p className="text-[#8A94A6] text-xs font-bold tracking-widest uppercase mb-8">
            Module: {currentTrait.title.split(' ')[0]}
          </p>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center justify-between mb-6 cursor-pointer">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-xl bg-[#E13737] text-white flex items-center justify-center font-display font-bold text-lg mr-4">
                  {currentTrait.title.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-[#0B0F19] uppercase text-sm tracking-wider">{currentTrait.title.split(' ')[0]}</h3>
                  <p className="text-xs text-[#8A94A6] font-bold">1-5</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {[0, 1, 2, 3, 4].map((idx) => {
                let statusClass = "bg-white border-2 border-gray-200 text-[#8A94A6]"; // Pending
                if (idx < currentQuestionIndex) {
                  statusClass = "bg-[#34A853] border-2 border-[#34A853] text-white"; // Answered (Green)
                } else if (idx === currentQuestionIndex) {
                  statusClass = "bg-[#E13737] border-2 border-[#E13737] text-white"; // Current (Red)
                }

                return (
                  <div key={idx} className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-lg ${statusClass}`}>
                    {idx + 1}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-auto">
            <h4 className="text-[#8A94A6] text-xs font-bold tracking-widest uppercase mb-4 text-center">Status Legend</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center text-xs font-bold text-[#0B0F19] uppercase tracking-wider">
                <div className="w-3 h-3 rounded-full bg-[#34A853] mr-2"></div> Answered
              </div>
              <div className="flex items-center text-xs font-bold text-[#0B0F19] uppercase tracking-wider">
                <div className="w-3 h-3 rounded-full border-2 border-gray-300 mr-2"></div> Pending
              </div>
              <div className="flex items-center text-xs font-bold text-[#0B0F19] uppercase tracking-wider">
                <div className="w-3 h-3 rounded-full bg-[#E13737] mr-2"></div> Current
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
