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
    <div className="pt-30 pb-24 px-4 sm:px-6 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-24">
        {/* Header */}
        <section className="space-y-6 max-w-4xl">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-brand">
              Methodology & Rigor
            </span>
          </div>

          <h1 className="type-h1 text-fg">
            Engineered For Speed. <br />
            <span className="italic font-light text-brand">Refined For Precision.</span>
          </h1>

          <p className="text-base sm:text-lg text-muted leading-relaxed font-light">
            We follow a structured 6-stage delivery methodology. Whether we are architecting multi-stage CRM webhooks or generating 4K cinematic film sequences, you always know exactly what is being built, when it will be delivered, and how it will perform.
          </p>
        </section>

        {/* 6 Unified Process Steps */}
        <section className="space-y-12">
          <div className="space-y-2 pb-4 border-b border-line">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-brand">
              The Core 6-Stage Framework
            </span>
            <h2 className="type-h3 text-fg">
              From Initial Audit to Scaled Deployment
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreProcessSteps.map((step) => (
              <div
                key={step.step}
                className="p-8 bg-surface-2/85 backdrop-blur-md border border-line/80 hover:border-primary/50 transition-all duration-300 space-y-6 flex flex-col justify-between shadow-xl rounded-card"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-serif font-bold text-brand">
                      {step.step}
                    </span>
                    <span className="text-xs font-mono uppercase tracking-widest text-subtle px-2 py-1 bg-surface">
                      {step.name}
                    </span>
                  </div>

                  <div>
                    <h3 className="type-h4 text-fg">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted leading-relaxed mt-2">
                      {step.summary}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-line">
                    <div className="text-xs font-mono uppercase tracking-wider text-subtle">
                      Key Activities:
                    </div>
                    <ul className="space-y-2 text-xs text-fg">
                      {step.activities.map((act, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-brand shrink-0 mt-1" />
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
        <section className="space-y-12 p-8 md:p-12 bg-surface-2/80 backdrop-blur-md border border-line/80 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-line">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-brand">
                Track-Specific Execution Sequences
              </span>
              <h2 className="type-h3 text-fg">
                Compare Division Workflows
              </h2>
            </div>

            <div
              role="tablist"
              aria-label="Workflow track selector"
              className="inline-flex p-1 bg-surface-2 border border-line-strong rounded-sm text-xs font-mono"
            >
              <button
                role="tab"
                aria-selected={activeWorkflowTab === 'real-estate'}
                onClick={() => setActiveWorkflowTab('real-estate')}
                className={`flex items-center gap-2 px-4 py-2 cursor-pointer transition-all ${
                  activeWorkflowTab === 'real-estate'
                    ? 'bg-primary text-on-primary font-bold'
                    : 'text-muted hover:text-fg'
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
                    ? 'bg-primary text-on-primary font-bold'
                    : 'text-muted hover:text-fg'
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
                <div key={s.step} className="p-6 bg-surface/80 border border-line space-y-2 rounded-card">
                  <div className="text-xs font-mono text-brand font-bold">
                    Stage {s.step}
                  </div>
                  <h4 className="type-h4 text-fg">
                    {s.title}
                  </h4>
                  <p className="text-sm text-muted leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeWorkflowTab === 'ai-content' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              {aiContentWorkflowSteps.map((s) => (
                <div key={s.step} className="p-6 bg-surface/80 border border-line space-y-2 rounded-card">
                  <div className="text-xs font-mono text-brand font-bold">
                    Stage {s.step}
                  </div>
                  <h4 className="type-h4 text-fg">
                    {s.title}
                  </h4>
                  <p className="text-sm text-muted leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="p-12 bg-surface-2/85 backdrop-blur-md border border-line/80 text-center space-y-6 shadow-xl">
          <h3 className="type-h3 text-fg">
            Ready to initiate Stage 01 Discover?
          </h3>
          <p className="text-sm text-muted max-w-xl mx-auto">
            We will conduct a 30-minute scoping audit of your current digital setup and outline your architectural options.
          </p>
          <div>
            <button
              onClick={() => navigate('/contact')}
              className="btn btn-primary cursor-pointer"
            >
              Start Discover Stage
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
