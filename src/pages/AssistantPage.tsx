import React from 'react';
import { ArrowRight, Check, Star } from 'lucide-react';
import { Link } from '../components/common/Link';
import { useScrollToHash } from '../components/common/useScrollToHash';
import {
  ASSISTANT_ICONS,
  AssistantCard,
  AssistantTag,
  AuditCtaBand,
  LeadResponseSpotlight,
  ProofPlaceholder,
  SectionIntro,
  StepList
} from '../components/assistants/AssistantBlocks';
import { SampleVideos } from '../components/media/SampleVideos';
import { ASSISTANTS, BOOK_CALL_PATH, FREE_AUDIT_PATH, PLANS, type Assistant, type SubService } from '../data/assistantsData';

const sectionClass = 'py-20 md:py-24 px-4 sm:px-6 border-b border-line';

const SubServiceCard: React.FC<{ service: SubService }> = ({ service }) => (
  <article
    id={service.id}
    className={`flex flex-col gap-4 p-6 md:p-8 bg-surface border rounded-card scroll-mt-28 ${
      service.flagship ? 'border-svc/60 md:col-span-2' : 'border-line'
    }`}
  >
    {service.flagship && (
      <span className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-svc bg-svc/10 border border-svc/30 px-2.5 py-1 rounded-full">
        <Star aria-hidden="true" className="w-3.5 h-3.5" />
        Flagship
      </span>
    )}
    <h3 className={service.flagship ? 'type-h3 text-fg' : 'type-h4 text-fg'}>{service.title}</h3>
    <p className="text-base text-muted leading-relaxed">{service.summary}</p>
    <div className="pt-2 space-y-3">
      <div className="text-xs font-mono uppercase tracking-[0.16em] text-subtle">What’s delivered</div>
      <ul className={`grid gap-2.5 text-sm text-fg ${service.flagship ? 'sm:grid-cols-2' : ''}`}>
        {service.delivered.map((d) => (
          <li key={d} className="flex items-start gap-2.5">
            <Check aria-hidden="true" className="w-4 h-4 mt-0.5 text-svc shrink-0" />
            <span>{d}</span>
          </li>
        ))}
      </ul>
    </div>
  </article>
);

export const AssistantPage: React.FC<{ assistant: Assistant }> = ({ assistant }) => {
  const Icon = ASSISTANT_ICONS[assistant.id];
  const others = ASSISTANTS.filter((a) => a.id !== assistant.id);
  const fullTeam = PLANS.find((p) => p.id === 'full-team')!;
  // Links from the Services page point at one sub-service (e.g. #crm)
  useScrollToHash();

  return (
    <div className={`svc-${assistant.id} relative`}>
      {/* Hero, in this Assistant's colour */}
      <section className="relative pt-30 pb-20 px-4 sm:px-6 border-b border-line overflow-hidden">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-svc/10 to-transparent pointer-events-none" />
        <div className="relative max-w-site mx-auto space-y-8">
          <nav aria-label="Breadcrumb" className="text-sm text-subtle">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link to="/" className="hover:text-fg">Home</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link to="/services" className="hover:text-fg">Services</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-fg">{assistant.name}</li>
            </ol>
          </nav>

          <div className="space-y-6 max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-card bg-svc/10 border border-svc/30">
                <Icon aria-hidden="true" className="w-5 h-5 text-svc" />
              </span>
              <AssistantTag assistant={assistant} />
            </div>
            <h1 className="type-h1 text-fg">{assistant.name}</h1>
            <p className="type-h3 text-svc">{assistant.tagline}</p>
            <p className="text-base sm:text-lg text-muted leading-relaxed">{assistant.intro}</p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link to={FREE_AUDIT_PATH} className="btn btn-primary">
                Get a free audit
                <ArrowRight aria-hidden="true" className="w-4 h-4" />
              </Link>
              <Link to={BOOK_CALL_PATH} className="btn btn-secondary">
                Book a call
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problems we solve */}
      <section className={sectionClass}>
        <div className="max-w-site mx-auto space-y-12">
          <SectionIntro accent kicker="Problems we solve" title="Sound familiar?" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assistant.problems.map((p) => (
              <div key={p.title} className="p-6 bg-surface border border-line border-l-4 border-l-svc rounded-card space-y-2">
                <h3 className="type-h4 text-fg">{p.title}</h3>
                <p className="text-base text-muted leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The flagship, step by step (Technical Assistant only) */}
      {assistant.id === 'technical' && (
        <section className={`${sectionClass} bg-surface/40`}>
          <div className="max-w-site mx-auto">
            <LeadResponseSpotlight showLink={false} />
          </div>
        </section>
      )}

      {/* Sub-services */}
      <section className={sectionClass}>
        <div className="max-w-site mx-auto space-y-12">
          <SectionIntro
            accent
            kicker="What we do"
            title={`Everything your ${assistant.name} handles.`}
            text="Start with what you need most. Your plan says which of these we begin with."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assistant.subServices.map((s) => (
              <SubServiceCard key={s.id} service={s} />
            ))}
          </div>
          {/* Real sample videos, once uploaded in the dashboard */}
          {assistant.id === 'creative' && (
            <SampleVideos heading={<SectionIntro accent kicker="Samples" title="A few things we’ve made." />} />
          )}
        </div>
      </section>

      {/* What you get each month */}
      <section className={sectionClass}>
        <div className="max-w-site mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5">
            <SectionIntro
              accent
              kicker="Every month"
              title="What you get each month."
              text="A monthly retainer, with the details agreed in your plan."
            />
          </div>
          <ul className="lg:col-span-7 grid gap-3">
            {assistant.monthly.map((item) => (
              <li key={item} className="flex items-start gap-3 p-4 bg-surface border border-line rounded-card text-base text-fg">
                <Check aria-hidden="true" className="w-5 h-5 mt-0.5 text-svc shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Process */}
      <section className={sectionClass}>
        <div className="max-w-site mx-auto space-y-12">
          <SectionIntro accent kicker="How we start" title="Four simple steps." />
          <StepList accent steps={assistant.process} />
          <ProofPlaceholder label={`add a real testimonial or result from a ${assistant.name} client`} />
        </div>
      </section>

      <AuditCtaBand />

      {/* Cross-links: the rest of the team and the Full Team plan */}
      <section className="py-20 md:py-24 px-4 sm:px-6">
        <div className="max-w-site mx-auto space-y-12">
          <SectionIntro kicker="The rest of the team" title="Better together." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {others.map((a) => (
              <AssistantCard key={a.id} assistant={a} />
            ))}
            <article className="flex flex-col gap-5 p-6 md:p-8 bg-surface border border-primary/60 rounded-card">
              <span className="text-xs font-mono uppercase tracking-[0.2em] font-semibold text-brand">Plan</span>
              <h3 className="type-h3 text-fg">{fullTeam.name}: all three Assistants</h3>
              <p className="text-sm text-muted leading-relaxed">{fullTeam.summary}</p>
              <Link to="/plans" className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline underline-offset-4">
                See plans
                <ArrowRight aria-hidden="true" className="w-4 h-4" />
              </Link>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
};
