"use client";

import { useState } from "react";
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
  Sparkles
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

export default function LandingPage() {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [modalContent, setModalContent] = useState<"privacy" | "terms" | "security" | null>(null);

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
      className="min-h-screen bg-[#0b141a] text-[#e9edef] flex flex-col font-sans selection:bg-[#00a884]/30 selection:text-white relative"
      style={{
        backgroundImage: "linear-gradient(rgba(11, 20, 26, 0.84), rgba(11, 20, 26, 0.92)), url('/chat-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed"
      }}
    >
      {/* WhatsApp Web Brand Top Header Bar (Matching Header Background) */}
      <header className="h-20 bg-[#111b21] border-b border-white/[0.08] px-6 sm:px-12 flex items-center justify-between z-30 sticky top-0 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-3">
          {/* Logo with transparent background - blends 100% with header */}
          <div className="flex items-center cursor-pointer" onClick={() => setShowAuth(false)}>
            <img
              src="/logo-main.svg"
              alt="EchoChat Logo"
              className="h-9 sm:h-11 w-auto object-contain"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={handleLoginClick}
            className="px-5 py-2 rounded-lg text-sm font-medium text-[#e9edef] hover:bg-white/[0.08] border border-white/10 transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a884]"
            aria-label="Login to EchoChat"
          >
            Login
          </button>
          <button
            onClick={handleGetStartClick}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#00a884] hover:bg-[#02906f] active:bg-[#017a5e] shadow-[0_2px_12px_rgba(0,168,132,0.35)] transition-all duration-150 active:scale-[0.98] flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a884]"
            aria-label="Get Started with EchoChat"
          >
            <span>Get Started</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 z-20 max-w-7xl mx-auto w-full">
        
        {/* ======================================================== */}
        {/* HERO CARD: WhatsApp-Style Central Experience */}
        {/* ======================================================== */}
        <section className="w-full bg-[#111b21]/95 backdrop-blur-2xl border border-white/[0.08] rounded-2xl sm:rounded-3xl shadow-[0_30px_70px_-15px_rgba(0,0,0,0.85)] overflow-hidden my-4 sm:my-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 p-6 sm:p-10 lg:p-14 items-center">
            
            {/* Left Column: Numbered WhatsApp Instructions & CTAs */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00a884]/15 border border-[#00a884]/30 text-[#00a884] text-xs font-semibold uppercase tracking-wider mb-3">
                  <Sparkles size={13} />
                  <span>Simple • Private • Real-Time</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#e9edef] tracking-tight leading-[1.18]">
                  Use EchoChat on your computer
                </h1>
                <p className="text-sm sm:text-base text-[#8696a0] mt-3 leading-relaxed max-w-xl">
                  Connect with friends, family, and teams with lightning-fast delivery. Protected by client-side encryption and zero-knowledge privacy.
                </p>
              </div>

              {/* Numbered Steps */}
              <ol className="space-y-4 text-sm text-[#d1d7db]">
                <li className="flex items-start gap-3.5">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#202c33] border border-white/10 text-[#00a884] font-bold text-xs flex items-center justify-center mt-0.5 shadow-sm">
                    1
                  </span>
                  <div className="flex flex-col">
                    <span className="font-medium text-white">Open EchoChat in any modern browser</span>
                    <span className="text-xs text-[#8696a0]">Access your conversations on web, desktop, and mobile devices simultaneously.</span>
                  </div>
                </li>

                <li className="flex items-start gap-3.5">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#202c33] border border-white/10 text-[#00a884] font-bold text-xs flex items-center justify-center mt-0.5 shadow-sm">
                    2
                  </span>
                  <div className="flex flex-col">
                    <span className="font-medium text-white">Instant passwordless email verification (OTP)</span>
                    <span className="text-xs text-[#8696a0]">Sign in securely with one-time security codes dispatched directly to your inbox.</span>
                  </div>
                </li>

                <li className="flex items-start gap-3.5">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#202c33] border border-white/10 text-[#00a884] font-bold text-xs flex items-center justify-center mt-0.5 shadow-sm">
                    3
                  </span>
                  <div className="flex flex-col">
                    <span className="font-medium text-white">End-to-end encrypted messaging</span>
                    <span className="text-xs text-[#8696a0]">Exchange encrypted chats, voice notes, files, and video calls in sub-24ms realtime.</span>
                  </div>
                </li>
              </ol>

              {/* CTA Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={handleGetStartClick}
                  className="px-7 py-3 rounded-xl text-base font-semibold text-white bg-[#00a884] hover:bg-[#02906f] active:bg-[#017a5e] shadow-[0_4px_20px_rgba(0,168,132,0.4)] transition-all duration-150 active:scale-[0.98] flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a884]"
                >
                  <span>Get Started</span>
                  <ArrowRight size={18} />
                </button>

                <button
                  onClick={handleLoginClick}
                  className="px-7 py-3 rounded-xl text-base font-medium text-[#e9edef] bg-[#202c33] hover:bg-[#2a3942] border border-white/10 transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a884]"
                >
                  Login to Account
                </button>
              </div>

              {/* Security Banner */}
              <div className="pt-4 border-t border-white/[0.08] flex items-center gap-2.5 text-xs text-[#8696a0]">
                <ShieldCheck size={17} className="text-[#00a884] flex-shrink-0" />
                <span>End-to-end encrypted • Your messages, calls, and media stay strictly private between you and recipients.</span>
              </div>
            </div>

            {/* Right Column: Transparent Phone Showcase (No White Box!) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-full max-w-[380px] rounded-2xl bg-[#0c1317]/85 border border-white/[0.08] p-6 shadow-2xl flex items-center justify-center group overflow-hidden">
                {/* Subtle emerald radial ambient light */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,168,132,0.12),_transparent_70%)] pointer-events-none" />

                {/* Transparent SVG Illustration */}
                <img
                  src="/landing-page.svg"
                  alt="EchoChat WhatsApp Interface"
                  className="w-full h-auto object-contain max-h-[440px] drop-shadow-[0_20px_35px_rgba(0,0,0,0.7)] group-hover:scale-[1.03] transition-transform duration-300"
                />
              </div>

              {/* Platform Badges */}
              <div className="mt-4 flex items-center gap-4 text-xs text-[#8696a0]">
                <span className="flex items-center gap-1.5">
                  <Laptop size={14} className="text-[#00a884]" />
                  <span>Desktop & Web</span>
                </span>
                <span className="text-white/20">•</span>
                <span className="flex items-center gap-1.5">
                  <Smartphone size={14} className="text-[#00a884]" />
                  <span>iOS & Android</span>
                </span>
                <span className="text-white/20">•</span>
                <span className="flex items-center gap-1.5">
                  <Zap size={14} className="text-[#00a884]" />
                  <span>Realtime WebSockets</span>
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* ======================================================== */}
        {/* IMPRESSIVE FEATURE BENTO: Modern Architecture Showcase */}
        {/* ======================================================== */}
        <section className="w-full my-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#e9edef] tracking-tight">
              Engineered for speed, built for privacy
            </h2>
            <p className="text-sm sm:text-base text-[#8696a0] mt-2">
              Everything you need in a modern communications suite, delivered with zero tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-[#111b21]/90 border border-white/[0.08] hover:border-[#00a884]/40 transition-all duration-200 shadow-lg flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#00a884]/15 border border-[#00a884]/30 text-[#00a884] flex items-center justify-center mb-4">
                  <Lock size={20} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">End-to-End Encrypted</h3>
                <p className="text-xs text-[#8696a0] leading-relaxed">
                  Keys are generated and stored strictly on your device using Curve25519 and AES-256-GCM. No servers can read your content.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] font-mono text-[#00a884]">
                WebCrypto API Native
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-[#111b21]/90 border border-white/[0.08] hover:border-[#00a884]/40 transition-all duration-200 shadow-lg flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#06b6d4]/15 border border-[#06b6d4]/30 text-[#06b6d4] flex items-center justify-center mb-4">
                  <Radio size={20} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Instant Realtime Sync</h3>
                <p className="text-xs text-[#8696a0] leading-relaxed">
                  Persistent bi-directional WebSocket connections ensure sub-24ms dispatch, live typing indicators, and instant read receipts.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] font-mono text-[#06b6d4]">
                Socket.IO + WebRTC
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-[#111b21]/90 border border-white/[0.08] hover:border-[#00a884]/40 transition-all duration-200 shadow-lg flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/15 border border-[#8b5cf6]/30 text-[#8b5cf6] flex items-center justify-center mb-4">
                  <MessageSquare size={20} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Rich Multimodal Chats</h3>
                <p className="text-xs text-[#8696a0] leading-relaxed">
                  Seamlessly exchange voice notes, high-definition videos, images, document downloads, and live Google Maps locations.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] font-mono text-[#8b5cf6]">
                Voice, Video & Files
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-[#111b21]/90 border border-white/[0.08] hover:border-[#00a884]/40 transition-all duration-200 shadow-lg flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#10b981]/15 border border-[#10b981]/30 text-[#10b981] flex items-center justify-center mb-4">
                  <EyeOff size={20} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Zero-Knowledge Privacy</h3>
                <p className="text-xs text-[#8696a0] leading-relaxed">
                  No tracking pixels, no advertising analytics, and no third-party data harvesting. Only your authorized contacts can connect.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] font-mono text-[#10b981]">
                GDPR & Privacy First
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* ======================================================== */}
      {/* COMPREHENSIVE PRODUCTION APPLICATION FOOTER */}
      {/* ======================================================== */}
      <footer className="border-t border-white/[0.08] bg-[#0c1317]/95 backdrop-blur-md z-30 pt-12 pb-8 px-6 sm:px-12 text-sm text-[#8696a0]">
        <div className="max-w-7xl mx-auto">
          
          {/* 4-Column Navigation Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            
            {/* Col 1: Product */}
            <div className="flex flex-col gap-3">
              <span className="font-semibold text-white text-xs uppercase tracking-wider">Product</span>
              <button onClick={() => setShowAuth(false)} className="text-left text-xs text-[#8696a0] hover:text-[#00a884] transition-colors">Web Client</button>
              <button onClick={handleGetStartClick} className="text-left text-xs text-[#8696a0] hover:text-[#00a884] transition-colors">Registration</button>
              <button onClick={handleLoginClick} className="text-left text-xs text-[#8696a0] hover:text-[#00a884] transition-colors">Account Sign In</button>
              <span className="text-xs text-[#62666d] flex items-center gap-1.5">
                <span>Desktop App</span>
                <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-[#8696a0]">Soon</span>
              </span>
              <span className="text-xs text-[#62666d] flex items-center gap-1.5">
                <span>iOS & Android</span>
                <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-[#8696a0]">Beta</span>
              </span>
            </div>

            {/* Col 2: Security & Privacy */}
            <div className="flex flex-col gap-3">
              <span className="font-semibold text-white text-xs uppercase tracking-wider">Privacy & Trust</span>
              <button 
                onClick={() => setModalContent("privacy")}
                className="text-left text-xs text-[#8696a0] hover:text-[#00a884] transition-colors flex items-center justify-between group"
              >
                <span>Privacy Policy</span>
                <ChevronRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button 
                onClick={() => setModalContent("terms")}
                className="text-left text-xs text-[#8696a0] hover:text-[#00a884] transition-colors flex items-center justify-between group"
              >
                <span>Terms of Service</span>
                <ChevronRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button 
                onClick={() => setModalContent("security")}
                className="text-left text-xs text-[#8696a0] hover:text-[#00a884] transition-colors flex items-center justify-between group"
              >
                <span>Security Whitepaper</span>
                <ChevronRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
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
