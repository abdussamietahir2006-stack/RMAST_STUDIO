import React, { useState, useEffect } from 'react';
import { CheckCircle2, ShieldCheck, Zap, Clock, UserCheck, Calendar, DollarSign } from 'lucide-react';

interface WorkflowNode {
  id: string;
  step: string;
  label: string;
  sublabel: string;
  icon: any;
  latency: string;
  description: string;
  systemAction: string;
  brokerBenefit: string;
}

export const WorkflowInteractive: React.FC = () => {
  const [activeNodeIndex, setActiveNodeIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nodes: WorkflowNode[] = [
    {
      id: 'lead-capture',
      step: '01',
      label: 'Lead Capture',
      sublabel: 'Omnichannel Ingestion',
      icon: Zap,
      latency: '< 1 second',
      description: 'Prospective buyers and investors hit your digital flagship from Meta Ads, Google search, Bayut, Property Finder, or direct WhatsApp referral.',
      systemAction: 'Webhook triggers instant payload capture and duplicates audit across database.',
      brokerBenefit: 'No manual entry required. Every single inquiry is recorded without broker friction.'
    },
    {
      id: 'ai-assistant',
      step: '02',
      label: 'AI Assistant',
      sublabel: '24/7 Conversational Engagement',
      icon: Clock,
      latency: '< 15 seconds',
      description: 'Conversational agent greets the prospect immediately on web or WhatsApp, pre-trained on property specs, neighborhood data, and payment plans.',
      systemAction: 'Natural language agent initiates polite, informative discovery dialogue.',
      brokerBenefit: 'Zero response delay, even at 2:00 AM on Sunday mornings.'
    },
    {
      id: 'lead-qualification',
      step: '03',
      label: 'Lead Qualification',
      sublabel: 'Structured Deal Filter',
      icon: ShieldCheck,
      latency: 'Instant evaluation',
      description: 'The system validates purchasing timeframe (immediate vs 6 months), verified budget range, cash vs mortgage status, and property preferences.',
      systemAction: 'Prospect scored via decision matrix: VIP Hot Deal, Warm Nurture, or General Inquiry.',
      brokerBenefit: 'Senior agents never waste time on tyre-kickers or unfinanced buyers.'
    },
    {
      id: 'crm',
      step: '04',
      label: 'CRM Architecture',
      sublabel: 'Deal Creation & Routing',
      icon: UserCheck,
      latency: 'Real-time sync',
      description: 'A structured contact card and pipeline deal are created with full conversational context, notes, and criteria automatically appended.',
      systemAction: 'Assigned to top-producing listing agent with automated round-robin distribution and SLA timer.',
      brokerBenefit: 'Complete pipeline visibility for founders and managing partners.'
    },
    {
      id: 'automated-follow-up',
      step: '05',
      label: 'Automated Follow-up',
      sublabel: 'Zero-Leakage Cadence',
      icon: CheckCircle2,
      latency: 'Multi-touch cadence',
      description: 'Pre-formatted listing brochures, video property tours, and personalized WhatsApp messages dispatched automatically if appointment is pending.',
      systemAction: 'Smart delays triggered based on prospect open rates and response behaviors.',
      brokerBenefit: 'Inquiries are consistently nurtured without requiring agent memory.'
    },
    {
      id: 'appointment',
      step: '06',
      label: 'Appointment Booked',
      sublabel: 'Calendar Synchronization',
      icon: Calendar,
      latency: 'Frictionless booking',
      description: 'Qualified buyer selects an available showing slot directly through synced Google / Outlook calendar with automated SMS directions.',
      systemAction: 'Calendar event created, agent notified on WhatsApp, reminder sequence armed.',
      brokerBenefit: 'Agent simply turns up to the property with all buyer preferences briefed.'
    },
    {
      id: 'deal',
      step: '07',
      label: 'Deal & Closing',
      sublabel: 'Contract & Commission',
      icon: DollarSign,
      latency: 'Accelerated velocity',
      description: 'Offer presented, contract milestones tracked, and closed deal data recorded for executive forecasting and commission accounting.',
      systemAction: 'Pipeline marked Closed Won; post-closing review and referral campaign scheduled.',
      brokerBenefit: 'Shorter transaction cycles and higher gross commission per broker.'
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveNodeIndex((prev) => (prev + 1) % nodes.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nodes.length]);

  const currentNode = nodes[activeNodeIndex];

  return (
    <div className="bg-surface border border-line p-6 md:p-12 relative overflow-hidden rounded-card">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-line">
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-brand mb-2 flex items-center gap-2">
            <span>Automated Architecture</span>
            <span className="text-subtle">·</span>
            <span>Zero Lead Leakage</span>
          </div>
          <h3 className="type-h3 text-fg">
            The Real Estate Systems Pipeline
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="btn btn-secondary cursor-pointer"
          >
            {isAutoPlaying ? 'Pause Simulation' : 'Auto Play Simulation'}
          </button>
        </div>
      </div>

      {/* Workflow Horizontal Node Bar */}
      <div className="py-8 overflow-x-auto scrollbar-none">
        <div className="flex items-center min-w-[760px] justify-between relative">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-[1px] bg-surface-2 -z-0" />

          {nodes.map((node, index) => {
            const isActive = index === activeNodeIndex;
            const isCompleted = index < activeNodeIndex;

            return (
              <button
                key={node.id}
                onClick={() => {
                  setActiveNodeIndex(index);
                  setIsAutoPlaying(false);
                }}
                className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
              >
                <div
                  className={`w-12 h-12 rounded-sm border flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? 'bg-primary border-primary text-on-primary scale-110 shadow-lg shadow-primary/20'
                      : isCompleted
                      ? 'bg-surface-2 border-primary/60 text-brand'
                      : 'bg-surface border-line text-subtle group-hover:border-line-strong'
                  }`}
                >
                  <node.icon className="w-5 h-5" />
                </div>

                <div className="mt-3 text-center">
                  <div
                    className={`text-xs font-mono tracking-wider uppercase transition-colors ${
                      isActive ? 'text-brand font-bold' : 'text-subtle'
                    }`}
                  >
                    {node.step}
                  </div>
                  <div
                    className={`text-xs font-medium whitespace-nowrap mt-1 transition-colors ${
                      isActive ? 'text-fg' : 'text-muted'
                    }`}
                  >
                    {node.label}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Node Inspector Detail */}
      <div className="mt-4 p-6 md:p-8 bg-surface border border-line rounded-sm grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-3 py-1 bg-surface-2 border border-primary/30 text-brand">
              Stage {currentNode.step} of 07
            </span>
            <span className="text-xs font-mono text-subtle uppercase tracking-wider">
              Latency: {currentNode.latency}
            </span>
          </div>

          <div>
            <h4 className="type-h4 text-fg">
              {currentNode.label}
            </h4>
            <p className="text-sm font-mono uppercase tracking-widest text-muted mt-1">
              {currentNode.sublabel}
            </p>
          </div>

          <p className="text-sm text-fg leading-relaxed">
            {currentNode.description}
          </p>
        </div>

        <div className="lg:col-span-5 space-y-3 pt-4 lg:pt-0 lg:border-l lg:border-line lg:pl-8 text-xs">
          <div className="p-3 bg-surface border border-line">
            <div className="text-xs font-mono uppercase tracking-wider text-subtle mb-1">
              System Automation Action
            </div>
            <p className="text-fg">
              {currentNode.systemAction}
            </p>
          </div>

          <div className="p-3 bg-surface border border-line">
            <div className="text-xs font-mono uppercase tracking-wider text-brand mb-1">
              Brokerage Financial Impact
            </div>
            <p className="text-fg">
              {currentNode.brokerBenefit}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
