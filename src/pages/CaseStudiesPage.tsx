import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import { projectsData } from '../data/projectsData';
import { ProjectMedia } from '../components/media/ServiceMedia';
import { Check } from 'lucide-react';

export const CaseStudiesPage: React.FC = () => {
  const { navigate } = useNavigation();

  return (
    <div className="pt-30 pb-24 px-4 sm:px-6 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-24">
        {/* Header */}
        <section className="space-y-6 max-w-4xl">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-brand">
              Technical Breakdowns
            </span>
          </div>

          <h1 className="type-h1 text-fg">
            Case Studies: Architecture, <br />
            <span className="italic font-light text-brand">Execution & Outcomes.</span>
          </h1>

          <p className="text-base sm:text-lg text-muted leading-relaxed font-light">
            Behind every polished interface lies an intricate operational engine. Here we dissect the exact engineering challenges, architectural choices, and delivered milestones across both divisions.
          </p>
        </section>

        {/* Case Study Cards */}
        <section className="space-y-24">
          {projectsData.map((project) => (
            <article
              key={project.id}
              className="p-8 md:p-12 bg-surface-2/80 backdrop-blur-md border border-line/80 rounded-sm space-y-12 shadow-sm"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-8 border-b border-line">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-brand uppercase tracking-wider">
                      {project.division === 'real-estate' ? 'Real Estate Systems' : 'AI Content Studio'}
                    </span>
                    <span className="text-subtle">·</span>
                    <span className="text-subtle">{project.clientLocation}</span>
                  </div>
                  <h2 className="type-h2 text-fg">
                    {project.title}
                  </h2>
                  <p className="text-sm font-mono text-muted">
                    {project.subtitle}
                  </p>
                </div>

                <div className="text-right">
                  <span className="px-3 py-1 bg-surface-2 border border-line text-xs font-mono text-brand">
                    {project.category}
                  </span>
                </div>
              </div>

              {/* Showcase Banner */}
              <div className="relative aspect-[21/9] overflow-hidden rounded-sm bg-surface border border-line">
                <ProjectMedia project={project} className="w-full h-full object-cover" />
              </div>

              {/* Grid: Challenges vs Solutions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Challenges */}
                <div className="p-6 bg-surface/80 border border-line space-y-4 rounded-card">
                  <div className="text-xs font-mono uppercase tracking-widest text-subtle flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                    <span>Operational & Technical Challenges</span>
                  </div>
                  <ul className="space-y-3 text-xs text-fg">
                    {project.challenges?.map((c, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-[#EF4444] font-bold">›</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Solutions */}
                <div className="p-6 bg-surface/80 border border-line space-y-4 rounded-card">
                  <div className="text-xs font-mono uppercase tracking-widest text-brand flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                    <span>Architectural Interventions</span>
                  </div>
                  <ul className="space-y-3 text-xs text-fg">
                    {project.solutions?.map((s, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-1" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Deliverables & Outcome Bar */}
              <div className="pt-6 border-t border-line grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-2">
                  <div className="text-xs font-mono uppercase tracking-widest text-brand">
                    Production Outcome
                  </div>
                  <p className="text-sm text-fg leading-relaxed">
                    {project.outcome}
                  </p>
                </div>

                <div className="lg:col-span-4 flex justify-end">
                  <button
                    onClick={() => navigate('/contact')}
                    className="btn btn-primary w-full sm:w-auto cursor-pointer"
                  >
                    Build Similar System
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
};
