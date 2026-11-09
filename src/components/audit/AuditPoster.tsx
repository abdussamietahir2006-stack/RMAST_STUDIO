import React, { forwardRef, useLayoutEffect, useRef, useState } from 'react';
import type { AuditAnswers } from '../../data/audit/questions';
import { PILLARS, richParts, scoreBand, type AuditResult, type ScoreBand } from '../../data/audit/scoring';
import { mainHandle } from '../../data/audit/validate';
import type { AssistantId } from '../../data/assistantsData';

// The audit image: exactly 1080 x 1920 (phone portrait), exported at 2x for a sharp 2160 x 3840 PNG.
// Colours and font match the website (Mediterranean Villa palette, Plus Jakarta Sans).
export const POSTER_W = 1080;
export const POSTER_H = 1920;

const C = {
  teal: '#0F4C4A',
  tealDeep: '#0C3B39',
  coral: '#E86A4A',
  coralLight: '#F6957A',
  sand: '#F3E7D3',
  card: '#FBF5EB',
  line: '#E3D3B8',
  track: '#EADBC2',
  ink: '#1A1A1A',
  body: '#2D2A26',
  muted: '#655F57',
  sandMuted: '#C9DAD5'
};

// Score colours: red < 40, amber 40-69, green 70+
const BAND: Record<ScoreBand, string> = { low: '#E5484D', mid: '#E0A23B', high: '#3FB59F' };
const PILL: Record<AssistantId, { bg: string; fg: string }> = {
  technical: { bg: C.teal, fg: C.sand },
  creative: { bg: C.coral, fg: C.ink },
  virtual: { bg: '#C8963E', fg: C.ink }
};

// Text sizes step down until everything fits in 1920 px (never below 22 px)
const SCALES = [1, 0.95, 0.9, 0.86, 0.82];

const Rich: React.FC<{ text: string; strongColor?: string }> = ({ text, strongColor }) => (
  <>
    {richParts(text).map((p, i) =>
      p.bold ? (
        <strong key={i} style={{ fontWeight: 700, color: strongColor }}>
          {p.text}
        </strong>
      ) : (
        <React.Fragment key={i}>{p.text}</React.Fragment>
      )
    )}
  </>
);

interface Props {
  answers: AuditAnswers;
  result: AuditResult;
  date: Date;
  onFitted?: () => void;
}

export const AuditPoster = forwardRef<HTMLDivElement, Props>(({ answers, result, date, onFitted }, ref) => {
  const [scaleIndex, setScaleIndex] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const s = SCALES[scaleIndex];
  const px = (n: number, min = 22) => `${Math.max(min, Math.round(n * s))}px`;

  // Measure after layout; shrink one step at a time if the content is taller than the image
  useLayoutEffect(() => {
    const height = contentRef.current?.scrollHeight ?? 0;
    // Recorded on the element so the fit can be checked (content must be <= 1920)
    if (contentRef.current) contentRef.current.dataset.contentHeight = String(height);
    if (height > POSTER_H && scaleIndex < SCALES.length - 1) setScaleIndex(scaleIndex + 1);
    else onFitted?.();
  }, [scaleIndex, onFitted]);

  const band = scoreBand(result.overall);
  const ring = { size: 230, stroke: 18 };
  const radius = (ring.size - ring.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const mainName = PILLARS[result.main].name;
  const tag = ['FREE AUDIT', answers.businessName, answers.city].filter(Boolean).join(' · ').toUpperCase();
  const checked = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const gap = px(22, 14);

  return (
    <div
      ref={ref}
      style={{
        width: POSTER_W,
        height: POSTER_H,
        background: C.sand,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        color: C.body,
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      <div
        ref={contentRef}
        style={{ padding: `${px(44, 32)} ${px(48, 36)}`, display: 'flex', flexDirection: 'column', gap, boxSizing: 'border-box', minHeight: POSTER_H }}
      >
        {/* 1. Header */}
        <div style={{ background: C.teal, borderRadius: 32, padding: px(44, 32), color: C.sand }}>
          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: px(22), fontWeight: 700, letterSpacing: '0.12em', color: C.coralLight, marginBottom: px(18, 12) }}>{tag}</div>
              <div style={{ fontSize: px(70, 52), fontWeight: 700, lineHeight: 1.02, letterSpacing: '-0.03em', textTransform: 'uppercase' }}>
                <div>{result.headline[0]}</div>
                <div style={{ color: C.coralLight }}>{result.headline[1]}</div>
              </div>
            </div>
            <div style={{ position: 'relative', width: ring.size, height: ring.size, flexShrink: 0 }}>
              <svg width={ring.size} height={ring.size} viewBox={`0 0 ${ring.size} ${ring.size}`} aria-hidden="true">
                <circle cx={ring.size / 2} cy={ring.size / 2} r={radius} fill="none" stroke="rgba(243,231,211,0.16)" strokeWidth={ring.stroke} />
                <circle
                  cx={ring.size / 2}
                  cy={ring.size / 2}
                  r={radius}
                  fill="none"
                  stroke={BAND[band]}
                  strokeWidth={ring.stroke}
                  strokeLinecap="round"
                  strokeDasharray={`${(circumference * result.overall) / 100} ${circumference}`}
                  transform={`rotate(-90 ${ring.size / 2} ${ring.size / 2})`}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.03em' }}>{result.overall}</div>
                <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '0.1em', color: C.sandMuted, marginTop: 6 }}>OUT OF 100</div>
              </div>
            </div>
          </div>
          <p style={{ margin: `${px(24, 16)} 0 0`, fontSize: px(27), lineHeight: 1.4, color: C.sandMuted }}>
            <Rich text={result.summary} strongColor={C.sand} />
          </p>
        </div>

        {/* 2. Area cards */}
        {result.cards.map((card) => {
          const cardBand = scoreBand(card.score * 10);
          return (
            <div key={card.id} style={{ background: C.card, border: `2px solid ${C.line}`, borderRadius: 24, padding: `${px(30, 22)} ${px(34, 26)}` }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ fontSize: px(34, 28), fontWeight: 700, color: C.teal, letterSpacing: '-0.01em' }}>{card.title}</div>
                <div style={{ fontSize: px(32, 26), fontWeight: 700, color: C.teal }}>
                  {card.score}
                  <span style={{ fontSize: px(24), color: C.muted, fontWeight: 600 }}>/10</span>
                </div>
              </div>
              <div style={{ height: 12, background: C.track, borderRadius: 999, margin: `${px(14, 10)} 0 ${px(18, 12)}`, overflow: 'hidden' }}>
                <div style={{ width: `${Math.max(4, card.score * 10)}%`, height: '100%', background: BAND[cardBand], borderRadius: 999 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: px(12, 8), fontSize: px(25), lineHeight: 1.36 }}>
                <Row label="PROBLEM" size={px(22)}>
                  <Rich text={card.problem} strongColor={C.teal} />
                </Row>
                <Row label="COSTS YOU" size={px(22)}>
                  {card.costs}
                </Row>
                <Row label="WE FIX IT" size={px(22)}>
                  <span
                    style={{
                      display: 'inline-block',
                      background: PILL[result.main].bg,
                      color: PILL[result.main].fg,
                      fontSize: px(22),
                      fontWeight: 700,
                      padding: '2px 14px',
                      borderRadius: 999,
                      marginRight: 10,
                      lineHeight: 1.45
                    }}
                  >
                    {mainName}
                  </span>
                  {card.fix}
                </Row>
              </div>
            </div>
          );
        })}

        {/* 3. Call to action */}
        <div style={{ background: C.coral, color: C.ink, borderRadius: 24, padding: `${px(26, 20)} ${px(34, 26)}`, fontSize: px(29, 24), fontWeight: 700, lineHeight: 1.3 }}>
          {result.cta}
        </div>

        {/* 4. We can also help with */}
        <div style={{ padding: `0 ${px(8, 4)}` }}>
          <div style={{ fontSize: px(22), fontWeight: 700, letterSpacing: '0.12em', color: C.teal, marginBottom: px(10, 6) }}>WE CAN ALSO HELP WITH</div>
          {result.also.map((line) => (
            <p key={line.assistant} style={{ margin: `${px(6, 4)} 0 0`, fontSize: px(25), lineHeight: 1.36 }}>
              <strong style={{ color: C.teal, fontWeight: 700 }}>{PILLARS[line.assistant].name}:</strong> <Rich text={line.text} strongColor={C.teal} />
            </p>
          ))}
        </div>

        {/* 5. Footer */}
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 20,
            borderTop: `2px solid ${C.line}`,
            paddingTop: px(18, 12),
            fontSize: px(22),
            color: C.muted
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {mainHandle(answers)} · checked {checked}
          </span>
          <span style={{ fontWeight: 700, letterSpacing: '0.18em', color: C.teal, whiteSpace: 'nowrap' }}>
            RMAST <span style={{ color: C.coral, fontWeight: 700, letterSpacing: '0.08em' }}>STUDIO</span>
          </span>
        </div>
      </div>
    </div>
  );
});
AuditPoster.displayName = 'AuditPoster';

const Row: React.FC<{ label: string; size: string; children: React.ReactNode }> = ({ label, size, children }) => (
  <div>
    <span style={{ fontSize: size, fontWeight: 700, letterSpacing: '0.1em', color: C.muted, marginRight: 12 }}>{label}</span>
    {children}
  </div>
);
