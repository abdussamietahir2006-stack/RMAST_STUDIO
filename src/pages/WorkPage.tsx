import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { projectsData } from '../data/projectsData';
import { ProjectMedia } from '../components/media/ServiceMedia';

import { ArrowRight } from 'lucide-react';

export const WorkPage: React.FC = () => {
  const { navigate } = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = [
    'ALL',
    'REAL ESTATE',
    'WEB',
    'SOFTWARE',
    'CRM',
    'AI AUTOMATION',
    'AI VIDEO',
    'FASHION',
    'FOOD',
    'PRODUCT'
  ];

  const filteredProjects = projectsData.filter((project) => {
    if (selectedCategory === 'ALL') return true;
    return (
      project.category === selectedCategory ||
      project.services.some((s) => s.toUpperCase().includes(selectedCategory))
    );
  });

  return (
    <div className="pt-30 pb-24 px-4 sm:px-6 min-h-screen">
      <div className="max-w-site mx-auto space-y-24">
        {/* Header */}
        <section className="space-y-6 max-w-4xl">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-brand">
              Portfolio of Execution
            </span>
          </div>

          <h1 className="type-h1 text-fg">
            Selected Works & <br />
            <span className="italic font-light text-brand">Architectural Systems.</span>
          </h1>

          <p className="text-base sm:text-lg text-muted leading-relaxed font-light">
            An editorial catalog of custom broker flagships, automated deal engines, and cinematic AI campaigns. Structured for future Headless CMS and API synchronization.
          </p>

          {/* Category Filter Controls */}
          <div className="pt-2 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs font-mono tracking-wider uppercase transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-primary text-on-primary font-semibold'
                    : 'bg-surface border border-line text-muted hover:text-fg hover:border-line-strong'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Immersive Project Showcase (Editorial Composition, Not Generic 3-Col Grid) */}
        <section className="space-y-16">
          {filteredProjects.map((project, index) => {
            const isAlternate = index % 2 === 1;

            return (
              <div
                key={project.id}
                className="group p-8 md:p-12 bg-surface-2/80 backdrop-blur-md border border-line/80 hover:border-primary/50 transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center shadow-xl rounded-card"
              >
                {/* Visual Preview (7 cols) */}
                <div
                  className={`lg:col-span-7 overflow-hidden rounded-sm relative aspect-[16/10] bg-surface ${
                    isAlternate ? 'lg:order-2' : ''
                  }`}
                >
                  <ProjectMedia
                    project={project}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-75 group-hover:opacity-100"
                  />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="text-xs font-mono tracking-widest uppercase bg-surface/90 backdrop-blur-sm px-3 py-1 text-fg border border-line">
                      {project.category}
                    </span>
                    <span className="text-xs font-mono tracking-widest uppercase bg-surface/90 backdrop-blur-sm px-3 py-1 text-brand border border-line">
                      {project.division === 'real-estate' ? 'Real Estate Systems' : 'AI Content Studio'}
                    </span>
                  </div>
                </div>

                {/* Narrative Details (5 cols) */}
                <div
                  className={`lg:col-span-5 space-y-6 ${
                    isAlternate ? 'lg:order-1' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-mono text-subtle">
                    <span>{project.clientLocation}</span>
                    <span>·</span>
                    <span>{project.year}</span>
                  </div>

                  <div>
                    <h2 className="type-h2 text-fg group-hover:text-brand transition-colors">
                      {project.title}
                    </h2>
                    <p className="text-sm font-mono uppercase tracking-wider text-muted mt-2">
                      {project.subtitle}
                    </p>
                  </div>

                  <p className="text-sm text-muted leading-relaxed">
                    {project.description}
                  </p>

                  <div className="p-4 bg-canvas border-l-2 border-primary space-y-1">
                    <div className="text-xs font-mono uppercase tracking-wider text-brand">
                      System Impact
                    </div>
                    <p className="text-sm text-fg">
                      {project.outcome}
                    </p>
                  </div>

                  <div className="pt-2">
                    <div className="text-xs font-mono uppercase tracking-wider text-subtle mb-2">
                      Services Executed
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-mono text-muted">
                      {project.services.map((s, idx) => (
                        <span key={idx} className="px-2 py-1 bg-surface border border-line">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => navigate('/case-studies')}
                      className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-fg group-hover:text-brand transition-colors cursor-pointer"
                    >
                      <span>Examine Case Study Specs</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Future CMS Placeholder Note */}
        <div className="p-6 bg-surface-2/80 backdrop-blur-md border border-line/80 text-xs font-mono text-subtle text-center shadow-md rounded-card">
          Note: This portfolio is structured with data models ready to bind directly to <code className="text-brand">/api/projects</code> and custom MongoDB/CMS collections upon deployment.
        </div>
      </div>
    </div>
  );
};
