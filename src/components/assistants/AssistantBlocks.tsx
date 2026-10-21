// Building blocks shared by the home page, the Assistant pages, Services, Plans and Free Audit.
// Each Assistant's colour comes from its .svc-* class (see index.css), used as text-svc / bg-svc/10 / border-svc.
import React from 'react';
import {
  ArrowRight,
  CalendarCheck,
  Check,
  ChevronDown,
  ClipboardCheck,
  Clapperboard,
  Filter,
  MessageCircle,
  Zap
} from 'lucide-react';
import { Link } from '../common/Link';
import {
  ASSISTANTS,
  BOOK_CALL_PATH,
  FAQ,
  FREE_AUDIT_PATH,
  LEAD_RESPONSE_STEPS,
  PLANS,
  type Assistant,
  type AssistantId
} from '../../data/assistantsData';

export const ASSISTANT_ICONS: Record<AssistantId, React.ElementType> = {
  technical: Zap,
  creative: Clapperboard,
  virtual: ClipboardCheck
};

const kickerClass = 'text-xs font-mono uppercase tracking-[0.2em] font-semibold';

// Section heading: small label, heading and an optional line of text
export const SectionIntro: React.FC<{
  kicker: string;
  title: string;
  text?: string;
  id?: string;
  accent?: boolean; // label in the surrounding Assistant's colour instead of the brand colour
  center?: boolean;
}> = ({ kicker, title, text, id, accent, center }) => (
  <div className={`space-y-4 max-w-3xl ${center ? 'mx-auto text-center' : ''}`}>
    <span className={`${kickerClass} block ${accent ? 'text-svc' : 'text-brand'}`}>{kicker}</span>
    <h2 id={id} className="type-h2 text-fg">
      {title}
    </h2>
    {text && <p className="text-base sm:text-lg text-muted leading-relaxed">{text}</p>}
  </div>
);

// Coloured pill with the Assistant's dot and name
export const AssistantTag: React.FC<{ assistant: Assistant }> = ({ assistant }) => (
  <span
    className={`svc-${assistant.id} inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-svc bg-svc/10 border border-svc/30 px-2.5 py-1 rounded-full`}
  >
    <span aria-hidden="true" className="w-2 h-2 rounded-full bg-svc" />
    {assistant.name}
  </span>
);

// One Assistant as a card: tag, tagline, 3-4 sub-services, link to its page
export const AssistantCard: React.FC<{ assistant: Assistant; headingLevel?: 'h2' | 'h3' }> = ({ assistant, headingLevel = 'h3' }) => {
  const Icon = ASSISTANT_ICONS[assistant.id];
  const Heading = headingLevel;
  return (
    <article className={`svc-${assistant.id} relative flex flex-col gap-5 p-6 md:p-8 bg-surface border border-line rounded-card overflow-hidden`}>
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-svc" />
      <div className="flex items-center justify-between gap-3">
        <AssistantTag assistant={assistant} />
        <Icon aria-hidden="true" className="w-5 h-5 text-svc shrink-0" />
      </div>
      <Heading className="type-h3 text-fg">{assistant.tagline}</Heading>
      <ul className="space-y-2.5 text-sm text-muted">
        {assistant.highlights.map((h) => (
          <li key={h} className="flex items-start gap-2.5">
            <Check aria-hidden="true" className="w-4 h-4 mt-1 text-svc shrink-0" />
            <span>{h}</span>
          </li>
        ))}
      </ul>
      <Link
        to={assistant.path}
        className="mt-auto pt-2 inline-flex items-center gap-2 text-sm font-semibold text-svc hover:underline underline-offset-4"
      >
        See {assistant.name}
        <ArrowRight aria-hidden="true" className="w-4 h-4" />
      </Link>
    </article>
  );
};

// The three Assistants side by side
export const AssistantGrid: React.FC<{ only?: AssistantId[]; headingLevel?: 'h2' | 'h3' }> = ({ only, headingLevel }) => (
  <div className={`grid grid-cols-1 gap-6 ${only && only.length < 3 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
    {ASSISTANTS.filter((a) => !only || only.includes(a.id)).map((a) => (
      <AssistantCard key={a.id} assistant={a} headingLevel={headingLevel} />
    ))}
  </div>
);

// Numbered steps in a row (stacked on phones)
export const StepList: React.FC<{ steps: { title: string; text: string }[]; accent?: boolean; icons?: React.ElementType[] }> = ({
  steps,
  accent,
  icons
}) => (
  <ol className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${steps.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
    {steps.map((step, i) => {
      const Icon = icons?.[i];
      return (
        <li key={step.title} className="relative p-6 bg-surface border border-line rounded-card space-y-3">
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold ${
                accent ? 'bg-svc/10 text-svc border border-svc/30' : 'bg-primary/10 text-brand border border-primary/25'
              }`}
            >
              {i + 1}
            </span>
            {Icon && <Icon aria-hidden="true" className={`w-5 h-5 ${accent ? 'text-svc' : 'text-brand'}`} />}
          </div>
          <h3 className="type-h4 text-fg">{step.title}</h3>
          <p className="text-sm text-muted leading-relaxed">{step.text}</p>
        </li>
      );
    })}
  </ol>
);

// The flagship: how the Lead Response System turns an enquiry into a booked viewing
export const LeadResponseSpotlight: React.FC<{ showLink?: boolean }> = ({ showLink = true }) => (
  <div className="svc-technical space-y-10">
    <SectionIntro
      accent
      kicker="Technical Assistant · Flagship"
      title="Every lead answered in 60 seconds."
      text="Most leads go to the agent who replies first. The Lead Response System replies for you, day and night, then hands you the serious ones with a viewing already booked."
    />
    <StepList accent steps={LEAD_RESPONSE_STEPS} icons={[MessageCircle, Zap, Filter, CalendarCheck]} />
    <div className="flex flex-col sm:flex-row gap-3">
      <Link to={FREE_AUDIT_PATH} className="btn btn-primary">
        Check my response time, free
        <ArrowRight aria-hidden="true" className="w-4 h-4" />
      </Link>
      {showLink && (
        <Link to="/services/technical-assistant" className="btn btn-secondary">
          See the Technical Assistant
        </Link>
      )}
    </div>
  </div>
);

// One Assistant vs the Full Team. Prices are set after the free audit (no invented numbers).
export const PlansGrid: React.FC<{ headingLevel?: 'h2' | 'h3' }> = ({ headingLevel = 'h3' }) => {
  const Heading = headingLevel;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {PLANS.map((plan) => (
        <article
          key={plan.id}
          className={`relative flex flex-col gap-6 p-6 md:p-8 bg-surface border rounded-card ${
            plan.featured ? 'border-primary/60' : 'border-line'
          }`}
        >
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Heading className="type-h3 text-fg">{plan.name}</Heading>
              {plan.featured ? (
                <span className="flex items-center gap-1.5" aria-label="Includes all three Assistants">
                  {ASSISTANTS.map((a) => (
                    <span key={a.id} aria-hidden="true" className={`svc-${a.id} w-2.5 h-2.5 rounded-full bg-svc`} />
                  ))}
                </span>
              ) : null}
            </div>
            <p className="text-sm text-muted leading-relaxed">{plan.summary}</p>
          </div>

          <div className="pb-6 border-b border-line">
            {/* TODO(owner): add the real monthly price for this plan in src/data/assistantsData.ts (PLANS) */}
            <div className="text-2xl font-bold text-fg">{plan.price}</div>
            <div className="text-sm text-subtle">Monthly retainer · priced after your free audit</div>
          </div>

          <ul className="space-y-3 text-sm text-fg">
            {plan.includes.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <Check aria-hidden="true" className="w-4 h-4 mt-1 text-brand shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto flex flex-col sm:flex-row gap-3">
            <Link to={FREE_AUDIT_PATH} className={`btn ${plan.featured ? 'btn-primary' : 'btn-secondary'} w-full sm:w-auto`}>
              Get a free audit
            </Link>
            <Link to={BOOK_CALL_PATH} className="btn btn-secondary w-full sm:w-auto">
              Book a call
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
};

// Full-width call to action for the free audit
export const AuditCtaBand: React.FC<{ text?: string }> = ({
  text = 'We check how fast your leads get a reply, what your content is doing and where admin piles up. You get a short list of what to fix first.'
}) => (
  <section className="px-4 sm:px-6 py-20 border-t border-line bg-surface/80">
    <div className="max-w-4xl mx-auto text-center space-y-6">
      <h2 className="type-h2 text-fg">See what’s costing you leads, free.</h2>
      <p className="text-base sm:text-lg text-muted leading-relaxed">{text}</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link to={FREE_AUDIT_PATH} className="btn btn-primary w-full sm:w-auto">
          Get a free audit
          <ArrowRight aria-hidden="true" className="w-4 h-4" />
        </Link>
        <Link to={BOOK_CALL_PATH} className="btn btn-secondary w-full sm:w-auto">
          Book a call
        </Link>
      </div>
    </div>
  </section>
);

// Questions and answers; <details> keeps them keyboard accessible with no script
export const FaqList: React.FC = () => (
  <div className="divide-y divide-line border-y border-line">
    {FAQ.map(({ q, a }) => (
      <details key={q} className="group py-2">
        <summary className="flex items-center justify-between gap-4 py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden rounded-sm">
          <h3 className="type-h4 text-fg">{q}</h3>
          <ChevronDown aria-hidden="true" className="w-5 h-5 text-muted shrink-0 transition-transform group-open:rotate-180" />
        </summary>
        <p className="pb-4 text-base text-muted leading-relaxed">{a}</p>
      </details>
    ))}
  </div>
);

// Where real proof (testimonials, results, client logos) will go. Shown only while developing,
// so visitors never see an empty box. TODO(owner): replace each one with real proof.
export const ProofPlaceholder: React.FC<{ label: string }> = ({ label }) =>
  import.meta.env.DEV ? (
    <div className="p-6 border-2 border-dashed border-line-strong rounded-card text-sm text-subtle text-center">
      TODO: {label}
    </div>
  ) : null;
