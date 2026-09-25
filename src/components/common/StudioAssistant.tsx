import React, { useState, useRef, useEffect } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useCurrency } from '../../context/CurrencyContext';
import { CONTACT } from '../../config/contact';
import { askAssistant } from '../../lib/api';
import type { PriceSheet } from '../../lib/pricePdf';
import { servicesData } from '../../data/servicesData';
import { realEstatePackages, completeBusinessPackages, aiVideoSinglePricing } from '../../data/pricingData';
import { AnimatePresence, m } from 'motion/react';
import { Sparkles, X, Send, ArrowRight, Bot, Mic, Square, Volume2, VolumeX, FileDown } from 'lucide-react';

interface Message {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  action?: {
    label: string;
    path: string;
  };
  // Show the price-list PDF download buttons under this message
  pdf?: boolean;
}

type Reply = Pick<Message, 'text' | 'action' | 'pdf'>;

const PDF_CHIP = 'Download price list (PDF)';
const PROFILE_CHIP = 'Company profile & portfolio (PDF)';

const quickQuestions = [
  PROFILE_CHIP,
  PDF_CHIP,
  'What does RMAST do?',
  'What services are available?',
  'How much does a website cost?',
  'What is included in Real Estate systems?',
  'What industries do you serve for AI content?',
  'How can I book a consultation?',
  'What AI video services are available?'
];

// The company profile, or one of the price lists
type PdfKind = PriceSheet | 'profile';

const PDF_OPTIONS: { kind: PdfKind; label: string }[] = [
  { kind: 'profile', label: 'Company profile' },
  { kind: 'all', label: 'All prices' },
  { kind: 'real-estate', label: 'Real Estate prices' },
  { kind: 'ai-content', label: 'Brands & Content prices' }
];

const SHEET_NAMES: Record<PriceSheet, string> = {
  all: 'complete',
  'real-estate': 'Real Estate',
  'ai-content': 'Brands & Content'
};

// --- Document requests are answered in the browser (no AI call needed) ---
const DOC_WORDS = /\b(pdf|brochure|document|file|download|rate ?card|price ?list|quotation)\b/i;
const SHARE_WORDS = /\b(share|send|bhej|bhejo|de ?do|chahiye)\b/i;
const PROFILE_WORDS = /(portfolio|profile|brochure|company|agency|studio|what (do )?(you|your|rmast)|about (you|your|rmast)|overview|everything|full details|all details|details|introduction|baare|bare mein|kya kart)/i;
const PRICE_WORDS = /(price|pricing|rate|cost|package|budget|quote|quotation|fee|charges)/i;

function isDocumentRequest(text: string): boolean {
  return DOC_WORDS.test(text) || (SHARE_WORDS.test(text) && /(portfolio|profile|details|price ?list)/i.test(text));
}

function requestedSheet(q: string): PriceSheet | null {
  const text = q.toLowerCase();
  const realEstate = /(real ?estate|property|broker|crm|website|web development)/.test(text);
  const content = /(content|brand|video|fashion|food|product|film)/.test(text);
  if (/\b(all|every|complete|both|full|whole)\b/.test(text) || (realEstate && content)) return 'all';
  if (realEstate) return 'real-estate';
  if (content) return 'ai-content';
  return null;
}

// --- Browser speech APIs (typed locally: not every TypeScript DOM lib ships them) ---
interface RecognitionResultList {
  length: number;
  [index: number]: { isFinal: boolean; 0: { transcript: string } };
}
interface Recognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { resultIndex: number; results: RecognitionResultList }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
type RecognitionCtor = new () => Recognition;

const getRecognition = (): RecognitionCtor | undefined => {
  if (typeof window === 'undefined') return undefined;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
};

const speechLang = () => (typeof navigator !== 'undefined' && navigator.language) || 'en-US';

// Links and symbols read badly aloud
const forSpeech = (text: string) =>
  text
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[→•✦*#_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

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

// Offline answers used when the AI endpoint is unavailable (prices read from the same data as the pages)
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

  const web = servicesData.find((s) => s.slug === 'web-development');
  const webTiers = web?.tiers?.map((t) => `${t.name} ${format(t.priceUSD)}`).join(', ');

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
        text: `Our custom Real Estate Websites come in three tiers: ${webTiers}. Every site includes a responsive multi-page design, WhatsApp lead capture, technical SEO, and 1 month of free maintenance. Hourly work is ${format(web?.hourlyRateUSD?.min ?? 10)}–${format(web?.hourlyRateUSD?.max ?? 15)} per hour.`,
        action: { label: 'View Pricing & Add-ons', path: '/pricing' }
      };
    case 'What is included in Real Estate systems?':
      return {
        text: `We engineer the full deal cycle: Lead capture → Conversational AI qualification → Multi-stage CRM → Automated WhatsApp/email follow-up → Calendar booking → Deal closure. Packages range from Starter (${format(realEstatePackages[0].priceUSD)}) to complete Digital Operating Systems (${format(completeBusinessPackages[completeBusinessPackages.length - 1].priceUSD)}+).`,
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
        text: `Individual AI videos: ${aiVideoSinglePricing.map((v) => `${v.tier} ${format(v.priceUSD)}`).join(', ')}. Monthly packages of 10, 20, or 30 videos offer up to 24% in savings.`,
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
      text: 'Welcome to RMAST Studio. Ask me about our Real Estate Digital Systems, AI Content Studio, pricing, or booking a founder consultation. Tap the mic to talk to me, or ask for a price list PDF.'
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice state
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [speakReplies, setSpeakReplies] = useState(true);
  const [pdfBusy, setPdfBusy] = useState<PdfKind | null>(null);
  const recognitionRef = useRef<Recognition | null>(null);
  // Dictation: speech is typed into the box and only sent when the visitor presses Send.
  // dictatingRef = the visitor wants the mic on (pauses restart it instead of ending it);
  // spokenRef = the current message was dictated, so its reply is read aloud.
  const dictatingRef = useRef(false);
  const spokenRef = useRef(false);
  const inputTextRef = useRef(inputText);
  inputTextRef.current = inputText;
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;
  const speakRepliesRef = useRef(speakReplies);
  speakRepliesRef.current = speakReplies;

  useEffect(() => {
    // Detected after mount so the prerendered HTML matches the first client render
    setVoiceSupported(Boolean(getRecognition()));
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isThinking]);

  const stopVoice = () => {
    dictatingRef.current = false;
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    recognition?.abort();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    setListening(false);
    setSpeaking(false);
  };

  // Closing the panel (or leaving the page) ends any conversation
  useEffect(() => {
    if (!isOpen) stopVoice();
  }, [isOpen]);
  useEffect(() => stopVoice, []);

  const speak = (text: string, then?: () => void) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !speakRepliesRef.current) {
      then?.();
      return;
    }
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(forSpeech(text));
    const lang = speechLang();
    utterance.lang = lang;
    const voice =
      synth.getVoices().find((v) => v.lang === lang) ?? synth.getVoices().find((v) => v.lang.startsWith(lang.split('-')[0]));
    if (voice) utterance.voice = voice;
    utterance.rate = 1.02;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = utterance.onerror = () => {
      setSpeaking(false);
      then?.();
    };
    synth.speak(utterance);
  };

  const downloadPdf = async (kind: PdfKind) => {
    setPdfBusy(kind);
    try {
      if (kind === 'profile') {
        const { downloadCompanyProfilePdf } = await import('../../lib/companyProfilePdf');
        downloadCompanyProfilePdf();
      } else {
        const { downloadPriceListPdf } = await import('../../lib/pricePdf');
        downloadPriceListPdf(kind);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), sender: 'assistant', text: 'Sorry, the PDF could not be created right now. You can see every price on the Pricing page.', action: { label: 'View Pricing', path: '/pricing' } }
      ]);
    } finally {
      setPdfBusy(null);
    }
  };

  const ask = async (question: string, viaVoice = false) => {
    const text = question.trim();
    if (!text || isThinking) return;

    const userMsg: Message = { id: nextId(), sender: 'user', text };
    const history = [...messages, userMsg];
    setMessages(history);

    let reply: Reply;
    const wantsProfile = text === PROFILE_CHIP || (isDocumentRequest(text) && PROFILE_WORDS.test(text) && !PRICE_WORDS.test(text));
    const wantsPrices = text === PDF_CHIP || (isDocumentRequest(text) && !wantsProfile);
    if (wantsProfile) {
      void downloadPdf('profile');
      reply = {
        text: 'Your RMAST Studio company profile is downloading now. It covers who we are, both divisions, every service in detail, our portfolio, how we work, the founders, packages and how to get in touch. Price lists are here too:',
        pdf: true
      };
    } else if (wantsPrices) {
      const sheet = text === PDF_CHIP || !PRICE_WORDS.test(text) ? null : requestedSheet(text);
      if (sheet) void downloadPdf(sheet);
      reply = {
        text: sheet
          ? `Your ${SHEET_NAMES[sheet]} price list PDF is downloading now, with prices in USD and AED. You can also download these:`
          : 'Here are our documents (prices in USD and AED). Tap one to download the PDF:',
        pdf: true
      };
    } else {
      setIsThinking(true);
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
      setIsThinking(false);
    }

    setMessages((prev) => [...prev, { id: nextId(), sender: 'assistant', ...reply }]);

    if (viaVoice) {
      // Answer aloud, then open the mic for the next question (it still waits for Send)
      speak(reply.text, () => {
        if (isOpenRef.current && !recognitionRef.current) startListening();
      });
    }
  };

  // Starts dictation into the input box. Browsers end recognition after a pause; while the
  // visitor still wants the mic on, it is restarted, so a pause never sends or cuts off a message.
  const startListening = () => {
    const Ctor = getRecognition();
    if (!Ctor) return;
    recognitionRef.current?.abort();
    const recognition = new Ctor();
    recognition.lang = speechLang();
    recognition.interimResults = true;
    recognition.continuous = true;
    const before = inputTextRef.current.trim();
    let heard = false;

    recognition.onresult = (e) => {
      if (recognitionRef.current !== recognition) return;
      let spoken = '';
      for (let i = 0; i < e.results.length; i++) spoken += e.results[i][0].transcript;
      spoken = spoken.trim();
      if (!spoken) return;
      heard = true;
      spokenRef.current = true;
      setInputText(before ? `${before} ${spoken}` : spoken);
    };
    recognition.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        dictatingRef.current = false;
        setMessages((prev) => [
          ...prev,
          { id: nextId(), sender: 'assistant', text: 'I could not use your microphone. Please allow microphone access for this site in your browser, then tap the mic again.' }
        ]);
      }
    };
    recognition.onend = () => {
      if (recognitionRef.current !== recognition) return;
      recognitionRef.current = null;
      // Keep listening through pauses; a stretch with no speech at all turns the mic off
      if (dictatingRef.current && heard && isOpenRef.current) {
        startListening();
        return;
      }
      dictatingRef.current = false;
      setListening(false);
    };

    dictatingRef.current = true;
    recognitionRef.current = recognition;
    setListening(true);
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      dictatingRef.current = false;
      setListening(false);
    }
  };

  // Stops the mic; words already heard stay in the box (a last result may still arrive)
  const stopListening = () => {
    dictatingRef.current = false;
    recognitionRef.current?.stop();
    setListening(false);
  };

  const toggleMic = () => {
    if (listening) {
      stopListening();
      return;
    }
    if (speaking) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    startListening();
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText;
    const viaVoice = spokenRef.current;
    spokenRef.current = false;
    // Sending ends dictation; anything the mic hears afterwards is ignored
    dictatingRef.current = false;
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    recognition?.abort();
    setListening(false);
    setInputText('');
    ask(text, viaVoice);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`h-12 px-4 rounded-full border flex items-center gap-2.5 shadow-2xl transition-all duration-300 cursor-pointer ${
            isOpen
              ? 'bg-[#A68BFF] text-[#0A0A0C] border-[#A68BFF]'
              : 'bg-[#121214] text-[#FAF8F5] border-[#2A2A30] hover:border-[#A68BFF]/60 hover:scale-105'
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
              <Sparkles className="w-4 h-4 text-[#A68BFF]" />
              <span className="text-xs font-mono uppercase tracking-wider">Studio Assistant</span>
            </>
          )}
        </button>
      </div>

      {/* Assistant Window */}
      <AnimatePresence>
      {isOpen && (
        <m.div
          role="dialog"
          aria-label="RMAST Assistant"
          initial={{ opacity: 0, y: 24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          style={{ transformOrigin: 'bottom right' }}
          className="fixed bottom-20 right-6 z-50 w-[92vw] max-w-md bg-[#0D0D10]/95 backdrop-blur-xl border border-[#2A2A34] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8),0_0_0_1px_rgba(166,139,255,0.1)] rounded-xl flex flex-col max-h-[75vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 bg-[#121216] border-b border-[#202026] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-sm bg-[#1A1A22] border border-[#A68BFF]/40 flex items-center justify-center text-[#A68BFF]">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#FAF8F5]">RMAST Assistant</div>
                <div className="text-[10px] font-mono text-[#71717A]">
                  {listening ? 'Listening… press Send when done' : speaking ? 'Speaking…' : 'Ask about systems, pricing & AI content'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {voiceSupported && (
                <button
                  onClick={() => {
                    if (speakReplies && typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
                    setSpeakReplies(!speakReplies);
                  }}
                  className="text-[#71717A] hover:text-[#FAF8F5] p-1 cursor-pointer"
                  aria-label={speakReplies ? 'Turn off spoken replies' : 'Turn on spoken replies'}
                  aria-pressed={speakReplies}
                  title={speakReplies ? 'Spoken replies on' : 'Spoken replies off'}
                >
                  {speakReplies ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#71717A] hover:text-[#FAF8F5] p-1 cursor-pointer"
                aria-label="Close assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="p-4 flex-1 overflow-y-auto space-y-3.5 text-xs text-[#E4E4E7]" aria-live="polite">
            {messages.map((msg) => (
              <m.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 rounded-sm max-w-[85%] whitespace-pre-line leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#A68BFF] text-[#0A0A0C] font-medium'
                      : 'bg-[#18181D] border border-[#26262E] text-[#D4D4D8]'
                  }`}
                >
                  {msg.text}
                </div>

                {msg.pdf && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {PDF_OPTIONS.map(({ kind, label }) => (
                      <button
                        key={kind}
                        onClick={() => downloadPdf(kind)}
                        disabled={pdfBusy !== null}
                        className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider px-2.5 py-1.5 border border-[#A68BFF]/40 text-[#A68BFF] hover:bg-[#A68BFF]/10 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>{pdfBusy === kind ? 'Preparing…' : label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {msg.action && (
                  <button
                    onClick={() => {
                      if (msg.action) {
                        navigate(msg.action.path);
                        setIsOpen(false);
                      }
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#A68BFF] hover:underline cursor-pointer"
                  >
                    <span>{msg.action.label}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </m.div>
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
                  className="shrink-0 text-[11px] text-[#A1A1AA] hover:text-[#FAF8F5] border border-[#27272A] hover:border-[#A68BFF]/50 px-2.5 py-1 bg-[#121216] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-[#121216] border-t border-[#202026] flex items-center gap-2">
            {voiceSupported && (
              <button
                type="button"
                onClick={toggleMic}
                className={`relative p-2 border transition-colors cursor-pointer ${
                  listening
                    ? 'bg-[#FF5CAA] border-[#FF5CAA] text-[#0A0A0C]'
                    : speaking
                    ? 'border-[#A68BFF] text-[#A68BFF]'
                    : 'border-[#27272A] text-[#A1A1AA] hover:text-[#FAF8F5] hover:border-[#A68BFF]/60'
                }`}
                aria-label={listening ? 'Stop the microphone' : speaking ? 'Stop speaking' : 'Speak your question'}
                aria-pressed={listening}
                title={listening ? 'Stop the microphone (your words stay in the box)' : speaking ? 'Stop speaking' : 'Speak your question, then press Send'}
              >
                {listening && <span className="absolute inset-0 animate-ping bg-[#FF5CAA]/40" aria-hidden="true" />}
                {listening || speaking ? <Square className="relative w-3.5 h-3.5 fill-current" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
            )}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              maxLength={1000}
              placeholder={listening ? 'Listening… press Send when you are done' : 'Ask about systems, pricing, video...'}
              aria-label="Your question"
              className="flex-1 bg-[#0A0A0C] border border-[#27272A] px-3 py-2 text-xs text-[#FAF8F5] placeholder-[#71717A] focus:outline-none focus:border-[#A68BFF]"
            />
            <button
              type="submit"
              disabled={isThinking || !inputText.trim()}
              className="p-2 bg-[#A68BFF] text-[#0A0A0C] hover:bg-[#BBA6FF] transition-colors cursor-pointer disabled:opacity-50"
              aria-label="Send query"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </m.div>
      )}
      </AnimatePresence>
    </>
  );
};
