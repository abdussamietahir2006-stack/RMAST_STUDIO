import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from '../components/common/Link';
import { AssistantGrid, AuditCtaBand, ProofPlaceholder, SectionIntro } from '../components/assistants/AssistantBlocks';
import { SampleVideos } from '../components/media/SampleVideos';
import { BOOK_CALL_PATH } from '../data/assistantsData';

// Real work only: sample videos uploaded in the dashboard, and case studies once clients approve them
export const WorkPage: React.FC = () => (
  <div className="relative">
    <section className="pt-30 pb-20 px-4 sm:px-6 border-b border-line">
      <div className="max-w-site mx-auto space-y-12">
        <div className="space-y-6 max-w-3xl">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-brand">Work</span>
          <h1 className="type-h1 text-fg">Our work.</h1>
          <p className="text-base sm:text-lg text-muted leading-relaxed">
            We are writing up case studies with our clients, and they will be here soon. Want to see work that matches your business?
            Book a call and we will walk you through it.
          </p>
          <Link to={BOOK_CALL_PATH} className="btn btn-primary">
            Book a call
            <ArrowRight aria-hidden="true" className="w-4 h-4" />
          </Link>
        </div>
        <SampleVideos heading={<SectionIntro kicker="Creative Assistant" title="Sample videos." />} />
        {/* TODO(owner): add real case studies (client, problem, what we did, result) */}
        <ProofPlaceholder label="add real case studies: client name, problem, what we did, real result" />
      </div>
    </section>

    <section className="py-20 md:py-24 px-4 sm:px-6">
      <div className="max-w-site mx-auto space-y-12">
        <SectionIntro kicker="What we do" title="Three Assistants for real estate teams." />
        <AssistantGrid />
      </div>
    </section>

    <AuditCtaBand />
  </div>
);
