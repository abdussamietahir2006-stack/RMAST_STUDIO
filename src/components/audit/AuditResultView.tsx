import React, { useMemo, useState } from 'react';
import { CalendarCheck, Download, RotateCcw, Share2 } from 'lucide-react';
import type { AuditAnswers } from '../../data/audit/questions';
import { PILLARS, richParts, scoreBand, type AuditResult } from '../../data/audit/scoring';
import type { BookingPrefill } from '../../data/records';
import { BookingDialog } from '../booking/BookingDialog';

const Rich: React.FC<{ text: string }> = ({ text }) => (
  <>{richParts(text).map((p, i) => (p.bold ? <strong key={i} className="font-semibold text-fg">{p.text}</strong> : <React.Fragment key={i}>{p.text}</React.Fragment>))}</>
);

const BAND_DOT = { low: 'bg-[#E5484D]', mid: 'bg-[#E0A23B]', high: 'bg-[#3FB59F]' };

interface Props {
  answers: AuditAnswers;
  result: AuditResult;
  png: string | null;
  pngFailed: boolean;
  auditToken: string | null;
  onRestart: () => void;
}

export const AuditResultView: React.FC<Props> = ({ answers, result, png, pngFailed, auditToken, onRestart }) => {
  const [booking, setBooking] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);
  const fileName = `RMAST-free-audit-${answers.businessName.replace(/[^\w-]+/g, '-').slice(0, 40) || 'business'}.png`;
  const mainName = PILLARS[result.main].name;

  const prefill = useMemo<Partial<BookingPrefill>>(
    () => ({
      name: answers.name,
      business: answers.businessName,
      email: answers.email,
      phone: answers.phone,
      role: answers.role,
      country: answers.country,
      city: answers.city,
      mainAssistant: result.main,
      auditToken: auditToken ?? ''
    }),
    [answers, result.main, auditToken]
  );

  // WhatsApp: share the image itself where the phone allows it; otherwise download it and open WhatsApp with a message
  const share = async () => {
    setShareNote(null);
    const text = `My free RMAST Studio audit for ${answers.businessName}: ${result.overall}/100.`;
    try {
      if (png) {
        const blob = await (await fetch(png)).blob();
        const file = new File([blob], fileName, { type: 'image/png' });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: 'My free audit', text });
          return;
        }
        const a = document.createElement('a');
        a.href = png;
        a.download = fileName;
        a.click();
        setShareNote('Your audit image has downloaded. Attach it in WhatsApp.');
      }
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') setShareNote('Sharing didn’t work here. Download the image and share it from your gallery.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
      <section className="lg:col-span-5 space-y-5">
        <span className="text-xs font-mono uppercase tracking-[0.25em] text-brand">Your free audit</span>
        <h1 className="type-h2 text-fg">Here’s your audit, {answers.name.split(' ')[0]}.</h1>
        {png ? (
          <img
            src={png}
            alt={`Audit for ${answers.businessName}: ${result.overall} out of 100. Main focus: ${mainName}. Full text below.`}
            width={1080}
            height={1920}
            className="w-full max-w-[420px] h-auto rounded-card border border-line shadow-xl"
          />
        ) : (
          pngFailed && (
            <p className="p-4 bg-surface border border-line rounded-card text-muted">
              We couldn’t create the image on this device, but your full audit is below.
            </p>
          )
        )}

        <button type="button" onClick={() => setBooking(true)} className="btn btn-primary w-full max-w-[420px] inline-flex items-center justify-center gap-2 cursor-pointer">
          <CalendarCheck aria-hidden="true" className="w-5 h-5" />
          Book a Free Call
        </button>
        {png && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[420px]">
            <a href={png} download={fileName} className="btn btn-secondary inline-flex items-center justify-center gap-2">
              <Download aria-hidden="true" className="w-4 h-4" />
              Download PNG
            </a>
            <button type="button" onClick={share} className="btn btn-secondary inline-flex items-center justify-center gap-2 cursor-pointer">
              <Share2 aria-hidden="true" className="w-4 h-4" />
              Share on WhatsApp
            </button>
          </div>
        )}
        {shareNote && (
          <p className="text-sm text-muted" role="status">
            {shareNote}
          </p>
        )}
        <button type="button" onClick={onRestart} className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg cursor-pointer">
          <RotateCcw aria-hidden="true" className="w-4 h-4" />
          Start a new audit
        </button>
      </section>

      {/* The same audit as text, for screen readers and search engines */}
      <article className="lg:col-span-7 space-y-6" aria-labelledby="audit-text-heading">
        <div className="p-6 sm:p-8 bg-surface border border-line rounded-card space-y-4">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-brand">
            Free audit · {answers.businessName}
            {answers.city ? ` · ${answers.city}` : ''}
          </p>
          <h2 id="audit-text-heading" className="type-h3 text-fg uppercase">
            {result.headline[0]} <span className="text-brand">{result.headline[1]}</span>
          </h2>
          <p className="text-lg">
            <span className="inline-flex items-center gap-2 font-semibold text-fg"><span aria-hidden="true" className={`w-2.5 h-2.5 rounded-full ${BAND_DOT[scoreBand(result.overall)]}`} />{result.overall} out of 100.</span>{' '}
            <span className="text-muted">
              <Rich text={result.summary} />
            </span>
          </p>
          <dl className="grid grid-cols-3 gap-3 pt-2">
            {(Object.keys(PILLARS) as (keyof typeof PILLARS)[]).map((p) => (
              <div key={p} className={`p-3 rounded-btn border ${p === result.main ? 'border-primary bg-primary/5' : 'border-line'}`}>
                <dt className="text-xs text-muted">{PILLARS[p].name}</dt>
                <dd className="text-lg font-semibold text-fg">{result.pillars[p]}/10</dd>
              </div>
            ))}
          </dl>
        </div>

        {result.cards.map((card) => (
          <section key={card.id} className="p-6 bg-surface border border-line rounded-card space-y-3" aria-label={`${card.title}: ${card.score} out of 10`}>
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="type-h4 text-fg">{card.title}</h3>
              <span className="font-semibold text-fg">{card.score}/10</span>
            </div>
            <div className="h-2 rounded-full bg-surface-2 overflow-hidden" aria-hidden="true">
              <div className="h-full bg-primary rounded-full" style={{ width: `${Math.max(4, card.score * 10)}%` }} />
            </div>
            <dl className="space-y-2 text-muted">
              <div>
                <dt className="inline text-xs font-semibold uppercase tracking-wider text-fg mr-2">Problem</dt>
                <dd className="inline">
                  <Rich text={card.problem} />
                </dd>
              </div>
              <div>
                <dt className="inline text-xs font-semibold uppercase tracking-wider text-fg mr-2">Costs you</dt>
                <dd className="inline">{card.costs}</dd>
              </div>
              <div>
                <dt className="inline text-xs font-semibold uppercase tracking-wider text-fg mr-2">We fix it</dt>
                <dd className="inline">
                  <span className="text-fg font-medium">{mainName}:</span> {card.fix}
                </dd>
              </div>
            </dl>
          </section>
        ))}

        <div className="p-6 bg-surface border border-line rounded-card space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-fg">We can also help with</h3>
          {result.also.map((line) => (
            <p key={line.assistant} className="text-muted">
              <strong className="text-fg">{PILLARS[line.assistant].name}:</strong> <Rich text={line.text} />
            </p>
          ))}
        </div>

        <p className="text-fg font-medium">{result.cta}</p>
      </article>

      <BookingDialog open={booking} onClose={() => setBooking(false)} prefill={prefill} />
    </div>
  );
};
