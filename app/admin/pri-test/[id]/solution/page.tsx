"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

export default function SolutionPreviewPage() {
  const pathname = usePathname();
  const parts = pathname.split('/');
  const testId = parts[parts.length - 2] || parts[parts.length - 1];
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Helper: parse CSS lab() or lch() functions and convert to `rgb(r,g,b)` string
  function clamp01(v: number) { return Math.max(0, Math.min(1, v)); }
  function labToRgb(L: number, a: number, b: number) {
    // Observer= 2°, Illuminant= D65
    const refX = 95.047, refY = 100.0, refZ = 108.883;
    let y = (L + 16) / 116;
    let x = a / 500 + y;
    let z = y - b / 200;
    const fx = x * x * x > 0.008856 ? x * x * x : (x - 16/116) / 7.787;
    const fy = y * y * y > 0.008856 ? y * y * y : (y - 16/116) / 7.787;
    const fz = z * z * z > 0.008856 ? z * z * z : (z - 16/116) / 7.787;
    let X = refX * fx;
    let Y = refY * fy;
    let Z = refZ * fz;
    // Convert to sRGB
    X = X / 100; Y = Y / 100; Z = Z / 100;
    let r = X *  3.2406 + Y * -1.5372 + Z * -0.4986;
    let g = X * -0.9689 + Y *  1.8758 + Z *  0.0415;
    let bl = X *  0.0557 + Y * -0.2040 + Z *  1.0570;
    const comp = (c: number) => {
      c = clamp01(c);
      return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    };
    r = comp(r); g = comp(g); bl = comp(bl);
    const R = Math.round(Math.max(0, Math.min(255, r * 255)));
    const G = Math.round(Math.max(0, Math.min(255, g * 255)));
    const B = Math.round(Math.max(0, Math.min(255, bl * 255)));
    return `rgb(${R}, ${G}, ${B})`;
  }

  function parseLabFunction(fn: string) {
    // Normalize inside of parentheses
    const inner = fn.substring(fn.indexOf('(') + 1, fn.lastIndexOf(')'));
    // split by commas or whitespace
    const parts = inner.split(/[,\s]+/).map(s => s.trim()).filter(Boolean);
    if (parts.length < 3) return null;
    // L may be percentage
    const Lraw = parts[0].replace('%','');
    const L = parseFloat(Lraw);
    const a = parseFloat(parts[1]);
    const b = parseFloat(parts[2]);
    return labToRgb(L, a, b);
  }

  function parseLchFunction(fn: string) {
    const inner = fn.substring(fn.indexOf('(') + 1, fn.lastIndexOf(')'));
    const parts = inner.split(/[,\s]+/).map(s => s.trim()).filter(Boolean);
    if (parts.length < 3) return null;
    const Lraw = parts[0].replace('%','');
    const L = parseFloat(Lraw);
    const C = parseFloat(parts[1]);
    const H = parseFloat(parts[2]); // degrees
    const a = C * Math.cos(H * Math.PI / 180);
    const b = C * Math.sin(H * Math.PI / 180);
    return labToRgb(L, a, b);
  }

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/pri-tests/${testId}/solution`, { headers: { Authorization: `Bearer ${sessionStorage.getItem('admin_token') || sessionStorage.getItem('auth_token')}` } });
        const json = await res.json();
        if (!res.ok) { setError(json.error || 'Failed to load'); setLoading(false); return; }
        setData(json);
      } catch (e) {
        setError('Network error');
      } finally { setLoading(false); }
    }
    void load();
  }, [testId]);

  async function downloadPdf() {
    if (!contentRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).jsPDF;

      // Ensure all images loaded
      const imgs = Array.from(contentRef.current.querySelectorAll('img')) as HTMLImageElement[];
      await Promise.all(imgs.map(img => new Promise<void>((resolve) => {
        if (img.complete) return resolve();
        img.onload = () => resolve();
        img.onerror = () => resolve();
      })));

      const element = contentRef.current;

      // Clone the content and inline computed color/shadow values onto the clone
      // This avoids mutating the live DOM and ensures html2canvas sees resolved RGB values
      const cloneRoot = element.cloneNode(true) as HTMLElement;
      const offscreen = document.createElement('div');
      offscreen.style.position = 'fixed';
      offscreen.style.left = '-10000px';
      offscreen.style.top = '0';
      offscreen.style.width = `${element.offsetWidth}px`;
      offscreen.style.overflow = 'hidden';
      offscreen.appendChild(cloneRoot);
      document.body.appendChild(offscreen);

      // Wait for images inside the clone to load
      const cloneImgs = Array.from(cloneRoot.querySelectorAll('img')) as HTMLImageElement[];
      await Promise.all(cloneImgs.map(img => new Promise<void>((resolve) => {
        if (img.complete) return resolve();
        img.onload = () => resolve();
        img.onerror = () => resolve();
      })));

      // Collect original and clone nodes in parallel to copy computed styles
      const originalNodes = [element, ...Array.from(element.querySelectorAll<HTMLElement>('*'))] as HTMLElement[];
      const cloneNodes = [cloneRoot, ...Array.from(cloneRoot.querySelectorAll<HTMLElement>('*'))] as HTMLElement[];

      const colorProps = [
        'color', 'background-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
        'outline-color', 'box-shadow', 'text-shadow', 'fill', 'stroke'
      ];

      for (let i = 0; i < originalNodes.length && i < cloneNodes.length; i++) {
        try {
          const orig = originalNodes[i];
          const cloned = cloneNodes[i];
          const cs = window.getComputedStyle(orig as Element);
          colorProps.forEach((prop) => {
            const val = cs.getPropertyValue(prop);
            if (val && val.trim()) {
              let outVal = val;
              try {
                if (val.indexOf('lab(') !== -1) {
                  outVal = outVal.replace(/lab\([^)]*\)/g, (m) => {
                    const parsed = parseLabFunction(m);
                    return parsed || m;
                  });
                }
                if (val.indexOf('lch(') !== -1) {
                  outVal = outVal.replace(/lch\([^)]*\)/g, (m) => {
                    const parsed = parseLchFunction(m);
                    return parsed || m;
                  });
                }
                if (val.indexOf('color(') !== -1) {
                  // Replace color() occurrences with the computed `color` fallback
                  const fallback = cs.getPropertyValue('color') || outVal;
                  outVal = outVal.replace(/color\([^)]*\)/g, fallback);
                }
              } catch (e) {
                // keep original if parsing fails
                outVal = val;
              }
              // Set sanitized value on the clone
              cloned.style.setProperty(prop, outVal, 'important');
            }
          });
        } catch (e) {
          // ignore individual failures and continue
        }
      }

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10; // mm
      const usableWidth = pageWidth - margin * 2;
      let currentY = margin;

      // Iterate over each question card to render individually and avoid slicing across cards
      const cards = Array.from(cloneRoot.querySelectorAll<HTMLElement>('.g360-card')) as HTMLElement[];
      for (let ci = 0; ci < cards.length; ci++) {
        const card = cards[ci];
        // Render the single card to canvas
        const cardCanvas = await html2canvas(card, { scale: 2, useCORS: true, logging: false });
        const cardData = cardCanvas.toDataURL('image/jpeg', 0.95);
        const imgProps = pdf.getImageProperties(cardData);
        const cardHeightMm = (imgProps.height * usableWidth) / imgProps.width;

        const usableHeight = pageHeight - margin * 2;
        if (cardHeightMm <= usableHeight) {
          // If card doesn't fit current page, start a new page
          if (currentY + cardHeightMm > pageHeight - margin) {
            pdf.addPage();
            currentY = margin;
          }
          pdf.addImage(cardData, 'JPEG', margin, currentY, usableWidth, cardHeightMm);
          currentY += cardHeightMm + 4; // small gap
        } else {
          // Card is taller than a single page: slice this card only
          const ratio = cardCanvas.width / usableWidth;
          let pos = 0;
          while (pos < cardCanvas.height) {
            const sliceHeightPx = Math.min(cardCanvas.height - pos, usableHeight * ratio);
            const sliceCanvas = document.createElement('canvas');
            sliceCanvas.width = cardCanvas.width;
            sliceCanvas.height = sliceHeightPx;
            const sctx = sliceCanvas.getContext('2d')!;
            sctx.drawImage(cardCanvas, 0, pos, cardCanvas.width, sliceHeightPx, 0, 0, sliceCanvas.width, sliceCanvas.height);
            const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.95);
            const sliceProps = pdf.getImageProperties(sliceData);
            const sliceHeightMm = (sliceProps.height * usableWidth) / sliceProps.width;
            if (currentY + sliceHeightMm > pageHeight - margin) {
              pdf.addPage();
              currentY = margin;
            }
            pdf.addImage(sliceData, 'JPEG', margin, currentY, usableWidth, sliceHeightMm);
            pos += sliceHeightPx;
            currentY += sliceHeightMm;
            if (pos < cardCanvas.height) { pdf.addPage(); currentY = margin; }
          }
          currentY += 4;
        }
      }

      // Use test title for the filename (sanitized) instead of the raw id
      const sanitizeFilename = (n: string) => {
        if (!n) return 'solution-key';
        // Replace spaces with dashes, remove forbidden chars for filenames, trim length
        const cleaned = n.replace(/\s+/g, '-').replace(/[<>:"/\\|?*]+/g, '').replace(/[^\x20-\x7E-]/g, '');
        return cleaned.substring(0, 120);
      };
      const baseName = sanitizeFilename((data?.bank?.title as string) || 'solution-key');
      pdf.save(`${baseName}.pdf`);

      // Remove offscreen clone
      document.body.removeChild(offscreen);
    } catch (err) {
      console.error('PDF export failed', err);
      alert('Failed to generate PDF');
    }
  }

  if (loading) return <div className="p-6">Loading solution key...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-8 max-w-8xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black">Solution Key — {data?.bank?.title}</h1>
          <p className="text-sm text-zinc-500">Program: {data?.bank?.program}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.history.back()} className="rounded-xl border px-4 py-2">Back</button>
          <button onClick={downloadPdf} className="rounded-xl bg-[#D62027] text-white px-4 py-2">Download PDF</button>
        </div>
      </div>

      <div ref={contentRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data?.solutionKey?.map((q: any, idx: number) => (
          <div key={q.questionId} className="g360-card no-hover p-6 md:p-8 w-full">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{q.domain || 'General'} / {q.subSkill || '—'}</p>
                <p className="text-lg font-black text-zinc-900">Question {idx + 1}</p>
              </div>
              <div className="text-sm text-zinc-500">Answer Key</div>
            </div>

            {q.caseContext && (
              <div className="mb-4 rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-4">
                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Case Study</p>
                {q.caseContextImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={q.caseContextImageUrl} alt="Case context" className="mb-3 max-h-48 rounded-lg object-contain" />
                )}
                <p className="text-sm text-zinc-700 whitespace-pre-wrap">{q.caseContext}</p>
              </div>
            )}

            {q.questionImageUrl && !q.caseContext && (
              <div className="mb-4">
                <img src={q.questionImageUrl} alt="Question" className="max-h-48 rounded-xl object-contain border border-zinc-200" />
              </div>
            )}

            <div className="mb-4">
              <p className="text-sm font-semibold text-zinc-900">{q.questionText}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Array.isArray(q.options) && q.options.map((opt: any) => {
                const isCorrectOption = opt.label === q.correctAnswer;
                const optClass = isCorrectOption
                  ? 'rounded-lg border px-2.5 py-1.5 text-xs leading-relaxed border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'rounded-lg border px-2.5 py-1.5 text-xs leading-relaxed border-zinc-200 bg-white text-zinc-700';
                return (
                  <div key={opt.label} className={optClass}>
                    <span className="mr-1.5 font-black">{opt.label}.</span>
                    <span>{opt.text}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4">
              <span className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-emerald-600 text-white font-black text-sm leading-none">Correct: {q.correctAnswer}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
