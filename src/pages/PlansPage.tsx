import React from 'react';
import { AssistantGrid, AuditCtaBand, FaqList, PlansGrid, SectionIntro, StepList } from '../components/assistants/AssistantBlocks';
import { HOW_IT_WORKS } from '../data/assistantsData';

// One Assistant vs the Full Team. Prices are quoted after the free audit.
export const PlansPage: React.FC = () => (
  <div className="relative">
    <section className="pt-30 pb-20 px-4 sm:px-6 border-b border-line">
      <div className="max-w-site mx-auto space-y-12">
        <div className="space-y-6 max-w-3xl">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-brand">Plans</span>
          <h1 className="type-h1 text-fg">One Assistant, or the Full Team.</h1>
          <p className="text-base sm:text-lg text-muted leading-relaxed">
            Both plans are monthly retainers. We price your plan after a free audit, so it fits the size of your business and you only
            pay for what you need.
          </p>
        </div>
        <PlansGrid headingLevel="h2" />
      </div>
    </section>

    <section className="py-20 md:py-24 px-4 sm:px-6 border-b border-line">
      <div className="max-w-site mx-auto space-y-12">
        <SectionIntro
          kicker="Choosing one Assistant?"
          title="Start where it hurts most."
          text="Losing leads? Start with Technical. Invisible online? Start with Creative. Buried in admin? Start with Virtual."
        />
        <AssistantGrid />
      </div>
    </section>

    <section className="py-20 md:py-24 px-4 sm:px-6 border-b border-line">
      <div className="max-w-site mx-auto space-y-12">
        <SectionIntro kicker="How it works" title="From free audit to monthly report." />
        <StepList steps={HOW_IT_WORKS} />
      </div>
    </section>

    <AuditCtaBand />

    <section className="py-20 md:py-24 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-10">
        <SectionIntro kicker="FAQ" title="Questions about plans." />
        <FaqList />
      </div>
    </section>
  </div>
);
