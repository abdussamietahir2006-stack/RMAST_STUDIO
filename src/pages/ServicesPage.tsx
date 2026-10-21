import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from '../components/common/Link';
import { AssistantGrid, AuditCtaBand, SectionIntro } from '../components/assistants/AssistantBlocks';
import { ASSISTANTS, FREE_AUDIT_PATH } from '../data/assistantsData';

// Overview of the three Assistants and every sub-service, each linking to its Assistant page
export const ServicesPage: React.FC = () => (
  <div className="relative">
    <section className="pt-30 pb-20 px-4 sm:px-6 border-b border-line">
      <div className="max-w-site mx-auto space-y-12">
        <div className="space-y-6 max-w-3xl">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-brand">Services</span>
          <h1 className="type-h1 text-fg">Three Assistants. One team behind your business.</h1>
          <p className="text-base sm:text-lg text-muted leading-relaxed">
            Everything we do for real estate agents, teams and brokerages sits under one of three Assistants. Hire the one you need
            most, or all three as your Full Team. Both are monthly retainers.
          </p>
          <Link to={FREE_AUDIT_PATH} className="btn btn-primary">
            Not sure where to start? Get a free audit
            <ArrowRight aria-hidden="true" className="w-4 h-4" />
          </Link>
        </div>
        <AssistantGrid headingLevel="h2" />
      </div>
    </section>

    {/* Every sub-service, grouped by Assistant */}
    <section className="py-20 md:py-24 px-4 sm:px-6">
      <div className="max-w-site mx-auto space-y-12">
        <SectionIntro kicker="All services" title="Everything we do, in one place." />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {ASSISTANTS.map((a) => (
            <div key={a.id} className={`svc-${a.id} p-6 bg-surface border border-line border-t-4 border-t-svc rounded-card space-y-4`}>
              <h3 className="type-h4 text-fg">
                <Link to={a.path} className="hover:text-svc">
                  {a.name}
                </Link>
              </h3>
              <ul className="space-y-1">
                {a.subServices.map((s) => (
                  <li key={s.id}>
                    <Link to={`${a.path}#${s.id}`} className="flex items-center justify-between gap-3 py-2 text-sm text-muted hover:text-svc">
                      <span>{s.title}</span>
                      <ArrowRight aria-hidden="true" className="w-3.5 h-3.5 shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>

    <AuditCtaBand />
  </div>
);
