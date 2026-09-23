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
    <div className="pt-32 pb-24 px-6 md:px-10 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-20">
        {/* Header */}
        <section className="space-y-6 max-w-4xl">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#C9A96E]">
              Portfolio of Execution
            </span>
          </div>

          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-bold text-[#FAF8F5] leading-[1.02] tracking-tight">
            Selected Works & <br />
            <span className="italic font-light text-[#C9A96E]">Architectural Systems.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#A1A1AA] leading-relaxed font-light">
            An editorial catalog of custom broker flagships, automated deal engines, and cinematic AI campaigns. Structured for future Headless CMS and API synchronization.
          </p>

          {/* Category Filter Controls */}
          <div className="pt-2 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-mono tracking-wider uppercase transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#C9A96E] text-[#0A0A0C] font-semibold'
                    : 'bg-[#101014] border border-[#222228] text-[#8E8D88] hover:text-[#FAF8F5] hover:border-[#3F3F46]'
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
                className="group p-8 md:p-12 bg-[#0E111C]/80 backdrop-blur-md border border-[#232738]/80 hover:border-[#C9A96E]/50 transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center shadow-xl"
              >
                {/* Visual Preview (7 cols) */}
                <div
                  className={`lg:col-span-7 overflow-hidden rounded-sm relative aspect-[16/10] bg-[#141418] ${
                    isAlternate ? 'lg:order-2' : ''
                  }`}
                >
                  <ProjectMedia
                    project={project}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-75 group-hover:opacity-100"
                  />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="text-[10px] font-mono tracking-widest uppercase bg-[#0A0A0D]/90 backdrop-blur-sm px-2.5 py-1 text-[#FAF8F5] border border-[#27272A]">
                      {project.category}
                    </span>
                    <span className="text-[10px] font-mono tracking-widest uppercase bg-[#0A0A0D]/90 backdrop-blur-sm px-2.5 py-1 text-[#C9A96E] border border-[#27272A]">
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
                  <div className="flex items-center gap-2 text-xs font-mono text-[#71717A]">
                    <span>{project.clientLocation}</span>
                    <span>·</span>
                    <span>{project.year}</span>
                  </div>

                  <div>
                    <h2 className="font-serif text-3xl md:text-4xl text-[#FAF8F5] font-semibold group-hover:text-[#C9A96E] transition-colors">
                      {project.title}
                    </h2>
                    <p className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA] mt-1.5">
                      {project.subtitle}
                    </p>
                  </div>

                  <p className="text-sm text-[#8E8D88] leading-relaxed">
                    {project.description}
                  </p>

                  <div className="p-4 bg-[#08080B] border-l-2 border-[#C9A96E] space-y-1">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#C9A96E]">
                      System Impact
                    </div>
                    <p className="text-xs text-[#E4E4E7]">
                      {project.outcome}
                    </p>
                  </div>

                  <div className="pt-2">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] mb-1.5">
                      Services Executed
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-mono text-[#A1A1AA]">
                      {project.services.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-[#121216] border border-[#22222A]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => navigate('/case-studies')}
                      className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#FAF8F5] group-hover:text-[#C9A96E] transition-colors cursor-pointer"
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
        <div className="p-6 bg-[#0E111C]/80 backdrop-blur-md border border-[#232738]/80 text-xs font-mono text-[#71717A] text-center shadow-md">
          Note: This portfolio is structured with data models ready to bind directly to <code className="text-[#C9A96E]">/api/projects</code> and custom MongoDB/CMS collections upon deployment.
        </div>
      </div>
    </div>
  );
};
