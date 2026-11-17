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
  MicOff,
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
  Sliders,
  Maximize2
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
// Interactive Demo Types
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
  // Interactive Simulator State (For Live App Screenshots)
  // -----------------------------------------------------------
  const [deviceFrame, setDeviceFrame] = useState<"desktop" | "mobile">("desktop");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(35);
  const [isTypingPeer, setIsTypingPeer] = useState(false);
  const [simulatedCallActive, setSimulatedCallActive] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
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

  // -----------------------------------------------------------
  // Interactive Auth Stepper State
  // -----------------------------------------------------------
  const [authStep, setAuthStep] = useState<1 | 2 | 3 | 4>(1);
  const [authEmail, setAuthEmail] = useState("alex.rivera@echochat.app");
  const [isAuthAutoPlaying, setIsAuthAutoPlaying] = useState(true);

  // Auto-cycle auth steps for engaging animation
  useEffect(() => {
    if (!isAuthAutoPlaying) return;
    const interval = setInterval(() => {
      setAuthStep((prev) => (prev >= 4 ? 1 : ((prev + 1) as 1 | 2 | 3 | 4)));
    }, 3200);
    return () => clearInterval(interval);
  }, [isAuthAutoPlaying]);

  // Simulated peer typing effect
  const handleSendDemoMessage = () => {
    if (!inputMessage.trim()) return;
    const newMsg: DemoMessage = {
      id: Date.now().toString(),
      sender: "me",
      text: inputMessage.trim(),
      time: "Just now",
      status: "sent",
    };
    setDemoMessages((prev) => [...prev, newMsg]);
    setInputMessage("");

    // Simulate delivery ticks
    setTimeout(() => {
      setDemoMessages((prev) =>
        prev.map((m) => (m.id === newMsg.id ? { ...m, status: "delivered" } : m))
      );
    }, 800);

    setTimeout(() => {
      setDemoMessages((prev) =>
        prev.map((m) => (m.id === newMsg.id ? { ...m, status: "read" } : m))
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
      }, 2000);
    }, 1800);
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
          {/* Logo with transparent background - blends 100% with header */}
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
        {/* INTERACTIVE BENTO GRID SYSTEM: APPLICATION BLUEPRINT */}
        {/* ======================================================== */}
        <section className="w-full my-6 sm:my-10">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00a884]/15 border border-[#00a884]/30 text-[#00a884] text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles size={13} />
              <span>Interactive System Blueprint & Screenshots</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#e9edef] tracking-tight">
              How EchoChat Works
            </h2>
            <p className="text-xs sm:text-sm text-[#8696a0] mt-2 leading-relaxed">
              Explore passwordless authentication, end-to-end encrypted message workflows, and real-time multimodal capabilities directly from this live animated simulator.
            </p>
          </div>

          {/* ====================================================== */}
          {/* THE BENTO GRID (Responsive 12-Column Layout) */}
          {/* ====================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6">
            
            {/* ---------------------------------------------------- */}
            {/* BENTO CARD 1: LIVE APPLICATION SIMULATOR (Take Screenshot) */}
            {/* Span: 12 on mobile/tablet, 8 on desktop */}
            {/* ---------------------------------------------------- */}
            <div className="lg:col-span-8 p-5 sm:p-7 rounded-3xl bg-[#111b21]/90 border border-white/[0.08] hover:border-[#00a884]/40 transition-all duration-200 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(ellipse_at_top_right,_rgba(0,168,132,0.1),_transparent_70%)] pointer-events-none" />

              <div>
                {/* Header with Title and Mode Toggles */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#00a884]/20 border border-[#00a884]/40 text-[#00a884] flex items-center justify-center">
                      <MessageSquare size={18} />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                        <span>Live Chat Simulator</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#00a884]/15 border border-[#00a884]/30 text-[#00a884] text-[10px] font-mono uppercase tracking-wider">
                          Ready for Screenshot
                        </span>
                      </h3>
                      <p className="text-xs text-[#8696a0]">Interactive real-time chat with encrypted delivery receipts & voice note audio</p>
                    </div>
                  </div>

                  {/* Device Framing & Interactive Controls */}
                  <div className="flex items-center gap-2 self-start sm:self-auto bg-[#0b141a] p-1 rounded-xl border border-white/10">
                    <button
                      onClick={() => setDeviceFrame("desktop")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                        deviceFrame === "desktop" ? "bg-[#202c33] text-white shadow-sm" : "text-[#8696a0] hover:text-white"
                      }`}
                      title="Desktop view mode"
                    >
                      <Laptop size={13} />
                      <span className="hidden sm:inline">Desktop</span>
                    </button>
                    <button
                      onClick={() => setDeviceFrame("mobile")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                        deviceFrame === "mobile" ? "bg-[#202c33] text-white shadow-sm" : "text-[#8696a0] hover:text-white"
                      }`}
                      title="Mobile view mode"
                    >
                      <Smartphone size={13} />
                      <span className="hidden sm:inline">Mobile</span>
                    </button>
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
                        <span className="text-[10px] text-[#00a884] font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-pulse" />
                          Online • E2EE Verified
                        </span>
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
                    <div className="bg-[#00a884]/15 border-b border-[#00a884]/30 px-4 py-2 flex items-center justify-between animate-fade-in">
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
                    className="p-4 space-y-3 min-h-[240px] max-h-[300px] overflow-y-auto"
                    style={{
                      backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
                      backgroundSize: "16px 16px"
                    }}
                  >
                    {demoMessages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
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
                                className="w-8 h-8 rounded-full bg-[#00a884] text-white flex items-center justify-center shadow flex-shrink-0 hover:scale-105 transition"
                              >
                                {isPlayingAudio ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
                              </button>
                              <div className="flex-1 flex flex-col gap-1">
                                <div className="flex items-center gap-1 h-4">
                                  {[40, 70, 30, 90, 60, 100, 45, 80, 50, 95, 30, 75, 40].map((h, i) => (
                                    <span 
                                      key={i} 
                                      className={`w-1 rounded-full transition-all duration-200 ${
                                        isPlayingAudio ? "bg-[#00a884] animate-pulse" : "bg-white/30"
                                      }`}
                                      style={{ height: `${h}%` }}
                                    />
                                  ))}
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-white/60 font-mono">
                                  <span>0:14</span>
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

                    {/* Live Typing Indicator */}
                    {isTypingPeer && (
                      <div className="flex items-center gap-2 text-xs text-[#8696a0] bg-[#202c33]/70 w-fit px-3 py-1.5 rounded-full border border-white/5">
                        <span className="font-medium text-white/80">Sarah is typing</span>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat Input Dock */}
                  <div className="p-2 sm:p-3 bg-[#111b21] border-t border-white/[0.08] flex items-center gap-2">
                    <button className="text-[#8696a0] hover:text-white p-1 transition" title="Add emoji">
                      <Smile size={18} />
                    </button>
                    <button className="text-[#8696a0] hover:text-white p-1 transition" title="Attach file">
                      <Paperclip size={18} />
                    </button>
                    <input 
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendDemoMessage()}
                      placeholder="Type a test message..."
                      className="flex-1 bg-[#202c33] border border-transparent focus:border-[#00a884]/50 rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#8696a0] focus:outline-none transition"
                    />
                    <button 
                      onClick={handleSendDemoMessage}
                      className="w-8 h-8 rounded-lg bg-[#00a884] text-white flex items-center justify-center hover:bg-[#02906f] active:scale-95 transition shadow"
                      title="Send message"
                    >
                      <Send size={14} />
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
                <button 
                  onClick={() => {
                    setInputMessage("Testing sub-24ms encrypted socket latency! ⚡");
                  }} 
                  className="text-[#00a884] hover:underline flex items-center gap-1 font-medium"
                >
                  <RefreshCw size={11} />
                  <span>Insert sample text</span>
                </button>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* BENTO CARD 2: HOW AUTHENTICATION WORKS (Passwordless OTP) */}
            {/* Span: 12 on mobile/tablet, 4 on desktop */}
            {/* ---------------------------------------------------- */}
            <div className="lg:col-span-4 p-5 sm:p-6 rounded-3xl bg-[#111b21]/90 border border-white/[0.08] hover:border-[#00a884]/40 transition-all duration-200 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-60 h-60 bg-[radial-gradient(ellipse_at_top_right,_rgba(6,182,212,0.1),_transparent_70%)] pointer-events-none" />

              <div>
                <div className="w-10 h-10 rounded-xl bg-[#06b6d4]/15 border border-[#06b6d4]/30 text-[#06b6d4] flex items-center justify-center mb-4">
                  <Key size={20} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                  How Authentication Works
                </h3>
                <p className="text-xs text-[#8696a0] leading-relaxed mb-4">
                  Zero passwords to leak. Authenticate in seconds with instant cryptographic One-Time Passwords.
                </p>

                {/* Interactive Step-by-Step Flow */}
                <div className="space-y-2.5">
                  {[
                    {
                      step: 1,
                      title: "1. Enter Registered Email",
                      desc: "alex.rivera@echochat.app",
                      detail: "No password required.",
                    },
                    {
                      step: 2,
                      title: "2. SMTPS Port 465 Dispatch",
                      desc: "Vercel Edge Proxy dispatches OTP",
                      detail: "Secured via Gmail TLS 1.3.",
                    },
                    {
                      step: 3,
                      title: "3. 6-Digit Verification Code",
                      desc: "[ 7 ] [ 2 ] [ 9 ] [ 4 ] [ 0 ] [ 1 ]",
                      detail: "Valid for 5 mins (MongoDB TTL).",
                    },
                    {
                      step: 4,
                      title: "4. Local Keypair Generation",
                      desc: "Curve25519 Private Key in IndexedDB",
                      detail: "Never transmitted to server.",
                    },
                  ].map((s) => (
                    <div 
                      key={s.step}
                      onClick={() => { setAuthStep(s.step as any); setIsAuthAutoPlaying(false); }}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer text-left ${
                        authStep === s.step 
                          ? "bg-[#202c33] border-[#06b6d4]/50 shadow-md ring-1 ring-[#06b6d4]/20" 
                          : "bg-[#0b141a]/60 border-white/[0.05] hover:border-white/15"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold ${authStep === s.step ? "text-[#06b6d4]" : "text-white"}`}>
                          {s.title}
                        </span>
                        {authStep === s.step && (
                          <span className="w-2 h-2 rounded-full bg-[#06b6d4] animate-ping" />
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-white/90 mt-0.5">{s.desc}</div>
                      <div className="text-[10px] text-[#8696a0] mt-0.5">{s.detail}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action trigger */}
              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] text-[#8696a0] font-mono">
                  Step {authStep} of 4 Active
                </span>
                <button 
                  onClick={() => setIsAuthAutoPlaying(!isAuthAutoPlaying)}
                  className="text-xs text-[#06b6d4] hover:underline font-medium"
                >
                  {isAuthAutoPlaying ? "Pause Auto-Demo" : "Play Auto-Demo"}
                </button>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* BENTO CARD 3: HOW MESSAGE WORKFLOW WORKS (E2EE Pipeline) */}
            {/* Span: 12 on mobile/tablet, 7 on desktop */}
            {/* ---------------------------------------------------- */}
            <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-[#111b21]/90 border border-white/[0.08] hover:border-[#00a884]/40 transition-all duration-200 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.1),_transparent_70%)] pointer-events-none" />

              <div>
                <div className="w-10 h-10 rounded-xl bg-[#10b981]/15 border border-[#10b981]/30 text-[#10b981] flex items-center justify-center mb-4">
                  <Lock size={20} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                  How Message Workflow Works: End-to-End Cryptography
                </h3>
                <p className="text-xs text-[#8696a0] leading-relaxed mb-5">
                  Trace the exact journey of a message from your keystroke to recipient delivery with verifiable zero-knowledge privacy.
                </p>

                {/* Pipeline Flow Visualization */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-center">
                  
                  {/* Step A */}
                  <div className="p-3 rounded-xl bg-[#0b141a]/90 border border-white/[0.07] flex flex-col items-center">
                    <span className="w-5 h-5 rounded-full bg-[#202c33] text-[10px] font-bold text-white flex items-center justify-center mb-1.5">
                      1
                    </span>
                    <span className="text-xs font-semibold text-white">Client Input</span>
                    <span className="text-[10px] text-[#8696a0] mt-1">Plaintext message typed in browser</span>
                    <span className="mt-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-white/70">
                      "Hello!"
                    </span>
                  </div>

                  {/* Step B */}
                  <div className="p-3 rounded-xl bg-[#0b141a]/90 border border-[#10b981]/30 flex flex-col items-center shadow-sm">
                    <span className="w-5 h-5 rounded-full bg-[#10b981]/20 text-[10px] font-bold text-[#10b981] flex items-center justify-center mb-1.5">
                      2
                    </span>
                    <span className="text-xs font-semibold text-[#10b981]">AES-256-GCM</span>
                    <span className="text-[10px] text-[#8696a0] mt-1">Encrypted on device via WebCrypto</span>
                    <span className="mt-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#10b981]/15 text-[#10b981]">
                      d4e9a18...
                    </span>
                  </div>

                  {/* Step C */}
                  <div className="p-3 rounded-xl bg-[#0b141a]/90 border border-white/[0.07] flex flex-col items-center">
                    <span className="w-5 h-5 rounded-full bg-[#202c33] text-[10px] font-bold text-white flex items-center justify-center mb-1.5">
                      3
                    </span>
                    <span className="text-xs font-semibold text-white">WebSocket Transit</span>
                    <span className="text-[10px] text-[#8696a0] mt-1">Socket.IO relay &lt;24ms latency</span>
                    <span className="mt-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-white/70">
                      TLS 1.3 Relay
                    </span>
                  </div>

                  {/* Step D */}
                  <div className="p-3 rounded-xl bg-[#0b141a]/90 border border-[#06b6d4]/30 flex flex-col items-center shadow-sm">
                    <span className="w-5 h-5 rounded-full bg-[#06b6d4]/20 text-[10px] font-bold text-[#06b6d4] flex items-center justify-center mb-1.5">
                      4
                    </span>
                    <span className="text-xs font-semibold text-[#06b6d4]">Decryption & Ticks</span>
                    <span className="text-[10px] text-[#8696a0] mt-1">Recipient private key decrypts</span>
                    <span className="mt-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#06b6d4]/15 text-[#06b6d4] flex items-center gap-1">
                      <CheckCheck size={12} /> Double Tick
                    </span>
                  </div>

                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#8696a0]">
                <span className="font-mono text-[11px] text-[#10b981]">WebCrypto API Native • Curve25519 ECDH</span>
                <span className="text-[11px] text-[#8696a0]">Zero server plain-text retention</span>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* BENTO CARD 4: 24-HOUR EPHEMERAL STATUS STORIES */}
            {/* Span: 12 on mobile/tablet, 5 on desktop */}
            {/* ---------------------------------------------------- */}
            <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-[#111b21]/90 border border-white/[0.08] hover:border-[#00a884]/40 transition-all duration-200 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-60 h-60 bg-[radial-gradient(ellipse_at_top_right,_rgba(245,158,11,0.1),_transparent_70%)] pointer-events-none" />

              <div>
                <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/15 border border-[#f59e0b]/30 text-[#f59e0b] flex items-center justify-center mb-4">
                  <Clock size={20} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                  24-Hour Ephemeral Status
                </h3>
                <p className="text-xs text-[#8696a0] leading-relaxed mb-4">
                  Post temporary photo, video, or text updates that automatically self-destruct after 24 hours.
                </p>

                {/* Status Story Card Preview */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0d6b50] to-[#0b4837] border border-white/15 text-white shadow-lg relative overflow-hidden">
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
                    <span className="px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm text-[10px] font-mono text-[#53bdeb] flex items-center gap-1">
                      <Clock size={10} /> 18h remaining
                    </span>
                  </div>

                  <p className="text-xs font-medium py-2 leading-relaxed">
                    "Shipped EchoChat v2 with sub-24ms WebSockets & WebRTC calling! Check it live on Vercel 🚀"
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-white/70">
                    <span className="flex items-center gap-1">
                      <Eye size={12} className="text-[#00a884]" />
                      <span>28 Contacts Viewed</span>
                    </span>
                    <span className="font-mono text-[#53bdeb]">MongoDB TTL Index</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] text-[#8696a0] flex items-center justify-between">
                <span>Auto-Purge After 24h</span>
                <span className="font-mono text-[#f59e0b]">Zero Waste Archiving</span>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* BENTO CARD 5: WEBRTC HD VOICE & VIDEO CALLING */}
            {/* Span: 12 on mobile/tablet, 6 on desktop */}
            {/* ---------------------------------------------------- */}
            <div className="lg:col-span-6 p-5 sm:p-6 rounded-3xl bg-[#111b21]/90 border border-white/[0.08] hover:border-[#00a884]/40 transition-all duration-200 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-60 h-60 bg-[radial-gradient(ellipse_at_top_right,_rgba(59,130,246,0.1),_transparent_70%)] pointer-events-none" />

              <div>
                <div className="w-10 h-10 rounded-xl bg-[#3b82f6]/15 border border-[#3b82f6]/30 text-[#3b82f6] flex items-center justify-center mb-4">
                  <PhoneCall size={20} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                  P2P WebRTC HD Voice & Video
                </h3>
                <p className="text-xs text-[#8696a0] leading-relaxed mb-4">
                  Direct peer-to-peer audio and video calls powered by Simple-Peer WebRTC. No intermediate recording servers.
                </p>

                {/* Call Simulation Widget */}
                <div className="p-4 rounded-2xl bg-[#0b141a] border border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#3b82f6] to-[#00a884] flex items-center justify-center text-white font-bold text-sm shadow-md">
                        MK
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#00a884] ring-2 ring-[#0b141a]" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Marcus King</span>
                      <span className="text-[11px] text-[#00a884] font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-ping" />
                        03:48 • Opus 48kHz Stereo
                      </span>
                    </div>
                  </div>

                  {/* Active Call Controls */}
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-[#202c33] text-white flex items-center justify-center hover:bg-[#2a3942] transition cursor-pointer">
                      <Mic size={14} />
                    </span>
                    <span className="w-8 h-8 rounded-full bg-[#202c33] text-white flex items-center justify-center hover:bg-[#2a3942] transition cursor-pointer">
                      <Video size={14} />
                    </span>
                    <span className="w-8 h-8 rounded-full bg-red-500/80 text-white flex items-center justify-center hover:bg-red-500 transition cursor-pointer">
                      <Phone size={14} className="rotate-[135deg]" />
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] text-[#8696a0] flex items-center justify-between">
                <span>Simple-Peer WebRTC Architecture</span>
                <span className="font-mono text-[#3b82f6]">Zero Server Relay Media</span>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* BENTO CARD 6: RICH MULTIMODAL SHARING */}
            {/* Span: 12 on mobile/tablet, 6 on desktop */}
            {/* ---------------------------------------------------- */}
            <div className="lg:col-span-6 p-5 sm:p-6 rounded-3xl bg-[#111b21]/90 border border-white/[0.08] hover:border-[#00a884]/40 transition-all duration-200 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-60 h-60 bg-[radial-gradient(ellipse_at_top_right,_rgba(168,85,247,0.1),_transparent_70%)] pointer-events-none" />

              <div>
                <div className="w-10 h-10 rounded-xl bg-[#a855f7]/15 border border-[#a855f7]/30 text-[#a855f7] flex items-center justify-center mb-4">
                  <FileText size={20} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                  Rich Multimodal Messaging
                </h3>
                <p className="text-xs text-[#8696a0] leading-relaxed mb-4">
                  Exchange voice recordings, high-resolution media, documents, and live location with authorized token security.
                </p>

                {/* Multimodal Badges Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-[#0b141a] border border-white/[0.06] flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#a855f7]/20 text-[#a855f7] flex items-center justify-center">
                      <Volume2 size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-white">Voice Notes</span>
                      <span className="text-[10px] text-[#8696a0]">Sub-1ms recorder</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0b141a] border border-white/[0.06] flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#00a884]/20 text-[#00a884] flex items-center justify-center">
                      <Camera size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-white">HD Media</span>
                      <span className="text-[10px] text-[#8696a0]">Instant preview</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0b141a] border border-white/[0.06] flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#06b6d4]/20 text-[#06b6d4] flex items-center justify-center">
                      <FileText size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-white">Documents</span>
                      <span className="text-[10px] text-[#8696a0]">PDF, Code, Archives</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0b141a] border border-white/[0.06] flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#ef4444]/20 text-[#ef4444] flex items-center justify-center">
                      <MapPin size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-white">Live Location</span>
                      <span className="text-[10px] text-[#8696a0]">Google Maps pin</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] text-[#8696a0] flex items-center justify-between">
                <span>Secure Media Token Authorization</span>
                <span className="font-mono text-[#a855f7]">RBAC Access Control</span>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* BENTO CARD 7: GROUP CHANNELS & ROLE-BASED ACCESS */}
            {/* Span: 12 (Full width on all viewports) */}
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
                    Collaborate with unlimited members. Create announcement channels, assign administrators, broadcast encrypted updates, and monitor delivery status across entire teams.
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
