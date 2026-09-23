import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import { projectsData } from '../data/projectsData';
import { ProjectMedia } from '../components/media/ServiceMedia';
import { Check } from 'lucide-react';

export const CaseStudiesPage: React.FC = () => {
  const { navigate } = useNavigation();

  return (
    <div className="pt-32 pb-24 px-6 md:px-10 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-20">
        {/* Header */}
        <section className="space-y-6 max-w-4xl">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#C9A96E]">
              Technical Breakdowns
            </span>
          </div>

          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-bold text-[#FAF8F5] leading-[1.02] tracking-tight">
            Case Studies: Architecture, <br />
            <span className="italic font-light text-[#C9A96E]">Execution & Outcomes.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#A1A1AA] leading-relaxed font-light">
            Behind every polished interface lies an intricate operational engine. Here we dissect the exact engineering challenges, architectural choices, and delivered milestones across both divisions.
          </p>
        </section>

        {/* Case Study Cards */}
        <section className="space-y-20">
          {projectsData.map((project) => (
            <article
              key={project.id}
              className="p-8 md:p-12 bg-[#0E111C]/80 backdrop-blur-md border border-[#232738]/80 rounded-sm space-y-10 shadow-2xl"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-8 border-b border-[#1C1C22]">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-[#C9A96E] uppercase tracking-wider">
                      {project.division === 'real-estate' ? 'Real Estate Systems' : 'AI Content Studio'}
                    </span>
                    <span className="text-[#3F3F46]">·</span>
                    <span className="text-[#71717A]">{project.clientLocation}</span>
                  </div>
                  <h2 className="font-serif text-3xl md:text-4xl text-[#FAF8F5] font-semibold">
                    {project.title}
                  </h2>
                  <p className="text-sm font-mono text-[#A1A1AA]">
                    {project.subtitle}
                  </p>
                </div>

                <div className="text-right">
                  <span className="px-3 py-1 bg-[#15151C] border border-[#27272F] text-xs font-mono text-[#C9A96E]">
                    {project.category}
                  </span>
                </div>
              </div>

              {/* Showcase Banner */}
              <div className="relative aspect-[21/9] overflow-hidden rounded-sm bg-[#141418] border border-[#22222A]">
                <ProjectMedia project={project} className="w-full h-full object-cover opacity-85" />
              </div>

              {/* Grid: Challenges vs Solutions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Challenges */}
                <div className="p-6 bg-[#0A0C14]/80 border border-[#1E2232] space-y-4">
                  <div className="text-xs font-mono uppercase tracking-widest text-[#71717A] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                    <span>Operational & Technical Challenges</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-[#D4D4D8]">
                    {project.challenges?.map((c, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="text-[#EF4444] font-bold">›</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Solutions */}
                <div className="p-6 bg-[#0A0C14]/80 border border-[#1E2232] space-y-4">
                  <div className="text-xs font-mono uppercase tracking-widest text-[#C9A96E] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                    <span>Architectural Interventions</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-[#D4D4D8]">
                    {project.solutions?.map((s, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Deliverables & Outcome Bar */}
              <div className="pt-6 border-t border-[#1C1C22] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#C9A96E]">
                    Production Outcome
                  </div>
                  <p className="text-sm text-[#FAF8F5] leading-relaxed">
                    {project.outcome}
                  </p>
                </div>

                <div className="lg:col-span-4 flex justify-end">
                  <button
                    onClick={() => navigate('/contact')}
                    className="w-full sm:w-auto px-6 py-3 bg-[#C9A96E] text-[#0A0A0C] text-xs font-semibold uppercase tracking-wider hover:bg-[#D9B97E] transition-all cursor-pointer"
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
