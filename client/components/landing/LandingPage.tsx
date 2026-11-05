"use client";

import { useState } from "react";
import { ArrowRight, Lock, CheckCircle2, ShieldCheck, Smartphone, Laptop, Sparkles } from "lucide-react";
import AuthPage from "../auth/AuthPage";

export default function LandingPage() {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

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
      className="min-h-screen bg-[#0c1317] text-[#e9edef] flex flex-col relative selection:bg-[#00a884]/30 selection:text-white"
      style={{
        backgroundImage: "linear-gradient(rgba(12, 19, 23, 0.82), rgba(12, 19, 23, 0.90)), url('/chat-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed"
      }}
    >
      {/* WhatsApp Web Brand Top Header Bar */}
      <header className="h-20 bg-[#111b21]/90 backdrop-blur-md border-b border-white/10 px-6 sm:px-12 flex items-center justify-between z-30 sticky top-0 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Official EchoChat Logo */}
          <img
            src="/logo-main.svg"
            alt="EchoChat Logo"
            className="h-10 sm:h-12 w-auto object-contain cursor-pointer"
            onClick={() => setShowAuth(false)}
          />
          <span className="hidden sm:inline-block text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#00a884]/15 text-[#00a884] border border-[#00a884]/30">
            Web Client
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLoginClick}
            className="px-5 py-2 rounded-lg text-sm font-medium text-[#e9edef] hover:bg-white/10 border border-white/15 transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a884]"
            aria-label="Login to EchoChat"
          >
            Login
          </button>
          <button
            onClick={handleGetStartClick}
            className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-[#00a884] hover:bg-[#02906f] active:bg-[#017a5e] shadow-[0_2px_12px_rgba(0,168,132,0.35)] transition-all duration-150 active:scale-[0.98] flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a884]"
            aria-label="Get Started with EchoChat"
          >
            <span>Get Started</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </header>

      {/* Main WhatsApp-Style Central Experience */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 z-20">
        <div className="w-full max-w-5xl bg-[#111b21]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10 lg:p-12 items-center">
            
            {/* Left Column: WhatsApp-Style Steps & Instructions */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#00a884] uppercase tracking-wider mb-2">
                  <Sparkles size={14} />
                  Simple • Private • Realtime
                </span>
                <h1 className="text-3xl sm:text-4xl font-bold text-[#e9edef] tracking-tight leading-snug">
                  Use EchoChat on your computer
                </h1>
                <p className="text-sm sm:text-base text-[#8696a0] mt-2 leading-relaxed">
                  Connect with friends and family seamlessly. Fast messaging with local end-to-end encryption.
                </p>
              </div>

              {/* Numbered Steps */}
              <ol className="space-y-4 text-sm text-[#d1d7db]">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#202c33] border border-white/10 text-[#00a884] font-semibold text-xs flex items-center justify-center mt-0.5">
                    1
                  </span>
                  <span>
                    Open <strong className="text-white">EchoChat</strong> on your browser or device.
                  </span>
                </li>

                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#202c33] border border-white/10 text-[#00a884] font-semibold text-xs flex items-center justify-center mt-0.5">
                    2
                  </span>
                  <span>
                    Enter your email to receive an instant <strong className="text-white">One-Time Password (OTP)</strong>.
                  </span>
                </li>

                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#202c33] border border-white/10 text-[#00a884] font-semibold text-xs flex items-center justify-center mt-0.5">
                    3
                  </span>
                  <span>
                    Start private, encrypted conversations with real-time socket delivery.
                  </span>
                </li>
              </ol>

              {/* CTA Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={handleGetStartClick}
                  className="px-7 py-3 rounded-lg text-base font-semibold text-white bg-[#00a884] hover:bg-[#02906f] active:bg-[#017a5e] shadow-[0_4px_16px_rgba(0,168,132,0.4)] transition-all duration-150 active:scale-[0.98] flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a884]"
                >
                  <span>Get Started</span>
                  <ArrowRight size={18} />
                </button>

                <button
                  onClick={handleLoginClick}
                  className="px-7 py-3 rounded-lg text-base font-medium text-[#e9edef] bg-[#202c33] hover:bg-[#2a3942] border border-white/10 transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a884]"
                >
                  Login to Account
                </button>
              </div>

              {/* Security Banner */}
              <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-[#8696a0]">
                <ShieldCheck size={16} className="text-[#00a884] flex-shrink-0" />
                <span>End-to-end encrypted. Your personal messages and calls are secured.</span>
              </div>
            </div>

            {/* Right Column: WhatsApp Phone Showcase Illustration */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-full max-w-[360px] aspect-square rounded-2xl bg-[#0c1317]/80 border border-white/10 flex items-center justify-center p-6 shadow-inner overflow-hidden group">
                
                {/* Subtle Glow Behind Image */}
                <div className="absolute inset-0 bg-radial-gradient from-[#00a884]/10 via-transparent to-transparent pointer-events-none" />

                {/* The WhatsApp-style illustration */}
                <img
                  src="/landing-page.svg"
                  alt="EchoChat WhatsApp Interface"
                  className="w-full h-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.7)] transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="mt-4 flex items-center gap-3 text-xs text-[#8696a0]">
                <span className="flex items-center gap-1.5">
                  <Laptop size={14} className="text-[#00a884]" />
                  <span>Desktop & Web</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Smartphone size={14} className="text-[#00a884]" />
                  <span>Mobile Compatible</span>
                </span>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* WhatsApp-Style Clean Footer */}
      <footer className="p-6 border-t border-white/10 bg-[#111b21]/90 backdrop-blur-md z-20 text-center text-xs text-[#8696a0]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Lock size={13} className="text-[#00a884]" />
            <span>End-to-end encrypted. &copy; 2026 EchoChat. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={handleLoginClick} className="hover:text-white transition-colors">
              Login
            </button>
            <button onClick={handleGetStartClick} className="hover:text-white transition-colors">
              Get Started
            </button>
            <a href="https://github.com/Soumyaroy428/EchoChat" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
