import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl w-full flex flex-col items-center"
      >
        <div className="flex justify-center mb-6">
          <Image src="/grad360.png" alt="grad360" width={240} height={80} style={{ objectFit: 'contain' }} priority />
        </div>
        
        <h2 className="text-[#8A94A6] text-sm md:text-base font-bold tracking-[0.3em] uppercase mb-16 text-center">
          Universal Placement Readiness Protocol
        </h2>

        <div className="grid md:grid-cols-3 gap-6 w-full mb-16">
          <div className="bg-[#F8F9FA] p-8 rounded-[2rem] border border-gray-100">
            <h3 className="text-[#E13737] text-xs font-bold tracking-widest uppercase mb-4">Evaluation Node 1</h3>
            <h4 className="text-2xl font-display font-black text-[#0B0F19] mb-6 leading-tight">Resilience &<br/>Initiative</h4>
            <ul className="space-y-3">
              <li className="flex items-center text-sm font-bold text-[#8A94A6] uppercase tracking-wider">
                <div className="w-2 h-2 rounded-full bg-[#E13737] mr-3"></div> Stress Resilience
              </li>
              <li className="flex items-center text-sm font-bold text-[#8A94A6] uppercase tracking-wider">
                <div className="w-2 h-2 rounded-full bg-[#E13737] mr-3"></div> Grit & Initiative
              </li>
            </ul>
          </div>

          <div className="bg-[#F8F9FA] p-8 rounded-[2rem] border border-gray-100">
            <h3 className="text-[#E13737] text-xs font-bold tracking-widest uppercase mb-4">Evaluation Node 2</h3>
            <h4 className="text-2xl font-display font-black text-[#0B0F19] mb-6 leading-tight">Professional<br/>Spectrum</h4>
            <ul className="space-y-3">
              <li className="flex items-center text-sm font-bold text-[#8A94A6] uppercase tracking-wider">
                <div className="w-2 h-2 rounded-full bg-[#E13737] mr-3"></div> Workplace Etiquette
              </li>
              <li className="flex items-center text-sm font-bold text-[#8A94A6] uppercase tracking-wider">
                <div className="w-2 h-2 rounded-full bg-[#E13737] mr-3"></div> Cultural Adaptability
              </li>
            </ul>
          </div>

          <div className="bg-[#F8F9FA] p-8 rounded-[2rem] border border-gray-100">
            <h3 className="text-[#E13737] text-xs font-bold tracking-widest uppercase mb-4">Evaluation Node 3</h3>
            <h4 className="text-2xl font-display font-black text-[#0B0F19] mb-6 leading-tight">Awareness &<br/>Accountability</h4>
            <ul className="space-y-3">
              <li className="flex items-center text-sm font-bold text-[#8A94A6] uppercase tracking-wider">
                <div className="w-2 h-2 rounded-full bg-[#E13737] mr-3"></div> Accountability
              </li>
            </ul>
          </div>
        </div>

        <button
          onClick={onStart}
          className="group flex items-center bg-[#0B0F19] text-white font-display font-bold text-lg px-12 py-5 rounded-full hover:bg-black transition-colors tracking-widest uppercase"
        >
          Continue
          <ArrowRight className="w-6 h-6 ml-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>
    </div>
  );
}
