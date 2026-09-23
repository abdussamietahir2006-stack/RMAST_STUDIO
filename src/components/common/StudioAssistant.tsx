import React, { useState, useRef, useEffect } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useCurrency } from '../../context/CurrencyContext';
import { CONTACT } from '../../config/contact';
import { askAssistant } from '../../lib/api';
import { Sparkles, X, Send, ArrowRight, Bot } from 'lucide-react';

interface Message {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  action?: {
    label: string;
    path: string;
  };
}

type Reply = Pick<Message, 'text' | 'action'>;

const quickQuestions = [
  'What does RMAST do?',
  'What services are available?',
  'How much does a website cost?',
  'What is included in Real Estate systems?',
  'What industries do you serve for AI content?',
  'How can I book a consultation?',
  'What AI video services are available?'
];

// Suggest a relevant page link based on what the visitor asked
function inferAction(question: string): Message['action'] {
  const q = question.toLowerCase();
  if (/(price|pricing|cost|budget|package|how much|video)/.test(q)) return { label: 'View Pricing', path: '/pricing' };
  if (/(contact|book|consult|call|meet|whatsapp|email|hire)/.test(q)) return { label: 'Go to Contact Page', path: '/contact' };
  if (/(founder|team|who|about|linkedin|abdussamie|mashhood)/.test(q)) return { label: 'Meet the Founders', path: '/about' };
  if (/(fashion|food|restaurant|product|content|film|cinematic|ai video)/.test(q)) return { label: 'Explore AI Content Studio', path: '/ai-content' };
  if (/(real estate|broker|crm|website|automation|chatbot|software)/.test(q)) return { label: 'Explore Real Estate Systems', path: '/real-estate' };
  if (/(process|timeline|how do you work|steps)/.test(q)) return { label: 'See Our Process', path: '/process' };
  if (/(work|portfolio|case stud|project)/.test(q)) return { label: 'View Selected Work', path: '/work' };
  return { label: 'Start a Project Conversation', path: '/contact' };
}

// Offline answers used when the AI endpoint is unavailable
function scriptedReply(question: string, format: (usd: number) => string): Reply {
  const q = question.toLowerCase();

  if (q.includes('linkedin') || q.includes('abdussamie') || q.includes('founder')) {
    return {
      text: `RMAST Studio is founded and led by Raja Muhammad Abdussamie Tahir (Systems Architect & Studio Principal) and Mashhood (Creative Technologist & AI Director). You can view Raja Muhammad Abdussamie Tahir's profile on LinkedIn: ${CONTACT.founderLinkedIn} or reach out directly via WhatsApp.`,
      action: { label: 'View Leadership Page', path: '/about' }
    };
  }

  const matched =
    quickQuestions.find((qq) => qq.toLowerCase() === q) ??
    quickQuestions.find((qq) => qq.toLowerCase().includes(q) || q.includes(qq.toLowerCase().slice(0, 10)));

  switch (matched) {
    case 'What does RMAST do?':
      return {
        text: 'RMAST Studio is a premium digital systems & AI content studio founded by Raja Muhammad Abdussamie Tahir and Mashhood. We operate two divisions: 1) Digital Systems behind modern real estate brokerages (USA, UAE, Canada), and 2) Cinematic AI Content for brands worldwide.',
        action: { label: 'Explore Studio Philosophy', path: '/about' }
      };
    case 'What services are available?':
      return {
        text: 'Division One (Real Estate): Website development, custom software, CRM architecture, AI automation, AI chatbots, social media, virtual assistance, and admin support.\n\nDivision Two (AI Content Studio): Cinematic property tours, fashion campaigns, food & restaurant cinema, product films, and AI advertising.',
        action: { label: 'Browse All Services', path: '/services' }
      };
    case 'How much does a website cost?':
      return {
        text: `Our custom Real Estate Website starts at ${format(1000)}. It includes a bespoke multi-page responsive design, high-speed CDN, WhatsApp direct hook, AI conversational chatbot, technical SEO, and 1 month complimentary maintenance.`,
        action: { label: 'View Pricing & Add-ons', path: '/pricing' }
      };
    case 'What is included in Real Estate systems?':
      return {
        text: `We engineer the full deal cycle: Lead capture → Conversational AI qualification → Multi-stage CRM → Automated WhatsApp/email follow-up → Calendar booking → Deal closure. Packages range from Starter (${format(1250)}) to complete Digital Operating Systems (${format(10000)}+).`,
        action: { label: 'Explore Real Estate Systems', path: '/real-estate' }
      };
    case 'What industries do you serve for AI content?':
      return {
        text: 'Our AI Content Studio serves Real Estate, Fashion & Apparel, Food & Restaurants, Consumer Products, Jewelry, Beauty, E-commerce, and Personal Brands worldwide.',
        action: { label: 'Explore AI Content Studio', path: '/ai-content' }
      };
    case 'How can I book a consultation?':
      return {
        text: `You can contact the founders directly via WhatsApp (${CONTACT.whatsappDisplay}) or submit your project requirements on our contact page. Because we are a small founder-led team, you work directly with Abdussamie and Mashhood.`,
        action: { label: 'Go to Contact Page', path: '/contact' }
      };
    case 'What AI video services are available?':
      return {
        text: `Individual AI videos start at ${format(45)} for Starter, ${format(65)} for Standard, and ${format(100)} for Professional multi-angle cinema. Monthly packages of 10, 20, or 30 videos offer up to 24% in savings.`,
        action: { label: 'View Video Pricing Matrix', path: '/pricing' }
      };
    default:
      return {
        text: 'RMAST delivers custom digital systems for real estate and cinematic AI content for global brands. Final scoping and pricing depend on integrations and requirements. Connect directly with the founders via WhatsApp or submit a brief.',
        action: { label: 'Start a Project Conversation', path: '/contact' }
      };
  }
}

let messageCounter = 0;
const nextId = () => `msg-${Date.now()}-${messageCounter++}`;

export const StudioAssistant: React.FC = () => {
  const { navigate } = useNavigation();
  const { currency, format } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'Welcome to RMAST Studio. I can assist you with our Real Estate Digital Systems, AI Content Studio packages, pricing, or founder consultation details.'
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isThinking]);

  const ask = async (question: string) => {
    const text = question.trim();
    if (!text || isThinking) return;

    const userMsg: Message = { id: nextId(), sender: 'user', text };
    const history = [...messages, userMsg];
    setMessages(history);
    setIsThinking(true);

    let reply: Reply;
    try {
      const { reply: aiText } = await askAssistant(
        history
          .filter((m) => m.id !== 'welcome-1')
          .map((m) => ({ role: m.sender, text: m.text })),
        currency
      );
      reply = { text: aiText, action: inferAction(text) };
    } catch {
      reply = scriptedReply(text, format);
    }

    setMessages((prev) => [...prev, { id: nextId(), sender: 'assistant', ...reply }]);
    setIsThinking(false);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText;
    setInputText('');
    ask(text);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`h-12 px-4 rounded-full border flex items-center gap-2.5 shadow-2xl transition-all duration-300 cursor-pointer ${
            isOpen
              ? 'bg-[#C9A96E] text-[#0A0A0C] border-[#C9A96E]'
              : 'bg-[#121214] text-[#FAF8F5] border-[#2A2A30] hover:border-[#C9A96E]/60 hover:scale-105'
          }`}
          aria-label="Toggle Studio AI Assistant"
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <>
              <X className="w-4 h-4" />
              <span className="text-xs font-mono uppercase tracking-wider font-semibold">Close</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-[#C9A96E]" />
              <span className="text-xs font-mono uppercase tracking-wider">Studio Assistant</span>
            </>
          )}
        </button>
      </div>

      {/* Assistant Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="RMAST Assistant"
          className="fixed bottom-20 right-6 z-50 w-[92vw] max-w-md bg-[#0D0D10] border border-[#27272A] shadow-2xl rounded-sm flex flex-col max-h-[75vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 bg-[#121216] border-b border-[#202026] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-sm bg-[#1A1A22] border border-[#C9A96E]/40 flex items-center justify-center text-[#C9A96E]">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#FAF8F5]">RMAST Assistant</div>
                <div className="text-[10px] font-mono text-[#71717A]">Ask about systems, pricing & AI content</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#71717A] hover:text-[#FAF8F5] p-1 cursor-pointer"
              aria-label="Close assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="p-4 flex-1 overflow-y-auto space-y-3.5 text-xs text-[#E4E4E7]" aria-live="polite">
            {messages.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-3 rounded-sm max-w-[85%] whitespace-pre-line leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#C9A96E] text-[#0A0A0C] font-medium'
                      : 'bg-[#18181D] border border-[#26262E] text-[#D4D4D8]'
                  }`}
                >
                  {m.text}
                </div>

                {m.action && (
                  <button
                    onClick={() => {
                      if (m.action) {
                        navigate(m.action.path);
                        setIsOpen(false);
                      }
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#C9A96E] hover:underline cursor-pointer"
                  >
                    <span>{m.action.label}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            {isThinking && (
              <div className="flex items-start">
                <div className="p-3 rounded-sm bg-[#18181D] border border-[#26262E] text-[#71717A] font-mono animate-pulse">
                  Thinking…
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Question Chips */}
          <div className="px-4 py-2 border-t border-[#1C1C22] bg-[#0A0A0D]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] mb-1.5">Suggested Inquiries:</div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => ask(q)}
                  disabled={isThinking}
                  className="shrink-0 text-[11px] text-[#A1A1AA] hover:text-[#FAF8F5] border border-[#27272A] hover:border-[#C9A96E]/50 px-2.5 py-1 bg-[#121216] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-[#121216] border-t border-[#202026] flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              maxLength={1000}
              placeholder="Ask about systems, pricing, video..."
              aria-label="Your question"
              className="flex-1 bg-[#0A0A0C] border border-[#27272A] px-3 py-2 text-xs text-[#FAF8F5] placeholder-[#71717A] focus:outline-none focus:border-[#C9A96E]"
            />
            <button
              type="submit"
              disabled={isThinking || !inputText.trim()}
              className="p-2 bg-[#C9A96E] text-[#0A0A0C] hover:bg-[#D9B97E] transition-colors cursor-pointer disabled:opacity-50"
              aria-label="Send query"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
