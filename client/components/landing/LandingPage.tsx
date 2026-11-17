"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ArrowRight, 
  Lock, 
  ShieldCheck, 
  Zap, 
  Radio, 
  Smartphone, 
  Laptop, 
  CheckCircle2, 
  FileText, 
  EyeOff, 
  MessageSquare, 
  Key, 
  Globe, 
  X,
  ChevronRight,
  Sparkles,
  Phone,
  PhoneCall,
  Video,
  Mic,
  Send,
  Check,
  CheckCheck,
  Clock,
  Users,
  MapPin,
  Play,
  Pause,
  Volume2,
  Paperclip,
  Smile,
  Camera,
  RefreshCw,
  Eye,
  ShieldAlert,
  Server
} from "lucide-react";
import AuthPage from "../auth/AuthPage";

function GithubIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

// -------------------------------------------------------------
// Interactive Stageshow Simulator Types
// -------------------------------------------------------------
interface DemoMessage {
  id: string;
  sender: "me" | "peer";
  text: string;
  time: string;
  status: "sent" | "delivered" | "read";
  isVoice?: boolean;
}

export default function LandingPage() {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [modalContent, setModalContent] = useState<"privacy" | "terms" | "security" | null>(null);

  // -----------------------------------------------------------
  // Stageshow Hero UI State (Screenshot & Live Demo)
  // -----------------------------------------------------------
  const [deviceFrame, setDeviceFrame] = useState<"desktop" | "mobile">("desktop");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isTypingPeer, setIsTypingPeer] = useState(false);
  const [simulatedCallActive, setSimulatedCallActive] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isChatAutoPlaying, setIsChatAutoPlaying] = useState(true);
  const [isUserTypingSim, setIsUserTypingSim] = useState(false);
  const [isSendPulsing, setIsSendPulsing] = useState(false);
  const [audioSeconds, setAudioSeconds] = useState(14);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [demoMessages, setDemoMessages] = useState<DemoMessage[]>([
    {
      id: "1",
      sender: "peer",
      text: "Hey Alex! Did you verify the new Curve25519 E2EE key exchange?",
      time: "10:14 PM",
      status: "read",
    },
    {
      id: "2",
      sender: "me",
      text: "Yes, verified! Sub-24ms dispatch over WebSockets with zero plain-text leaks ⚡",
      time: "10:15 PM",
      status: "read",
    },
    {
      id: "3",
      sender: "peer",
      text: "Voice note regarding deployment architecture audio note",
      time: "10:16 PM",
      status: "read",
      isVoice: true,
    },
    {
      id: "4",
      sender: "me",
      text: "All 8 ERD MongoDB models and TTL indices are passing 100%. Ready for screenshot! 🚀",
      time: "10:17 PM",
      status: "read",
    },
  ]);

  // Keep message scroll pinned to latest bubble
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [demoMessages, isTypingPeer]);

  // Autonomous Stageshow Typing & Messaging Simulation Loop
  useEffect(() => {
    if (!isChatAutoPlaying) return;

    let isCancelled = false;
    let timeoutId: NodeJS.Timeout | null = null;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timeoutId = setTimeout(() => resolve(), ms);
      });

    const typeText = async (text: string) => {
      setIsUserTypingSim(true);
      setInputMessage("");
      for (let i = 0; i < text.length; i++) {
        if (isCancelled) return false;
        setInputMessage(text.slice(0, i + 1));
        await wait(30 + Math.floor(Math.random() * 25));
      }
      if (isCancelled) return false;
      await wait(300);
      return true;
    };

    const runSimulationLoop = async () => {
      while (!isCancelled) {
        // Phase 1: Reset conversation to initial state
        setDemoMessages([
          {
            id: "m1",
            sender: "peer",
            text: "Hey Alex! Did you verify the new Curve25519 E2EE key exchange?",
            time: "10:14 PM",
            status: "read",
          },
        ]);
        setInputMessage("");
        setIsTypingPeer(false);
        setIsPlayingAudio(false);
        setAudioSeconds(14);
        setIsUserTypingSim(false);

        if (isCancelled) break;
        await wait(1200);

        // Phase 2: User types first response
        const typed1 = await typeText("Yes, verified! Sub-24ms dispatch over WebSockets with zero plain-text leaks ⚡");
        if (!typed1 || isCancelled) break;

        // Phase 3: Pulse send button & pop message into thread with Sent status
        setIsSendPulsing(true);
        await wait(160);
        setIsSendPulsing(false);
        setInputMessage("");
        setIsUserTypingSim(false);

        const msg2Id = "m2";
        setDemoMessages((prev) => [
          ...prev,
          {
            id: msg2Id,
            sender: "me",
            text: "Yes, verified! Sub-24ms dispatch over WebSockets with zero plain-text leaks ⚡",
            time: "10:15 PM",
            status: "sent",
          },
        ]);

        if (isCancelled) break;
        await wait(600);

        // Delivered receipt
        setDemoMessages((prev) =>
          prev.map((m) => (m.id === msg2Id ? { ...m, status: "delivered" } : m))
        );

        if (isCancelled) break;
        await wait(600);

        // Read receipt
        setDemoMessages((prev) =>
          prev.map((m) => (m.id === msg2Id ? { ...m, status: "read" } : m))
        );

        if (isCancelled) break;
        await wait(800);

        // Phase 4: Sarah starts typing (peer status in header + 3-dot bubble)
        setIsTypingPeer(true);
        if (isCancelled) break;
        await wait(2200);
        setIsTypingPeer(false);

        // Phase 5: Sarah's Opus voice note appears
        const msg3Id = "m3";
        setDemoMessages((prev) => [
          ...prev,
          {
            id: msg3Id,
            sender: "peer",
            text: "Voice note regarding deployment architecture audio note",
            time: "10:16 PM",
            status: "read",
            isVoice: true,
          },
        ]);

        if (isCancelled) break;
        await wait(800);

        // Phase 6: Voice note automatically plays with animated equalizer & timer
        setIsPlayingAudio(true);
        for (let s = 14; s <= 20; s++) {
          if (isCancelled) break;
          setAudioSeconds(s);
          await wait(600);
        }
        setIsPlayingAudio(false);

        if (isCancelled) break;
        await wait(900);

        // Phase 7: User types second message
        const typed2 = await typeText("All 8 ERD MongoDB models and TTL indices are passing 100%. Ready for screenshot! 🚀");
        if (!typed2 || isCancelled) break;

        // Pulse send button
        setIsSendPulsing(true);
        await wait(160);
        setIsSendPulsing(false);
        setInputMessage("");
        setIsUserTypingSim(false);

        const msg4Id = "m4";
        setDemoMessages((prev) => [
          ...prev,
          {
            id: msg4Id,
            sender: "me",
            text: "All 8 ERD MongoDB models and TTL indices are passing 100%. Ready for screenshot! 🚀",
            time: "10:17 PM",
            status: "sent",
          },
        ]);

        if (isCancelled) break;
        await wait(600);

        // Delivered
        setDemoMessages((prev) =>
          prev.map((m) => (m.id === msg4Id ? { ...m, status: "delivered" } : m))
        );

        if (isCancelled) break;
        await wait(600);

        // Read
        setDemoMessages((prev) =>
          prev.map((m) => (m.id === msg4Id ? { ...m, status: "read" } : m))
        );

        if (isCancelled) break;
        // Hold for 7 seconds so the user can comfortably view and take screenshots
        await wait(7000);
      }
    };

    runSimulationLoop();

    return () => {
      isCancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isChatAutoPlaying]);

  // -----------------------------------------------------------
  // Stageshow Component Tile States
  // -----------------------------------------------------------
  const [authStep, setAuthStep] = useState<1 | 2 | 3 | 4>(1);
  const [isAuthAutoPlaying, setIsAuthAutoPlaying] = useState(true);

  // Auto-cycle auth steps for subtle motion without chaos
  useEffect(() => {
    if (!isAuthAutoPlaying) return;
    const interval = setInterval(() => {
      setAuthStep((prev) => (prev >= 4 ? 1 : ((prev + 1) as 1 | 2 | 3 | 4)));
    }, 3600);
    return () => clearInterval(interval);
  }, [isAuthAutoPlaying]);

  const handleSendDemoMessage = () => {
    if (!inputMessage.trim()) return;
    setIsChatAutoPlaying(false);
    const newMsgId = Date.now().toString();
    const newMsg: DemoMessage = {
      id: newMsgId,
      sender: "me",
      text: inputMessage.trim(),
      time: "Just now",
      status: "sent",
    };
    setDemoMessages((prev) => [...prev, newMsg]);
    setInputMessage("");

    // Simulate delivery tick progression: sent -> delivered -> read
    setTimeout(() => {
      setDemoMessages((prev) =>
        prev.map((m) => (m.id === newMsgId ? { ...m, status: "delivered" } : m))
      );
    }, 600);

    setTimeout(() => {
      setDemoMessages((prev) =>
        prev.map((m) => (m.id === newMsgId ? { ...m, status: "read" } : m))
      );
      // Trigger peer typing response
      setIsTypingPeer(true);
      setTimeout(() => {
        setIsTypingPeer(false);
        setDemoMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "peer",
            text: "Got it! Encrypted with AES-256-GCM. Crystal clear! 👍",
            time: "Just now",
            status: "read",
          },
        ]);
      }, 1800);
    }, 1300);
  };

  const handleLoginClick = () => {
    setAuthMode("login");
    setShowAuth(true);
  };

  const handleGetStartClick = () => {
    setAuthMode("register");
    setShowAuth(true);
  };

  if (showAuth) {
    return <AuthPage />;
  }

  return (
    <div 
      className="min-h-screen bg-[#0b141a] text-[#e9edef] flex flex-col font-sans selection:bg-[#00a884]/30 selection:text-white relative overflow-x-hidden"
      style={{
        backgroundImage: "linear-gradient(rgba(11, 20, 26, 0.86), rgba(11, 20, 26, 0.94)), url('/chat-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed"
      }}
    >
      {/* ======================================================== */}
      {/* WHATSAPP WEB BRAND TOP HEADER BAR */}
      {/* ======================================================== */}
      <header className="h-20 bg-[#111b21] border-b border-white/[0.08] px-4 sm:px-8 lg:px-12 flex items-center justify-between z-30 sticky top-0 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-3">
          <div className="flex items-center cursor-pointer" onClick={() => setShowAuth(false)}>
            <img
              src="/logo-main.svg"
              alt="EchoChat Logo"
              className="h-8 sm:h-10 w-auto object-contain"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <button
            onClick={handleLoginClick}
            className="px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-medium text-[#e9edef] hover:bg-white/[0.08] border border-white/10 transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a884]"
            aria-label="Login to EchoChat"
          >
            Login
          </button>
          <button
            onClick={handleGetStartClick}
            className="px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-[#00a884] hover:bg-[#02906f] active:bg-[#017a5e] shadow-[0_2px_12px_rgba(0,168,132,0.35)] transition-all duration-150 active:scale-[0.98] flex items-center gap-1.5 sm:gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a884]"
            aria-label="Get Started with EchoChat"
          >
            <span>Get Started</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* MAIN CONTAINER */}
      {/* ======================================================== */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 lg:p-10 z-20 max-w-7xl mx-auto w-full">
        
        {/* ======================================================== */}
        {/* HERO SECTION: WhatsApp-Style Central Card */}
        {/* ======================================================== */}
        <section className="w-full bg-[#111b21]/95 backdrop-blur-2xl border border-white/[0.08] rounded-2xl sm:rounded-3xl shadow-[0_30px_70px_-15px_rgba(0,0,0,0.85)] overflow-hidden my-3 sm:my-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 p-5 sm:p-8 lg:p-12 items-center">
            
            {/* Left Column: Numbered WhatsApp Instructions & CTAs */}
            <div className="lg:col-span-7 flex flex-col gap-5 sm:gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00a884]/15 border border-[#00a884]/30 text-[#00a884] text-xs font-semibold uppercase tracking-wider mb-3">
                  <Sparkles size={13} />
                  <span>Simple • Private • Real-Time</span>
                </div>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-[#e9edef] tracking-tight leading-[1.2]">
                  Use EchoChat on your computer
                </h1>
                <p className="text-xs sm:text-sm lg:text-base text-[#8696a0] mt-2.5 leading-relaxed max-w-xl">
                  Connect with friends, family, and teams with lightning-fast delivery. Protected by client-side encryption and zero-knowledge privacy.
                </p>
              </div>

              {/* Numbered Steps */}
              <ol className="space-y-3.5 text-xs sm:text-sm text-[#d1d7db]">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#202c33] border border-white/10 text-[#00a884] font-bold text-xs flex items-center justify-center mt-0.5 shadow-sm">
                    1
                  </span>
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">Open EchoChat in any modern browser</span>
                    <span className="text-[11px] sm:text-xs text-[#8696a0]">Access your conversations on web, desktop, and mobile devices simultaneously.</span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#202c33] border border-white/10 text-[#00a884] font-bold text-xs flex items-center justify-center mt-0.5 shadow-sm">
                    2
                  </span>
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">Instant passwordless email verification (OTP)</span>
                    <span className="text-[11px] sm:text-xs text-[#8696a0]">Sign in securely with one-time security codes dispatched directly to your inbox.</span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#202c33] border border-white/10 text-[#00a884] font-bold text-xs flex items-center justify-center mt-0.5 shadow-sm">
                    3
                  </span>
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">End-to-end encrypted messaging</span>
                    <span className="text-[11px] sm:text-xs text-[#8696a0]">Exchange encrypted chats, voice notes, files, and video calls in sub-24ms realtime.</span>
                  </div>
                </li>
              </ol>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleGetStartClick}
                  className="px-6 py-2.5 sm:px-7 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#00a884] hover:bg-[#02906f] active:bg-[#017a5e] shadow-[0_4px_16px_rgba(0,168,132,0.4)] transition-all duration-150 active:scale-[0.98] flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a884]"
                >
                  <span>Get Started</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={handleLoginClick}
                  className="px-6 py-2.5 sm:px-7 sm:py-3 rounded-xl text-xs sm:text-sm font-medium text-[#e9edef] bg-[#202c33] hover:bg-[#2a3942] border border-white/10 transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a884]"
                >
                  Login to Account
                </button>
              </div>

              {/* Security Banner */}
              <div className="pt-3 border-t border-white/[0.08] flex items-center gap-2 text-[11px] sm:text-xs text-[#8696a0]">
                <ShieldCheck size={16} className="text-[#00a884] flex-shrink-0" />
                <span>End-to-end encrypted • Your messages, calls, and media stay strictly private between you and recipients.</span>
              </div>
            </div>

            {/* Right Column: Transparent Phone Showcase (No White Box!) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-full max-w-[340px] sm:max-w-[380px] rounded-2xl bg-[#0c1317]/85 border border-white/[0.08] p-5 sm:p-6 shadow-2xl flex items-center justify-center group overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,168,132,0.12),_transparent_70%)] pointer-events-none" />

                <img
                  src="/landing-page.svg"
                  alt="EchoChat WhatsApp Interface"
                  className="w-full h-auto object-contain max-h-[420px] drop-shadow-[0_20px_35px_rgba(0,0,0,0.7)] group-hover:scale-[1.02] transition-transform duration-300"
                />
              </div>

              {/* Platform Badges */}
              <div className="mt-3.5 flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs text-[#8696a0]">
                <span className="flex items-center gap-1.5">
                  <Laptop size={13} className="text-[#00a884]" />
                  <span>Desktop & Web</span>
                </span>
                <span className="text-white/20">•</span>
                <span className="flex items-center gap-1.5">
                  <Smartphone size={13} className="text-[#00a884]" />
                  <span>iOS & Android</span>
                </span>
                <span className="text-white/20">•</span>
                <span className="flex items-center gap-1.5">
                  <Zap size={13} className="text-[#00a884]" />
                  <span>Realtime WebSockets</span>
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* ======================================================== */}
        {/* STAGESHOW ART-DIRECTED BENTO GRID: PRODUCT BLUEPRINT */}
        {/* Rules: One Hero, Contrast Neighbors, Big Type Stat Tiles */}
        {/* ======================================================== */}
        <section className="w-full my-6 sm:my-10">
          
          {/* Section Lead Copy */}
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00a884]/15 border border-[#00a884]/30 text-[#00a884] text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles size={13} />
              <span>Stageshow Product UI & System Blueprint</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#e9edef] tracking-tight">
              Engineered for Speed. Built for Privacy.
            </h2>
            <p className="text-xs sm:text-sm text-[#8696a0] mt-2 leading-relaxed">
              Explore passwordless authentication, end-to-end encrypted message workflows, and real-time multimodal capabilities directly from this live animated simulator.
            </p>
          </div>

          {/* ====================================================== */}
          {/* BENTO GRID (Responsive 12-Column Layout) */}
          {/* ====================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6">
            
            {/* ---------------------------------------------------- */}
            {/* ROW 1 - TILE 1: HERO UI (Live Chat Simulator) */}
            {/* Span: 8 cols on desktop, full width on mobile/tablet */}
            {/* ---------------------------------------------------- */}
            <div className="lg:col-span-8 p-5 sm:p-7 rounded-3xl bg-[#111b21]/90 border border-white/[0.08] hover:border-[#00a884]/40 transition-all duration-200 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(ellipse_at_top_right,_rgba(0,168,132,0.1),_transparent_70%)] pointer-events-none" />

              <div>
                {/* Header with Stageshow Run-in Copy and Frame Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                      Live Chat Simulator
                    </h3>
                    <p className="text-xs text-[#8696a0] mt-0.5">
                      <strong className="text-[#e9edef] font-semibold">Sub-24ms delivery.</strong> Encrypted message bubbles with live read receipts and voice notes.
                    </p>
                  </div>

                  {/* Auto Simulation Toggle & Device Framing */}
                  <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                    <button
                      onClick={() => setIsChatAutoPlaying((prev) => !prev)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition flex items-center gap-1.5 ${
                        isChatAutoPlaying 
                          ? "bg-[#00a884]/15 border-[#00a884]/40 text-[#00a884] shadow-sm" 
                          : "bg-[#202c33] border-white/10 text-[#8696a0] hover:text-white"
                      }`}
                      title={isChatAutoPlaying ? "Pause simulation for screenshots" : "Resume autonomous typing simulation"}
                    >
                      {isChatAutoPlaying ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-ping" />
                          <Pause size={12} />
                          <span>Simulation Active</span>
                        </>
                      ) : (
                        <>
                          <Play size={12} />
                          <span>Play Simulation</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1 bg-[#0b141a] p-1 rounded-xl border border-white/10">
                      <button
                        onClick={() => setDeviceFrame("desktop")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                          deviceFrame === "desktop" ? "bg-[#202c33] text-white shadow-sm" : "text-[#8696a0] hover:text-white"
                        }`}
                        title="Desktop view mode"
                      >
                        <Laptop size={13} />
                        <span className="hidden sm:inline">Desktop Frame</span>
                      </button>
                      <button
                        onClick={() => setDeviceFrame("mobile")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                          deviceFrame === "mobile" ? "bg-[#202c33] text-white shadow-sm" : "text-[#8696a0] hover:text-white"
                        }`}
                        title="Mobile view mode"
                      >
                        <Smartphone size={13} />
                        <span className="hidden sm:inline">Mobile Frame</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* THE SIMULATED CHAT WINDOW (Screen-Shot Ready Frame) */}
                <div className={`mx-auto transition-all duration-300 rounded-2xl bg-[#0b141a] border border-white/10 shadow-2xl overflow-hidden flex flex-col ${
                  deviceFrame === "mobile" ? "max-w-[340px]" : "w-full"
                }`}>
                  
                  {/* Chat Mock Header */}
                  <div className="bg-[#1e293b]/90 px-4 py-3 border-b border-white/[0.08] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#00a884] to-[#06b6d4] flex items-center justify-center font-bold text-white text-xs shadow-md">
                          SJ
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00a884] ring-2 ring-[#1e293b]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">Sarah Jenkins</span>
                        {isTypingPeer ? (
                          <span className="text-[10px] text-[#00a884] font-medium flex items-center gap-1 animate-pulse">
                            typing...
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#00a884] font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-pulse" />
                            Online • E2EE Verified
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Header Action Buttons */}
                    <div className="flex items-center gap-2 text-[#8696a0]">
                      <button 
                        onClick={() => setSimulatedCallActive((p) => !p)} 
                        className={`p-1.5 rounded-lg transition ${simulatedCallActive ? "bg-[#00a884]/20 text-[#00a884]" : "hover:text-white hover:bg-white/10"}`}
                        title="Simulate WebRTC HD Voice Call"
                      >
                        <Phone size={14} />
                      </button>
                      <button 
                        onClick={() => setSimulatedCallActive((p) => !p)} 
                        className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition"
                        title="Simulate Video Call"
                      >
                        <Video size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Calling Overlay Banner (If Active) */}
                  {simulatedCallActive && (
                    <div className="bg-[#00a884]/15 border-b border-[#00a884]/30 px-4 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-[#00a884]">
                        <PhoneCall size={14} className="animate-bounce" />
                        <span className="font-semibold">WebRTC Call Active: 00:24</span>
                        <span className="text-[10px] text-white/60">• 48kHz Opus Audio</span>
                      </div>
                      <button 
                        onClick={() => setSimulatedCallActive(false)} 
                        className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 text-[10px] font-bold"
                      >
                        End Call
                      </button>
                    </div>
                  )}

                  {/* Message Stream */}
                  <div 
                    className="p-4 space-y-3 min-h-[220px] max-h-[280px] overflow-y-auto"
                    style={{
                      backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
                      backgroundSize: "16px 16px"
                    }}
                  >
                    {demoMessages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex animate-pop-bubble ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed relative shadow-md transition-all ${
                          msg.sender === "me" 
                            ? "bg-[#005c4b] text-[#e9edef] rounded-tr-none" 
                            : "bg-[#202c33] text-[#e9edef] rounded-tl-none border border-white/[0.05]"
                        }`}>
                          {msg.isVoice ? (
                            <div className="flex items-center gap-2.5 py-1 w-52 sm:w-60">
                              <button 
                                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                                className="w-8 h-8 rounded-full bg-[#00a884] text-white flex items-center justify-center shadow flex-shrink-0 hover:scale-105 active:scale-95 transition"
                                title={isPlayingAudio ? "Pause Opus audio" : "Play Opus audio"}
                              >
                                {isPlayingAudio ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
                              </button>
                              <div className="flex-1 flex flex-col gap-1">
                                <div className="flex items-center gap-1 h-5">
                                  {[40, 75, 30, 95, 60, 100, 45, 85, 55, 90, 35, 80, 45].map((h, i) => (
                                    <span 
                                      key={i} 
                                      className={`w-1 rounded-full transition-all duration-150 ${
                                        isPlayingAudio ? "bg-[#00a884]" : "bg-white/30"
                                      }`}
                                      style={{ 
                                        height: isPlayingAudio ? undefined : `${h}%`,
                                        animation: isPlayingAudio ? "soundwave 0.8s ease-in-out infinite" : "none",
                                        animationDelay: `${(i % 5) * 110}ms`,
                                        transformOrigin: "bottom"
                                      }}
                                    />
                                  ))}
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-white/60 font-mono">
                                  <span>0:{audioSeconds < 10 ? `0${audioSeconds}` : audioSeconds}</span>
                                  <span>0:38</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p>{msg.text}</p>
                          )}

                          {/* Message Metadata */}
                          <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-white/50">
                            <span>{msg.time}</span>
                            {msg.sender === "me" && (
                              <span>
                                {msg.status === "sent" && <Check size={12} className="text-white/60" />}
                                {msg.status === "delivered" && <CheckCheck size={12} className="text-white/60" />}
                                {msg.status === "read" && <CheckCheck size={12} className="text-[#53bdeb]" />}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Live Peer Typing Indicator Bubble */}
                    {isTypingPeer && (
                      <div className="flex justify-start animate-pop-bubble">
                        <div className="bg-[#202c33] rounded-2xl rounded-tl-none px-4 py-2 flex items-center gap-2 border border-white/[0.05] shadow-md">
                          <span className="text-[11px] text-[#8696a0]">Sarah is typing</span>
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat Input Dock */}
                  <div className="p-2 sm:p-3 bg-[#111b21] border-t border-white/[0.08] flex items-center gap-2">
                    <button className="text-[#8696a0] hover:text-white p-1 transition" title="Add emoji">
                      <Smile size={18} />
                    </button>
                    <button className="text-[#8696a0] hover:text-white p-1 transition" title="Attach file">
                      <Paperclip size={18} />
                    </button>
                    <div className="relative flex-1">
                      <input 
                        type="text"
                        value={inputMessage}
                        onChange={(e) => {
                          setIsChatAutoPlaying(false);
                          setInputMessage(e.target.value);
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleSendDemoMessage()}
                        placeholder={isUserTypingSim ? "" : "Type a test message..."}
                        className="w-full bg-[#202c33] border border-transparent focus:border-[#00a884]/50 rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#8696a0] focus:outline-none transition pr-7"
                      />
                      {isUserTypingSim && (
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 w-1.5 h-3.5 bg-[#00a884] animate-caret rounded-xs pointer-events-none" />
                      )}
                    </div>
                    <button 
                      onClick={handleSendDemoMessage}
                      className={`w-8 h-8 rounded-lg bg-[#00a884] text-white flex items-center justify-center hover:bg-[#02906f] active:scale-95 transition-all shadow ${
                        isSendPulsing ? "scale-90 bg-[#02906f] ring-2 ring-[#00a884]" : ""
                      }`}
                      title="Send message"
                    >
                      <Send size={14} className={isSendPulsing ? "translate-x-0.5 -translate-y-0.5 transition-transform" : ""} />
                    </button>
                  </div>

                </div>
              </div>

              {/* Bottom Card Summary */}
              <div className="mt-4 pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#8696a0]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <CheckCheck size={14} className="text-[#53bdeb]" />
                    <span>Double Blue Read Receipts</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Mic size={14} className="text-[#00a884]" />
                    <span>Opus Audio Voice Notes</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setIsChatAutoPlaying(true);
                    }} 
                    className="text-[#00a884] hover:underline flex items-center gap-1 font-medium"
                    title="Restart live auto-simulation"
                  >
                    <RefreshCw size={11} className={isChatAutoPlaying ? "animate-spin" : ""} style={{ animationDuration: "3s" }} />
                    <span>Replay simulation</span>
                  </button>
                  <span className="text-white/20">•</span>
                  <button 
                    onClick={() => {
                      setIsChatAutoPlaying(false);
                      setInputMessage("Testing sub-24ms encrypted socket latency! ⚡");
                    }} 
                    className="text-[#8696a0] hover:text-white flex items-center gap-1 font-medium"
                  >
                    <span>Insert sample text</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* ROW 1 - TILE 2: BIG TYPE STAT TILE (<24ms Latency) */}
            {/* Span: 4 cols on desktop, 6 on tablet, 12 on mobile */}
            {/* ---------------------------------------------------- */}
            <div className="lg:col-span-4 p-6 sm:p-7 rounded-3xl bg-[#111b21]/90 border border-white/[0.08] hover:border-[#00a884]/40 transition-all duration-200 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute -bottom-8 -right-8 w-44 h-44 bg-[radial-gradient(circle,_rgba(0,168,132,0.15),_transparent_70%)] pointer-events-none" />

              <div>
                <div className="text-[11px] font-mono text-[#00a884] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00a884] animate-ping" />
                  <span>Socket.IO Latency</span>
                </div>

                {/* Big Display Number (Stageshow Rule: 48 to 72px) */}
                <div className="text-5xl sm:text-6xl font-black text-white tracking-tighter my-3 font-mono">
                  &lt;24<span className="text-2xl sm:text-3xl font-bold text-[#00a884] ml-1">ms</span>
                </div>

                {/* Run-in Copy */}
                <p className="text-xs sm:text-sm text-[#8696a0] leading-relaxed mt-4">
                  <strong className="text-[#e9edef] font-semibold">Instant socket delivery.</strong> Direct bi-directional WebSocket connections dispatch messages and receipts with sub-perceptual lag.
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-white/[0.06] text-[11px] text-[#8696a0] flex items-center justify-between">
                <span>Persistent Connection</span>
                <span className="font-mono text-[#00a884]">Live Stream Ready</span>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* ROW 2 - TILE 3: COMPONENT TILE (Passwordless OTP Stepper) */}
            {/* Span: 4 cols on desktop, 6 on tablet, 12 on mobile */}
            {/* ---------------------------------------------------- */}
            <div className="lg:col-span-4 p-5 sm:p-6 rounded-3xl bg-[#111b21]/90 border border-white/[0.08] hover:border-[#06b6d4]/40 transition-all duration-200 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Passwordless Sign-In
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-[#06b6d4] animate-pulse" />
                </div>
                <p className="text-xs text-[#8696a0] mb-4">
                  <strong className="text-[#e9edef] font-semibold">Zero passwords to leak.</strong> Verify instantly with one-time cryptographic tokens.
                </p>

                {/* Interactive Stepper */}
                <div className="space-y-2">
                  {[
                    { step: 1, title: "1. Enter Email", val: "alex.rivera@echochat.app" },
                    { step: 2, title: "2. SMTPS Port 465", val: "Dispatched via Vercel Edge" },
                    { step: 3, title: "3. 6-Digit OTP", val: "[ 7 ] [ 2 ] [ 9 ] [ 4 ] [ 0 ] [ 1 ]" },
                    { step: 4, title: "4. Keypair Gen", val: "Curve25519 in IndexedDB" },
                  ].map((s) => (
                    <div 
                      key={s.step}
                      onClick={() => { setAuthStep(s.step as any); setIsAuthAutoPlaying(false); }}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        authStep === s.step 
                          ? "bg-[#202c33] border-[#06b6d4]/50 shadow-md ring-1 ring-[#06b6d4]/20" 
                          : "bg-[#0b141a]/60 border-white/[0.05] hover:border-white/15"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className={authStep === s.step ? "text-[#06b6d4]" : "text-white"}>
                          {s.title}
                        </span>
                        {authStep === s.step && <span className="text-[10px] text-[#06b6d4] font-mono">Active</span>}
                      </div>
                      <div className="text-[11px] font-mono text-white/90 mt-0.5">{s.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#8696a0]">
                <span>5-Minute MongoDB TTL</span>
                <button 
                  onClick={() => setIsAuthAutoPlaying(!isAuthAutoPlaying)}
                  className="text-xs text-[#06b6d4] hover:underline font-medium"
                >
                  {isAuthAutoPlaying ? "Pause Demo" : "Resume Demo"}
                </button>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* ROW 2 - TILE 4: DIAGRAM TILE (E2EE Message Pipeline) */}
            {/* Span: 5 cols on desktop, 6 on tablet, 12 on mobile */}
            {/* ---------------------------------------------------- */}
            <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-[#111b21]/90 border border-white/[0.08] hover:border-[#10b981]/40 transition-all duration-200 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight mb-1">
                  E2EE Cryptographic Pipeline
                </h3>
                <p className="text-xs text-[#8696a0] mb-4">
                  <strong className="text-[#e9edef] font-semibold">Zero-knowledge flow.</strong> Messages are encrypted on-device before hitting the network.
                </p>

                {/* 4-Node Pipeline Diagram */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-[#0b141a] border border-white/[0.07]">
                    <span className="text-[10px] font-mono text-white/60">01 / INPUT</span>
                    <div className="text-xs font-semibold text-white mt-1">Plaintext Keystroke</div>
                    <div className="text-[10px] text-[#8696a0] mt-1">Typed in local DOM</div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0b141a] border border-[#10b981]/30 shadow-sm">
                    <span className="text-[10px] font-mono text-[#10b981]">02 / CIPHER</span>
                    <div className="text-xs font-semibold text-[#10b981] mt-1">AES-256-GCM</div>
                    <div className="text-[10px] text-[#8696a0] mt-1">Encrypted on device</div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0b141a] border border-white/[0.07]">
                    <span className="text-[10px] font-mono text-white/60">03 / TRANSIT</span>
                    <div className="text-xs font-semibold text-white mt-1">Socket.IO Relay</div>
                    <div className="text-[10px] text-[#8696a0] mt-1">Sub-24ms dispatch</div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0b141a] border border-[#06b6d4]/30 shadow-sm">
                    <span className="text-[10px] font-mono text-[#06b6d4]">04 / RECEIPT</span>
                    <div className="text-xs font-semibold text-[#06b6d4] mt-1">Double Blue Tick</div>
                    <div className="text-[10px] text-[#8696a0] mt-1">Decrypted by peer</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] text-[#8696a0] flex items-center justify-between">
                <span>Curve25519 (ECDH) Key Exchange</span>
                <span className="font-mono text-[#10b981]">Native WebCrypto</span>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* ROW 2 - TILE 5: BIG TYPE STAT TILE (Zero Plaintext Leaks) */}
            {/* Span: 3 cols on desktop, 6 on tablet, 12 on mobile */}
            {/* ---------------------------------------------------- */}
            <div className="lg:col-span-3 p-6 rounded-3xl bg-[#111b21]/90 border border-white/[0.08] hover:border-[#10b981]/40 transition-all duration-200 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
              <div>
                <div className="text-[11px] font-mono text-[#10b981] uppercase tracking-wider mb-2">
                  Server Telemetry
                </div>

                <div className="text-5xl sm:text-6xl font-black text-white tracking-tighter my-2 font-mono">
                  0<span className="text-2xl font-bold text-[#10b981] ml-1">%</span>
                </div>

                <p className="text-xs text-[#8696a0] leading-relaxed mt-3">
                  <strong className="text-[#e9edef] font-semibold">Zero plaintext leaks.</strong> No third-party ad brokers, trackers, or plain database storage.
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/[0.06] text-[11px] text-[#8696a0] flex items-center justify-between">
                <span>GDPR & Privacy First</span>
                <span className="font-mono text-[#10b981]">Client Keys</span>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* ROW 3 - TILE 6: COMPONENT TILE (24h Ephemeral Stories) */}
            {/* Span: 4 cols on desktop, 6 on tablet, 12 on mobile */}
            {/* ---------------------------------------------------- */}
            <div className="lg:col-span-4 p-5 sm:p-6 rounded-3xl bg-[#111b21]/90 border border-white/[0.08] hover:border-[#f59e0b]/40 transition-all duration-200 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    24h Ephemeral Status
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-[#f59e0b]">
                    TTL Purge
                  </span>
                </div>
                <p className="text-xs text-[#8696a0] mb-4">
                  <strong className="text-[#e9edef] font-semibold">Disappearing stories.</strong> Photos, video, and text self-destruct after 24 hours.
                </p>

                {/* Status Story Card Preview */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0d6b50] to-[#0b4837] border border-white/15 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-white/20 p-0.5 ring-2 ring-[#00a884]">
                        <div className="w-full h-full rounded-full bg-[#111b21] flex items-center justify-center text-[10px] font-bold">
                          AR
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold leading-tight">Alex Rivera</span>
                        <span className="text-[9px] text-white/70">Today, 2:40 PM</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-[#53bdeb]">18h remaining</span>
                  </div>

                  <p className="text-xs font-medium py-1.5 leading-relaxed">
                    "Shipped EchoChat v2 with WebRTC HD Calling & E2EE 🚀"
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-white/70">
                    <span className="flex items-center gap-1">
                      <Eye size={12} className="text-[#00a884]" />
                      <span>28 Contacts Viewed</span>
                    </span>
                    <span className="font-mono text-[#53bdeb]">MongoDB TTL</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] text-[#8696a0] flex items-center justify-between">
                <span>Zero Server Persistence</span>
                <span className="font-mono text-[#f59e0b]">Auto-Expiry</span>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* ROW 3 - TILE 7: COMPONENT TILE (WebRTC HD Calling) */}
            {/* Span: 4 cols on desktop, 6 on tablet, 12 on mobile */}
            {/* ---------------------------------------------------- */}
            <div className="lg:col-span-4 p-5 sm:p-6 rounded-3xl bg-[#111b21]/90 border border-white/[0.08] hover:border-[#3b82f6]/40 transition-all duration-200 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    P2P WebRTC HD Calling
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-[#3b82f6] animate-pulse" />
                </div>
                <p className="text-xs text-[#8696a0] mb-4">
                  <strong className="text-[#e9edef] font-semibold">Direct peer streams.</strong> Encrypted audio and video without recording relays.
                </p>

                {/* Call Simulation Widget */}
                <div className="p-3.5 rounded-2xl bg-[#0b141a] border border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#3b82f6] to-[#00a884] flex items-center justify-center text-white font-bold text-xs shadow-md">
                      MK
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Marcus King</span>
                      <span className="text-[10px] text-[#00a884] font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-ping" />
                        03:48 • 48kHz Opus
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="w-7 h-7 rounded-full bg-[#202c33] text-white flex items-center justify-center cursor-pointer">
                      <Mic size={12} />
                    </span>
                    <span className="w-7 h-7 rounded-full bg-red-500/80 text-white flex items-center justify-center cursor-pointer">
                      <Phone size={12} className="rotate-[135deg]" />
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] text-[#8696a0] flex items-center justify-between">
                <span>Simple-Peer WebRTC</span>
                <span className="font-mono text-[#3b82f6]">Zero-Hop Audio</span>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* ROW 3 - TILE 8: COLLECTION TILE (Rich Multimodal Hub) */}
            {/* Span: 4 cols on desktop, 12 on tablet/mobile */}
            {/* ---------------------------------------------------- */}
            <div className="lg:col-span-4 p-5 sm:p-6 rounded-3xl bg-[#111b21]/90 border border-white/[0.08] hover:border-[#a855f7]/40 transition-all duration-200 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight mb-1">
                  Rich Multimodal Sharing
                </h3>
                <p className="text-xs text-[#8696a0] mb-4">
                  <strong className="text-[#e9edef] font-semibold">Any format.</strong> Voice, high-definition media, files, and live Google Maps pins.
                </p>

                {/* 4 Media Badges */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-[#0b141a] border border-white/[0.06] flex items-center gap-2">
                    <Volume2 size={15} className="text-[#a855f7] flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold text-white">Voice Note</span>
                      <span className="text-[9px] text-[#8696a0]">Sub-1ms</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0b141a] border border-white/[0.06] flex items-center gap-2">
                    <Camera size={15} className="text-[#00a884] flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold text-white">HD Media</span>
                      <span className="text-[9px] text-[#8696a0]">Instant view</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0b141a] border border-white/[0.06] flex items-center gap-2">
                    <FileText size={15} className="text-[#06b6d4] flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold text-white">Documents</span>
                      <span className="text-[9px] text-[#8696a0]">PDF, Code</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0b141a] border border-white/[0.06] flex items-center gap-2">
                    <MapPin size={15} className="text-[#ef4444] flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold text-white">Live GPS</span>
                      <span className="text-[9px] text-[#8696a0]">Maps pin</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] text-[#8696a0] flex items-center justify-between">
                <span>Bearer Token Protection</span>
                <span className="font-mono text-[#a855f7]">RBAC Media</span>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* ROW 4 - TILE 9: STATEMENT / ACTION BAR (Groups & Teams) */}
            {/* Span: 12 (Full Width) */}
            {/* ---------------------------------------------------- */}
            <div className="lg:col-span-12 p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-[#111b21] via-[#16222b] to-[#111b21] border border-white/[0.08] hover:border-[#00a884]/40 transition-all duration-200 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#00a884]/20 border border-[#00a884]/40 text-[#00a884] flex items-center justify-center flex-shrink-0">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>Group Channels & Role-Based Permissions</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#00a884]/15 border border-[#00a884]/30 text-[#00a884] text-[10px] font-mono uppercase tracking-wider">
                      Admins & Members
                    </span>
                  </h3>
                  <p className="text-xs text-[#8696a0] mt-1 max-w-2xl leading-relaxed">
                    <strong className="text-[#e9edef] font-semibold">Collaborate without limits.</strong> Create announcement channels, assign administrators, broadcast encrypted updates, and monitor delivery status across entire teams.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
                <button
                  onClick={handleGetStartClick}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#00a884] hover:bg-[#02906f] text-white text-xs sm:text-sm font-semibold transition shadow-[0_2px_12px_rgba(0,168,132,0.35)] flex items-center justify-center gap-2"
                >
                  <span>Create Free Account</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* ======================================================== */}
      {/* COMPREHENSIVE 4-COLUMN APPLICATION FOOTER */}
      {/* ======================================================== */}
      <footer className="w-full bg-[#0b141a]/95 border-t border-white/[0.08] py-12 px-6 sm:px-12 z-20 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-10">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            
            {/* Col 1: Product Navigation */}
            <div className="flex flex-col gap-3">
              <span className="font-semibold text-white text-xs uppercase tracking-wider">Product</span>
              <button onClick={() => setShowAuth(false)} className="text-xs text-[#8696a0] hover:text-[#00a884] text-left transition-colors">
                Web Client
              </button>
              <button onClick={handleGetStartClick} className="text-xs text-[#8696a0] hover:text-[#00a884] text-left transition-colors">
                Registration
              </button>
              <button onClick={handleLoginClick} className="text-xs text-[#8696a0] hover:text-[#00a884] text-left transition-colors">
                Account Sign In
              </button>
              <div className="flex items-center gap-2 text-xs text-[#8696a0]">
                <span>Desktop App</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-[#00a884]">Soon</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#8696a0]">
                <span>iOS & Android</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-[#00a884]">Beta</span>
              </div>
            </div>

            {/* Col 2: Privacy, Security & Legal */}
            <div className="flex flex-col gap-3">
              <span className="font-semibold text-white text-xs uppercase tracking-wider">Privacy & Trust</span>
              <button 
                onClick={() => setModalContent("privacy")}
                className="text-xs text-[#8696a0] hover:text-[#00a884] text-left transition-colors flex items-center justify-between group"
              >
                <span>Privacy Policy</span>
                <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button 
                onClick={() => setModalContent("terms")}
                className="text-xs text-[#8696a0] hover:text-[#00a884] text-left transition-colors flex items-center justify-between group"
              >
                <span>Terms of Service</span>
                <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button 
                onClick={() => setModalContent("security")}
                className="text-xs text-[#8696a0] hover:text-[#00a884] text-left transition-colors flex items-center justify-between group"
              >
                <span>Security Whitepaper</span>
                <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <span className="text-xs text-[#8696a0]">Cookie Preferences</span>
              <span className="text-xs text-[#8696a0]">GDPR Compliance</span>
            </div>

            {/* Col 3: Developers & Technology */}
            <div className="flex flex-col gap-3">
              <span className="font-semibold text-white text-xs uppercase tracking-wider">Technology</span>
              <a href="https://github.com/Soumyaroy428/EchoChat" target="_blank" rel="noopener noreferrer" className="text-xs text-[#8696a0] hover:text-[#00a884] transition-colors flex items-center gap-1.5">
                <GithubIcon size={13} />
                <span>GitHub Repository</span>
              </a>
              <span className="text-xs text-[#8696a0]">WebSocket Protocol</span>
              <span className="text-xs text-[#8696a0]">Curve25519 Cipher</span>
              <span className="text-xs text-[#8696a0]">Turbopack Next.js 16</span>
              <span className="text-xs text-[#8696a0]">Vercel Edge Cloud</span>
            </div>

            {/* Col 4: About & Support */}
            <div className="flex flex-col gap-3">
              <span className="font-semibold text-white text-xs uppercase tracking-wider">EchoChat Support</span>
              <span className="text-xs text-[#8696a0]">Help Center & FAQ</span>
              <span className="text-xs text-[#8696a0]">Community Forum</span>
              <a href="mailto:soumyaroy2022@gmail.com" className="text-xs text-[#8696a0] hover:text-[#00a884] transition-colors">
                Contact Engineering
              </a>
              <span className="text-xs text-[#8696a0]">Responsible Disclosure</span>
              <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#202c33] border border-white/10 w-fit text-[11px] text-[#00a884]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-pulse" />
                <span>All Systems Operational</span>
              </div>
            </div>

          </div>

          {/* Bottom Bar: Copyright, Encryption Badge & Legal */}
          <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8696a0]">
            <div className="flex items-center gap-2">
              <Lock size={14} className="text-[#00a884]" />
              <span>&copy; 2026 EchoChat Inc. All rights reserved. End-to-end encrypted messaging.</span>
            </div>

            <div className="flex items-center gap-6">
              <button onClick={() => setModalContent("privacy")} className="hover:text-white transition-colors">
                Privacy
              </button>
              <button onClick={() => setModalContent("terms")} className="hover:text-white transition-colors">
                Terms
              </button>
              <button onClick={() => setModalContent("security")} className="hover:text-white transition-colors">
                Security
              </button>
              <a href="https://github.com/Soumyaroy428/EchoChat" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                <GithubIcon size={13} />
                <span>Open Source</span>
              </a>
            </div>
          </div>

        </div>
      </footer>

      {/* ======================================================== */}
      {/* INTERACTIVE LEGAL & PRIVACY MODAL */}
      {/* ======================================================== */}
      {modalContent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111b21] border border-white/10 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative text-left">
            <button 
              onClick={() => setModalContent(null)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-[#8696a0] hover:text-white hover:bg-white/10 transition"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {modalContent === "privacy" && (
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#00a884]/15 border border-[#00a884]/30 text-[#00a884] flex items-center justify-center mb-4">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">EchoChat Privacy Policy</h3>
                <div className="text-xs text-[#8696a0] space-y-3 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
                  <p>
                    <strong className="text-white">1. Zero-Knowledge Messages:</strong> All message text, audio notes, media attachments, and calls are encrypted on your local device before transmission. We do not store unencrypted keys or conversation logs.
                  </p>
                  <p>
                    <strong className="text-white">2. Minimal Data Collection:</strong> We collect only your email address for account authentication via instant one-time passwords (OTP). Phone numbers are completely optional.
                  </p>
                  <p>
                    <strong className="text-white">3. No Advertising Telemetry:</strong> EchoChat does not sell personal identifiers, chat patterns, or contact books to third-party ad brokers or analytics providers.
                  </p>
                  <p>
                    <strong className="text-white">4. Data Deletion:</strong> You retain the absolute right to delete individual messages, contacts, or your entire account profile permanently at any time.
                  </p>
                </div>
              </div>
            )}

            {modalContent === "terms" && (
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#00a884]/15 border border-[#00a884]/30 text-[#00a884] flex items-center justify-center mb-4">
                  <FileText size={20} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Terms of Service</h3>
                <div className="text-xs text-[#8696a0] space-y-3 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
                  <p>
                    <strong className="text-white">1. Acceptable Use:</strong> EchoChat provides encrypted communication tools. You agree not to transmit illegal material, unauthorized spam, or engage in denial of service attacks against WebSocket relays.
                  </p>
                  <p>
                    <strong className="text-white">2. Account Responsibility:</strong> You are responsible for safeguarding access to your registered email account and generated local device cryptographic keys.
                  </p>
                  <p>
                    <strong className="text-white">3. Service Availability:</strong> While we target 99.9% uptime across our globally distributed nodes, the service is provided as-is without warranties of uninterrupted transmission.
                  </p>
                </div>
              </div>
            )}

            {modalContent === "security" && (
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#00a884]/15 border border-[#00a884]/30 text-[#00a884] flex items-center justify-center mb-4">
                  <Key size={20} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Security Whitepaper</h3>
                <div className="text-xs text-[#8696a0] space-y-3 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
                  <p>
                    <strong className="text-white">Cryptographic Standards:</strong> Key exchange uses Curve25519 (ECDH) with 256-bit symmetric encryption via AES-GCM and SHA-512 authentication hashes.
                  </p>
                  <p>
                    <strong className="text-white">Forward Secrecy:</strong> Temporary session keys are cycled periodically to prevent retroactive decryption of archived payloads.
                  </p>
                  <p>
                    <strong className="text-white">Transport Security:</strong> All connections enforce TLS 1.3 encryption with strict HTTP Strict Transport Security (HSTS) headers.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setModalContent(null)}
                className="px-5 py-2 rounded-lg bg-[#00a884] text-white text-xs font-semibold hover:bg-[#02906f] transition"
              >
                Close & Return
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
