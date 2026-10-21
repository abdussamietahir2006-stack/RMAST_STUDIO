import React, { useState, useRef, useEffect } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useCurrency } from '../../context/CurrencyContext';
import { CONTACT } from '../../config/contact';
import { askAssistant } from '../../lib/api';
import { ASSISTANTS, BOOK_CALL_PATH, FAQ, FREE_AUDIT_PATH, LEAD_RESPONSE_STEPS } from '../../data/assistantsData';
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
  // Show the PDF download buttons under this message
  pdf?: boolean;
}

type Reply = Pick<Message, 'text' | 'action' | 'pdf'>;

const PLANS_CHIP = 'Services & plans (PDF)';
const PROFILE_CHIP = 'Company profile (PDF)';

const quickQuestions = [
  PROFILE_CHIP,
  PLANS_CHIP,
  'What does RMAST do?',
  'What are the three Assistants?',
  'How does the Lead Response System work?',
  'How much does it cost?',
  'How does the free audit work?',
  'How can I book a call?'
];

// The detailed company profile, or the short services & plans sheet
type PdfKind = 'profile' | 'plans';

const PDF_OPTIONS: { kind: PdfKind; label: string }[] = [
  { kind: 'profile', label: 'Company profile' },
  { kind: 'plans', label: 'Services & plans' }
];

// --- Document requests are answered in the browser (no AI call needed) ---
const DOC_WORDS = /\b(pdf|brochure|document|file|download|rate ?card|price ?list|quotation)\b/i;
const SHARE_WORDS = /\b(share|send|bhej|bhejo|de ?do|chahiye)\b/i;
const PROFILE_WORDS = /(portfolio|profile|brochure|company|agency|studio|what (do )?(you|your|rmast)|about (you|your|rmast)|overview|everything|full details|all details|details|introduction|baare|bare mein|kya kart)/i;
const PLANS_WORDS = /(price|pricing|rate|cost|package|budget|quote|quotation|fee|charges|plan|service)/i;

function isDocumentRequest(text: string): boolean {
  return DOC_WORDS.test(text) || (SHARE_WORDS.test(text) && /(portfolio|profile|details|price ?list|plans?)/i.test(text));
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
  if (/(audit|free)/.test(q)) return { label: 'Get a free audit', path: FREE_AUDIT_PATH };
  if (/(price|pricing|cost|budget|package|how much|plan|retainer)/.test(q)) return { label: 'See plans', path: '/plans' };
  if (/(contact|book|consult|call|meet|whatsapp|email|hire)/.test(q)) return { label: 'Book a call', path: BOOK_CALL_PATH };
  if (/(founder|team|who|about|linkedin|abdussamie|mashhood)/.test(q)) return { label: 'Meet the founders', path: '/about' };
  if (/(lead|reply|respon|crm|website|automation|chatbot|software|technical|integration|dashboard)/.test(q))
    return { label: 'See the Technical Assistant', path: '/services/technical-assistant' };
  if (/(content|reel|video|social|instagram|brand|design|logo|film|creative|post)/.test(q))
    return { label: 'See the Creative Assistant', path: '/services/creative-assistant' };
  if (/(admin|transaction|paperwork|calendar|inbox|follow|virtual|assistant|data entry|listing upload)/.test(q))
    return { label: 'See the Virtual Assistant', path: '/services/virtual-assistant' };
  if (/(work|portfolio|case stud|project|sample)/.test(q)) return { label: 'See our work', path: '/work' };
  return { label: 'See the three Assistants', path: '/services' };
}

// Offline answers used when the AI endpoint is unavailable (same content as the website)
function scriptedReply(question: string): Reply {
  const q = question.toLowerCase();

  if (q.includes('linkedin') || q.includes('abdussamie') || q.includes('founder')) {
    return {
      text: `RMAST Studio is founded and led by Raja Muhammad Abdussamie Tahir (Systems Architect & Studio Principal) and Mashhood (Creative Technologist & AI Director). You can view Raja Muhammad Abdussamie Tahir's profile on LinkedIn: ${CONTACT.founderLinkedIn} or reach out directly via WhatsApp.`,
      action: { label: 'Meet the founders', path: '/about' }
    };
  }

  const matched =
    quickQuestions.find((qq) => qq.toLowerCase() === q) ??
    quickQuestions.find((qq) => qq.toLowerCase().includes(q) || q.includes(qq.toLowerCase().slice(0, 10)));
  const faq = (start: string) => FAQ.find((f) => f.q.startsWith(start))?.a ?? '';

  switch (matched) {
    case 'What does RMAST do?':
      return {
        text: 'RMAST Studio gives real estate agents, teams and brokerages a team of Assistants on a monthly retainer. Leads answered in 60 seconds, content that gets seen, and paperwork off your plate. We work with teams in the USA and Canada, and some in Dubai.',
        action: { label: 'See the three Assistants', path: '/services' }
      };
    case 'What are the three Assistants?':
      return {
        text: ASSISTANTS.map((a) => `${a.name}: ${a.tagline} ${a.highlights.join(', ')}.`).join('\n\n'),
        action: { label: 'See the three Assistants', path: '/services' }
      };
    case 'How does the Lead Response System work?':
      return {
        text: `${LEAD_RESPONSE_STEPS.map((s, i) => `${i + 1}. ${s.title}: ${s.text}`).join('\n')}\nIt is part of the Technical Assistant.`,
        action: { label: 'See the Technical Assistant', path: '/services/technical-assistant' }
      };
    case 'How much does it cost?':
      return {
        text: 'We work on a monthly retainer: one Assistant, or the Full Team of all three. Your plan is priced after a free audit, so you only pay for what you need.',
        action: { label: 'Get a free audit', path: FREE_AUDIT_PATH }
      };
    case 'How does the free audit work?':
      return { text: faq('How does the free audit'), action: { label: 'Get a free audit', path: FREE_AUDIT_PATH } };
    case 'How can I book a call?':
      return {
        text: `Book a call on our contact page or message the founders on WhatsApp (${CONTACT.whatsappDisplay}). As a small founder-led team, you work directly with Abdussamie and Mashhood.`,
        action: { label: 'Book a call', path: BOOK_CALL_PATH }
      };
    default:
      return {
        text: 'RMAST Studio gives real estate teams a Technical, Creative and Virtual Assistant on a monthly retainer. The best place to start is a free audit, or message the founders on WhatsApp.',
        action: { label: 'Get a free audit', path: FREE_AUDIT_PATH }
      };
  }
}

let messageCounter = 0;
const nextId = () => `msg-${Date.now()}-${messageCounter++}`;

export const StudioAssistant: React.FC = () => {
  const { navigate } = useNavigation();
  const { currency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'Welcome to RMAST Studio. Ask me about our Technical, Creative and Virtual Assistants, plans, the free audit, or booking a call. Tap the mic to talk to me, or ask for our company profile PDF.'
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
        const { downloadServicesPlansPdf } = await import('../../lib/servicesPlansPdf');
        downloadServicesPlansPdf();
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), sender: 'assistant', text: 'Sorry, the PDF could not be created right now. You can see our services and plans on the website.', action: { label: 'See the three Assistants', path: '/services' } }
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
    const wantsProfile = text === PROFILE_CHIP || (isDocumentRequest(text) && PROFILE_WORDS.test(text) && !PLANS_WORDS.test(text));
    const wantsPlans = text === PLANS_CHIP || (isDocumentRequest(text) && !wantsProfile && PLANS_WORDS.test(text));
    if (wantsProfile) {
      void downloadPdf('profile');
      reply = {
        text: 'Your RMAST Studio company profile is downloading now. It covers the three Assistants in detail, the Lead Response System, how we work, our plans, common questions and the founders. The short services & plans sheet is here too:',
        pdf: true
      };
    } else if (wantsPlans) {
      void downloadPdf('plans');
      reply = {
        text: 'Your services & plans PDF is downloading now. Plans are monthly retainers, priced after a free audit. The full company profile is here too:',
        pdf: true
      };
    } else if (isDocumentRequest(text)) {
      reply = { text: 'Here are our documents. Tap one to download the PDF:', pdf: true };
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
        reply = scriptedReply(text);
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
          className={`h-12 px-3.5 sm:px-4 rounded-full border flex items-center gap-3 shadow-2xl transition-all duration-300 cursor-pointer ${
            isOpen
              ? 'bg-primary text-on-primary border-primary'
              : 'bg-surface text-fg border-line hover:border-primary/60 hover:scale-105'
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
              <Sparkles className="w-4 h-4 text-brand" />
              <span className="hidden sm:inline text-xs font-mono uppercase tracking-wider">Studio Assistant</span>
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
          className="fixed bottom-20 right-6 z-50 w-[92vw] max-w-md bg-surface/95 backdrop-blur-xl border border-line shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8),0_0_0_1px_rgba(232,106,74,0.1)] rounded-xl flex flex-col max-h-[75vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 bg-surface border-b border-line flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-sm bg-surface-2 border border-primary/40 flex items-center justify-center text-brand">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-fg">RMAST Assistant</div>
                <div className="text-xs font-mono text-subtle">
                  {listening ? 'Listening… press Send when done' : speaking ? 'Speaking…' : 'Ask about our Assistants, plans & free audit'}
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
                  className="text-subtle hover:text-fg p-1 cursor-pointer"
                  aria-label={speakReplies ? 'Turn off spoken replies' : 'Turn on spoken replies'}
                  aria-pressed={speakReplies}
                  title={speakReplies ? 'Spoken replies on' : 'Spoken replies off'}
                >
                  {speakReplies ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-subtle hover:text-fg p-1 cursor-pointer"
                aria-label="Close assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs text-fg" aria-live="polite">
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
                      ? 'bg-primary text-on-primary font-medium'
                      : 'bg-surface-2 border border-line text-fg'
                  }`}
                >
                  {msg.text}
                </div>

                {msg.pdf && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {PDF_OPTIONS.map(({ kind, label }) => (
                      <button
                        key={kind}
                        onClick={() => downloadPdf(kind)}
                        disabled={pdfBusy !== null}
                        className="btn btn-secondary inline-flex items-center gap-2 hover:bg-primary/10 cursor-pointer disabled:opacity-50"
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
                    className="mt-2 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-brand hover:underline cursor-pointer"
                  >
                    <span>{msg.action.label}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </m.div>
            ))}
            {isThinking && (
              <div className="flex items-start">
                <div className="p-3 rounded-sm bg-surface-2 border border-line text-subtle font-mono animate-pulse">
                  Thinking…
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Question Chips */}
          <div className="px-4 py-2 border-t border-line bg-surface">
            <div className="text-xs font-mono uppercase tracking-wider text-subtle mb-2">Suggested Inquiries:</div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => ask(q)}
                  disabled={isThinking}
                  className="shrink-0 text-xs text-muted hover:text-fg border border-line hover:border-primary/50 px-3 py-1 bg-surface transition-colors cursor-pointer disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-surface border-t border-line flex items-center gap-2">
            {voiceSupported && (
              <button
                type="button"
                onClick={toggleMic}
                className={`relative p-2 border transition-colors cursor-pointer ${
                  listening
                    ? 'bg-accent border-accent text-on-primary'
                    : speaking
                    ? 'border-primary text-brand'
                    : 'border-line text-muted hover:text-fg hover:border-primary/60'
                }`}
                aria-label={listening ? 'Stop the microphone' : speaking ? 'Stop speaking' : 'Speak your question'}
                aria-pressed={listening}
                title={listening ? 'Stop the microphone (your words stay in the box)' : speaking ? 'Stop speaking' : 'Speak your question, then press Send'}
              >
                {listening && <span className="absolute inset-0 animate-ping bg-accent/40" aria-hidden="true" />}
                {listening || speaking ? <Square className="relative w-3.5 h-3.5 fill-current" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
            )}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              maxLength={1000}
              placeholder={listening ? 'Listening… press Send when you are done' : 'Ask about leads, content, admin...'}
              aria-label="Your question"
              className="flex-1 bg-canvas border border-line px-3 py-2 text-xs text-fg placeholder-subtle focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={isThinking || !inputText.trim()}
              className="p-2 bg-primary text-on-primary hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-50"
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
