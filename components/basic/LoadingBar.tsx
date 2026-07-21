'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const lastPathnameRef = useRef(pathname);

  useEffect(() => {
    const hasPathChanged = pathname !== lastPathnameRef.current;
    lastPathnameRef.current = pathname;

    if (!hasPathChanged) return;

    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 0.6, 
            ease: "circOut"
          }}
          style={{ originX: 0 }}
          className="fixed top-0 left-0 right-0 h-[3px] bg-linear-to-r from-[#D62027] via-[#ef4444] to-[#f87171] z-9999 shadow-[0_0_10px_rgba(214,32,39,0.5)]"
        />
      )}
    </AnimatePresence>
  );
}
