"use client";

import { useState } from "react";
import { 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Lock, 
  Terminal, 
  CheckCircle2, 
  Radio, 
  Layers, 
  Sparkles 
} from "lucide-react";
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
    <div className="min-h-screen bg-[#08090a] text-[#f7f8f8] flex flex-col selection:bg-[#5e6ad2]/30 selection:text-white">
      {/* Precision Linear Top Navigation Rail */}
      <header className="h-14 border-b border-[#1f2228] bg-[#08090a]/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-[6px] bg-gradient-to-br from-[#5e6ad2] to-[#717cf0] flex items-center justify-center shadow-[0_0_12px_rgba(94,106,210,0.35)]">
            <Radio size={14} className="text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight text-[#f7f8f8]">EchoChat</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[4px] bg-[#16181d] border border-[#1f2228] text-[#8a8f98]">
              v2.5
            </span>
          </div>
        </div>

        {/* Center Technical Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs text-[#8a8f98] font-medium" aria-label="Product Navigation">
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-[4px] bg-[#101114] border border-[#1f2228] text-[#8a8f98]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#30a46c] animate-pulse" />
            <span>Systems Online</span>
          </span>
          <a href="#features" className="hover:text-[#f7f8f8] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5e6ad2] rounded">Architecture</a>
          <a href="#encryption" className="hover:text-[#f7f8f8] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5e6ad2] rounded">E2EE Security</a>
          <a href="#telemetry" className="hover:text-[#f7f8f8] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5e6ad2] rounded">Telemetry</a>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLoginClick}
            className="px-3.5 py-1.5 rounded-[6px] text-xs font-medium text-[#8a8f98] hover:text-[#f7f8f8] hover:bg-[#16181d] border border-transparent hover:border-[#1f2228] transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e6ad2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090a]"
            aria-label="Sign in to your account"
          >
            Sign In
          </button>
          <button
            onClick={handleGetStartClick}
            className="px-3.5 py-1.5 rounded-[6px] text-xs font-medium text-[#f7f8f8] bg-[#5e6ad2] hover:bg-[#6875e8] active:bg-[#4f59b8] shadow-[0_1px_2px_rgba(0,0,0,0.4),0_0_12px_rgba(94,106,210,0.25)] transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e6ad2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090a] flex items-center gap-1.5"
            aria-label="Get started with EchoChat"
          >
            <span>Launch App</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </header>

      {/* Main Asymmetric Operational Dashboard View */}
      <main className="flex-1 flex flex-col justify-center px-6 lg:px-12 py-10 max-w-7xl mx-auto w-full">
        {/* Asymmetric 58/42 Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column (58% / 7 cols) - Content, strict 2-line headline, direct triggers */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Precision Linear Badge */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[6px] bg-[#101114] border border-[#1f2228] w-fit shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2] animate-ping" />
              <span className="text-[11px] font-mono tracking-wide text-[#8a8f98]">
                LINEAR SYSTEM v2.5 // SECURE WEBSOCKET CLUSTER
              </span>
            </div>

            {/* Strict 2-Line Headline (Taste Skill House Rule) */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.035em] text-[#f7f8f8] leading-[1.12]">
              The real-time messaging engine built for high-velocity teams.
            </h1>

            {/* Editorial Secondary Description */}
            <p className="text-sm sm:text-base text-[#8a8f98] leading-relaxed max-w-xl">
              Zero-latency peer sync, local private key custody with Curve25519 encryption, and an obsidian interface crafted with precision dark tokens.
            </p>

            {/* Impeccable Action Buttons with Polish */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleGetStartClick}
                className="px-5 py-2.5 rounded-[6px] bg-[#5e6ad2] hover:bg-[#6875e8] active:bg-[#4f59b8] text-[#f7f8f8] text-sm font-medium shadow-[0_1px_2px_rgba(0,0,0,0.4),0_0_16px_rgba(94,106,210,0.3)] transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e6ad2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090a] flex items-center gap-2"
                aria-label="Get Started"
              >
                <span>Get Started</span>
                <ArrowRight size={15} />
              </button>

              <button
                onClick={handleLoginClick}
                className="px-5 py-2.5 rounded-[6px] bg-[#101114] hover:bg-[#16181d] border border-[#1f2228] hover:border-[#2e323b] text-[#f7f8f8] text-sm font-medium transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e6ad2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090a]"
                aria-label="Sign In"
              >
                Sign In
              </button>
            </div>

            {/* Telemetry Metrics Bar (Asymmetric Data Strip) */}
            <div className="pt-6 border-t border-[#1f2228] grid grid-cols-3 gap-4 text-left">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-mono text-[#62666d] tracking-wider uppercase">Cipher Protocol</span>
                <span className="text-xs font-semibold text-[#f7f8f8] flex items-center gap-1.5">
                  <Lock size={12} className="text-[#5e6ad2]" />
                  AES-256-GCM
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-mono text-[#62666d] tracking-wider uppercase">Sync Latency</span>
                <span className="text-xs font-semibold text-[#f7f8f8] flex items-center gap-1.5">
                  <Zap size={12} className="text-[#30a46c]" />
                  &lt; 24ms Realtime
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-mono text-[#62666d] tracking-wider uppercase">Transport Layer</span>
                <span className="text-xs font-semibold text-[#f7f8f8] flex items-center gap-1.5">
                  <Radio size={12} className="text-[#5e6ad2]" />
                  Secure WebSocket
                </span>
              </div>
            </div>
          </div>

          {/* Right Column (42% / 5 cols) - Linear Asymmetric Bento Workspace Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-[8px] bg-[#101114] border border-[#1f2228] hover:border-[#2e323b] shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all duration-200 overflow-hidden">
              
              {/* Window Header */}
              <div className="h-9 px-3.5 bg-[#0c0d0e] border-b border-[#1f2228] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27282b]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27282b]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27282b]" />
                </div>
                <div className="text-[11px] font-mono text-[#62666d] flex items-center gap-1.5">
                  <Terminal size={11} />
                  <span>echochat://channel/core</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-[#30a46c]" title="Socket Live" />
              </div>

              {/* Chat Thread Mockup */}
              <div className="p-5 flex flex-col gap-3.5 bg-[#101114]">
                {/* Active Channel Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#1f2228]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-[6px] bg-[#16181d] border border-[#1f2228] flex items-center justify-center text-xs font-semibold text-[#5e6ad2]">
                      EC
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#f7f8f8]">EchoChat Engineering</div>
                      <div className="text-[10px] text-[#8a8f98]">14 active peers • E2EE Encrypted</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[4px] bg-[#30a46c]/10 text-[#30a46c] border border-[#30a46c]/20">
                    Live
                  </span>
                </div>

                {/* Received Bubble */}
                <div className="flex flex-col gap-1 items-start max-w-[85%]">
                  <div className="text-[10px] text-[#8a8f98] font-mono">alex.dev // 22:42</div>
                  <div className="px-3.5 py-2.5 rounded-[6px] bg-[#16181d] border border-[#1f2228] text-xs text-[#f7f8f8] leading-relaxed">
                    Deployed hotfix to production cluster. Socket channel ACKed in 18ms.
                  </div>
                </div>

                {/* Sent Bubble */}
                <div className="flex flex-col gap-1 items-end max-w-[85%] self-end">
                  <div className="text-[10px] text-[#8a8f98] font-mono">you // 22:43</div>
                  <div className="px-3.5 py-2.5 rounded-[6px] bg-[#5e6ad2] text-xs text-[#f7f8f8] leading-relaxed shadow-[0_2px_8px_rgba(94,106,210,0.25)]">
                    Verified live. Linear design tokens and accessibility snapshots passing.
                  </div>
                </div>

                {/* Interactive Simulated Input Dock */}
                <div className="mt-2 pt-3 border-t border-[#1f2228] flex items-center justify-between gap-2">
                  <div className="flex-1 bg-[#0c0d0e] border border-[#1f2228] rounded-[6px] px-3 py-1.5 text-xs text-[#62666d] flex items-center justify-between">
                    <span>Message #engineering...</span>
                    <span className="font-mono text-[10px] bg-[#16181d] px-1 py-0.5 rounded text-[#8a8f98]">⌘K</span>
                  </div>
                  <button 
                    onClick={handleGetStartClick}
                    className="p-2 rounded-[6px] bg-[#5e6ad2] hover:bg-[#6875e8] text-white transition-all duration-150 active:scale-[0.95] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5e6ad2]"
                    aria-label="Send message in preview"
                  >
                    <ArrowRight size={13} />
                  </button>
                </div>

              </div>

              {/* Bento Lower Metric Callout */}
              <div className="px-5 py-3 bg-[#0c0d0e] border-t border-[#1f2228] flex items-center justify-between text-[11px] text-[#8a8f98]">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-[#5e6ad2]" />
                  <span>Hardware Key Storage</span>
                </span>
                <span className="font-mono text-[#62666d]">Curve25519-SHA512</span>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Linear Precision Footer */}
      <footer className="border-t border-[#1f2228] bg-[#08090a] py-6 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8a8f98]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#30a46c]" />
            <span className="font-medium text-[#f7f8f8]">EchoChat Systems Operational</span>
            <span className="text-[#62666d]">•</span>
            <span>Linear Design Specification</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={handleLoginClick} className="hover:text-[#f7f8f8] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5e6ad2] rounded">
              Sign In
            </button>
            <button onClick={handleGetStartClick} className="hover:text-[#f7f8f8] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5e6ad2] rounded">
              Register
            </button>
            <a href="https://github.com/Soumyaroy428/EchoChat" target="_blank" rel="noopener noreferrer" className="hover:text-[#f7f8f8] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5e6ad2] rounded">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
