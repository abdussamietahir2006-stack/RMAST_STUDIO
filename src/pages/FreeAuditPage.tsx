import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Clock, FileImage, ShieldCheck } from 'lucide-react';
import { AuditForm } from '../components/audit/AuditForm';
import { AuditPoster, POSTER_H, POSTER_W } from '../components/audit/AuditPoster';
import { AuditResultView } from '../components/audit/AuditResultView';
import { computeAudit, type AuditResult } from '../data/audit/scoring';
import type { AuditAnswers } from '../data/audit/questions';
import { submitAudit } from '../lib/api';

const AUDIT_CHECKS = [
  'Your social media and content',
  'Your website and how it turns visitors into enquiries',
  'How fast your leads get a first reply',
  'Your follow-up, admin and past clients'
];

const ANALYSING_STEPS = ['Checking your content…', 'Checking your website and lead response…', 'Checking your follow-up and admin…', 'Building your audit…'];
const MIN_ANALYSING_MS = 1600;

// The image's font (Plus Jakarta Sans, the site font) inlined as data URLs. html-to-image can't read the
// Google Fonts stylesheet itself (it's on another domain), so it is fetched here and handed over.
const FONT_CSS_URL = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap';
let fontCssPromise: Promise<string> | null = null;
function posterFontCss(): Promise<string> {
  fontCssPromise ??= (async () => {
    const css = await (await fetch(FONT_CSS_URL)).text();
    // Keep the Latin subsets only (covers every character the audit uses)
    const blocks = css.split(/(?=\/\* )/).filter((b) => /^\/\* latin(-ext)? \*\//.test(b));
    const inlined = await Promise.all(
      blocks.map(async (block) => {
        const url = /url\((https:[^)]+)\)/.exec(block)?.[1];
        if (!url) return block;
        const blob = await (await fetch(url)).blob();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        return block.replace(url, dataUrl);
      })
    );
    return inlined.join('\n');
  })().catch((err) => {
    fontCssPromise = null;
    throw err;
  });
  return fontCssPromise;
}

type Phase = 'form' | 'analysing' | 'result';

interface Generated {
  answers: AuditAnswers;
  result: AuditResult;
  date: Date;
  honeypot: string;
}

// Free Audit: a 7-step self-audit that ends with a downloadable audit image (made in the browser)
export const FreeAuditPage: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('form');
  const [audit, setAudit] = useState<Generated | null>(null);
  const [png, setPng] = useState<string | null>(null);
  const [pngFailed, setPngFailed] = useState(false);
  const [auditToken, setAuditToken] = useState<string | null>(null);
  const [message, setMessage] = useState(0);
  const posterRef = useRef<HTMLDivElement>(null);
  const startedAt = useRef(0);
  const captured = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);

  const start = (answers: AuditAnswers, honeypot: string) => {
    captured.current = false;
    startedAt.current = Date.now();
    setPng(null);
    setPngFailed(false);
    setAuditToken(null);
    setAudit({ answers, result: computeAudit(answers), date: new Date(), honeypot });
    setPhase('analysing');
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Purely visual progress messages while the image is made
  useEffect(() => {
    if (phase !== 'analysing') return;
    setMessage(0);
    const timer = window.setInterval(() => setMessage((m) => Math.min(m + 1, ANALYSING_STEPS.length - 1)), MIN_ANALYSING_MS / ANALYSING_STEPS.length);
    return () => window.clearInterval(timer);
  }, [phase]);

  // Once the hidden 1080x1920 page has fitted its text: export it, show the result, then save it in the background
  const capture = useCallback(async () => {
    if (captured.current || !posterRef.current || !audit) return;
    captured.current = true;
    const node = posterRef.current;
    let big: string | null = null;
    let small: string | null = null;
    try {
      await document.fonts.ready;
      const { toPng } = await import('html-to-image');
      // If the font can't be fetched, the image still renders (with a fallback font)
      const fontEmbedCSS = await posterFontCss().catch(() => '');
      const options = { width: POSTER_W, height: POSTER_H, fontEmbedCSS, backgroundColor: '#F3E7D3' };
      big = await toPng(node, { ...options, pixelRatio: 2 }); // 2160 x 3840 for download and sharing
      small = await toPng(node, { ...options, pixelRatio: 1 }); // 1080 x 1920 for the email and dashboard
    } catch (err) {
      console.error('Could not create the audit image', err);
      setPngFailed(true);
    }
    const wait = MIN_ANALYSING_MS - (Date.now() - startedAt.current);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    setPng(big);
    setPhase('result');

    // Saving and emailing happen quietly: if they fail, the visitor still has their audit
    try {
      const res = await submitAudit({
        answers: audit.answers,
        png: small,
        pageUrl: window.location.href,
        referrer: document.referrer,
        fax: audit.honeypot
      });
      if (res.token) setAuditToken(res.token);
    } catch (err) {
      console.error('Could not save the audit', err);
    }
  }, [audit]);

  return (
    <div ref={topRef} className="pt-30 pb-24 px-4 sm:px-6 scroll-mt-24">
      <div className="max-w-site mx-auto">
        {phase === 'form' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <section className="lg:col-span-5 space-y-8">
              <div className="space-y-6">
                <span className="text-xs font-mono uppercase tracking-[0.25em] text-brand">Free audit</span>
                <h1 className="type-h1 text-fg">See what’s costing you leads, free.</h1>
                <p className="text-base sm:text-lg text-muted leading-relaxed">
                  Answer a few quick questions about your business. You get a one-page audit straight away, showing what to fix first.
                </p>
              </div>
              <div className="p-6 bg-surface border border-line rounded-card space-y-4">
                <h2 className="type-h4 text-fg">What we check</h2>
                <ul className="space-y-3 text-base text-muted">
                  {AUDIT_CHECKS.map((c) => (
                    <li key={c} className="flex items-start gap-3">
                      <Check aria-hidden="true" className="w-5 h-5 mt-0.5 text-brand shrink-0" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <ul className="space-y-3 text-sm text-muted">
                <li className="flex items-center gap-3">
                  <Clock aria-hidden="true" className="w-4 h-4 text-brand" /> About 3 minutes, mostly tapping
                </li>
                <li className="flex items-center gap-3">
                  <FileImage aria-hidden="true" className="w-4 h-4 text-brand" /> Your audit as an image you can download and share
                </li>
                <li className="flex items-center gap-3">
                  <ShieldCheck aria-hidden="true" className="w-4 h-4 text-brand" /> Free, with no obligation
                </li>
              </ul>
            </section>
            <div className="lg:col-span-7">
              <AuditForm onComplete={start} />
            </div>
          </div>
        )}

        {phase === 'analysing' && (
          <section className="max-w-xl mx-auto py-16 text-center space-y-6" role="status" aria-live="polite">
            <h1 className="type-h2 text-fg">Analysing your business…</h1>
            <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
              <div className="h-full bg-primary rounded-full audit-progress" />
            </div>
            <p className="text-muted">{ANALYSING_STEPS[message]}</p>
          </section>
        )}

        {phase === 'result' && audit && (
          <AuditResultView
            answers={audit.answers}
            result={audit.result}
            png={png}
            pngFailed={pngFailed}
            auditToken={auditToken}
            onRestart={() => {
              setPhase('form');
              setAudit(null);
            }}
          />
        )}
      </div>

      {/* The audit page the image is made from: full size, off screen, hidden from assistive tech */}
      {audit && phase !== 'form' && !png && !pngFailed && (
        <div aria-hidden="true" style={{ position: 'fixed', left: -12000, top: 0, pointerEvents: 'none' }}>
          <AuditPoster ref={posterRef} answers={audit.answers} result={audit.result} date={audit.date} onFitted={capture} />
        </div>
      )}
    </div>
  );
};
