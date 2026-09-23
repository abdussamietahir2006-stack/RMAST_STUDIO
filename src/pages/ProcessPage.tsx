import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import {
  coreProcessSteps,
  realEstateWorkflowSteps,
  aiContentWorkflowSteps
} from '../data/processData';
import { Check, Building2, Film } from 'lucide-react';

export const ProcessPage: React.FC = () => {
  const { navigate } = useNavigation();
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<'real-estate' | 'ai-content'>(
    'real-estate'
  );

  return (
    <div className="pt-32 pb-24 px-6 md:px-10 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-24">
        {/* Header */}
        <section className="space-y-6 max-w-4xl">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#C9A96E]">
              Methodology & Rigor
            </span>
          </div>

          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-bold text-[#FAF8F5] leading-[1.02] tracking-tight">
            Engineered For Speed. <br />
            <span className="italic font-light text-[#C9A96E]">Refined For Precision.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#A1A1AA] leading-relaxed font-light">
            We follow a structured 6-stage delivery methodology. Whether we are architecting multi-stage CRM webhooks or generating 4K cinematic film sequences, you always know exactly what is being built, when it will be delivered, and how it will perform.
          </p>
        </section>

        {/* 6 Unified Process Steps */}
        <section className="space-y-12">
          <div className="space-y-2 pb-4 border-b border-[#1E1E24]">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#C9A96E]">
              The Core 6-Stage Framework
            </span>
            <h2 className="font-serif text-3xl text-[#FAF8F5] font-semibold">
              From Initial Audit to Scaled Deployment
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreProcessSteps.map((step) => (
              <div
                key={step.step}
                className="p-8 bg-[#0E111C]/85 backdrop-blur-md border border-[#232738]/80 hover:border-[#C9A96E]/50 transition-all duration-300 space-y-5 flex flex-col justify-between shadow-xl"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-serif font-bold text-[#C9A96E]">
                      {step.step}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717A] px-2 py-0.5 bg-[#121216]">
                      {step.name}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-xl text-[#FAF8F5] font-semibold">
                      {step.title}
                    </h3>
                    <p className="text-xs text-[#8E8D88] leading-relaxed mt-2">
                      {step.summary}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[#1C1C22]">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
                      Key Activities:
                    </div>
                    <ul className="space-y-1.5 text-xs text-[#D4D4D8]">
                      {step.activities.map((act, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-[#C9A96E] shrink-0 mt-0.5" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Division-Specific Workflow Tracks */}
        <section className="space-y-10 p-8 md:p-12 bg-[#0E111C]/80 backdrop-blur-md border border-[#232738]/80 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#1E2232]">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#C9A96E]">
                Track-Specific Execution Sequences
              </span>
              <h2 className="font-serif text-2xl md:text-3xl text-[#FAF8F5] font-semibold">
                Compare Division Workflows
              </h2>
            </div>

            <div
              role="tablist"
              aria-label="Workflow track selector"
              className="inline-flex p-1 bg-[#12141F] border border-[#272B3C] rounded-sm text-xs font-mono"
            >
              <button
                role="tab"
                aria-selected={activeWorkflowTab === 'real-estate'}
                onClick={() => setActiveWorkflowTab('real-estate')}
                className={`flex items-center gap-2 px-4 py-2 cursor-pointer transition-all ${
                  activeWorkflowTab === 'real-estate'
                    ? 'bg-[#C9A96E] text-[#0A0A0C] font-bold'
                    : 'text-[#8E8D88] hover:text-[#FAF8F5]'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Real Estate Track</span>
              </button>

              <button
                role="tab"
                aria-selected={activeWorkflowTab === 'ai-content'}
                onClick={() => setActiveWorkflowTab('ai-content')}
                className={`flex items-center gap-2 px-4 py-2 cursor-pointer transition-all ${
                  activeWorkflowTab === 'ai-content'
                    ? 'bg-[#C9A96E] text-[#0A0A0C] font-bold'
                    : 'text-[#8E8D88] hover:text-[#FAF8F5]'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>AI Content Track</span>
              </button>
            </div>
          </div>

          {activeWorkflowTab === 'real-estate' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              {realEstateWorkflowSteps.map((s) => (
                <div key={s.step} className="p-6 bg-[#0A0C14]/80 border border-[#1E2232] space-y-2">
                  <div className="text-xs font-mono text-[#C9A96E] font-bold">
                    Stage {s.step}
                  </div>
                  <h4 className="font-serif text-lg text-[#FAF8F5] font-medium">
                    {s.title}
                  </h4>
                  <p className="text-xs text-[#8E8D88] leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeWorkflowTab === 'ai-content' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              {aiContentWorkflowSteps.map((s) => (
                <div key={s.step} className="p-6 bg-[#0A0C14]/80 border border-[#1E2232] space-y-2">
                  <div className="text-xs font-mono text-[#C9A96E] font-bold">
                    Stage {s.step}
                  </div>
                  <h4 className="font-serif text-lg text-[#FAF8F5] font-medium">
                    {s.title}
                  </h4>
                  <p className="text-xs text-[#8E8D88] leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="p-10 bg-[#0E111C]/85 backdrop-blur-md border border-[#232738]/80 text-center space-y-6 shadow-xl">
          <h3 className="font-serif text-3xl text-[#FAF8F5] font-semibold">
            Ready to initiate Stage 01 Discover?
          </h3>
          <p className="text-sm text-[#8E8D88] max-w-xl mx-auto">
            We will conduct a 30-minute scoping audit of your current digital setup and outline your architectural options.
          </p>
          <div>
            <button
              onClick={() => navigate('/contact')}
              className="px-8 py-3.5 bg-[#C9A96E] text-[#0A0A0C] text-xs font-semibold uppercase tracking-[0.16em] hover:bg-[#D9B97E] transition-all cursor-pointer"
            >
              Start Discover Stage
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
