import { motion } from 'framer-motion';
import { ClipboardList } from 'lucide-react';

interface InstructionsPageProps {
  onBegin: () => void;
}

export function InstructionsPage({ onBegin }: InstructionsPageProps) {
  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full flex flex-col items-center"
      >
        <div className="w-20 h-20 bg-[#E13737] rounded-full flex items-center justify-center mb-6">
          <span className="text-white text-3xl font-display font-bold">P1</span>
        </div>
        
        <h2 className="text-[#E13737] text-sm font-bold tracking-[0.3em] uppercase mb-4">
          Phase Deployment Logic
        </h2>
        
        <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-12 text-center">
          Professional Assessment
        </h1>

        <div className="bg-[#151A2A] rounded-[2rem] p-8 md:p-12 w-full mb-12 shadow-2xl border border-white/5">
          <div className="flex items-center text-[#E13737] mb-8">
            <ClipboardList className="w-5 h-5 mr-3" />
            <span className="text-sm font-bold tracking-[0.2em] uppercase">Operational Guidelines</span>
          </div>

          <div className="space-y-6">
            {[
              "This assessment must be taken in full-screen mode. Exiting, minimizing, or switching applications is not permitted.",
              "Advanced proctoring is active: No tab switching, right-clicking, or double-clicking for text selection. Attempting these will trigger a warning.",
              "You will receive a maximum of 5 warnings. On the 5th violation, your test will be automatically terminated.",
              "The SUBMIT button remains disabled until 75% of the test duration has passed. You cannot leave the exam until then.",
              "No malpractice is allowed. Use of external devices or third-party assistance is strictly prohibited.",
              "You have 30 seconds per question. You must answer to proceed and cannot return to previous questions.",
              "Any unauthorized refresh or system manipulation will result in automatic disqualification."
            ].map((text, i) => (
              <div key={i} className="flex items-start">
                <span className="mt-2 mr-4 h-2.5 w-2.5 rounded-full bg-[#E13737] shrink-0" />
                <p className="text-slate-300 text-lg italic leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onBegin}
          className="bg-white text-[#0B0F19] font-display font-bold text-lg px-16 py-5 rounded-full hover:bg-gray-100 transition-colors tracking-widest uppercase"
        >
          Continue
        </button>
      </motion.div>
    </div>
  );
}
