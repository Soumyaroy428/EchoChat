"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
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
    <div className="min-h-screen bg-[#0e0e0e] flex flex-col">
      {/* Header Section */}
      <header className="flex items-center justify-between p-6 border-b border-[#b1acac]">
        <div className="flex items-center gap-3">
          <img
            src="/logo-main.svg"
            alt="EchoChat Logo"
            className="w-100 h-20"
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleLoginClick}
            className="px-6 py-2 rounded-lg border border-[#3a3a3a] text-white hover:bg-[#2a2a2a] transition-colors"
          >
            Login
          </button>
          <button
            onClick={handleGetStartClick}
            className="px-6 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            Get Start
            <ArrowRight size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Section */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Welcome Text */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
              Welcome to EchoChat
            </h1>
            <p className="text-xl text-gray-400">
              Connect with friends and family in real-time. Experience seamless
              messaging with our modern chat platform.
            </p>
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleGetStartClick}
                className="px-8 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center gap-2 text-lg font-medium"
              >
                Get Started
                <ArrowRight size={20} />
              </button>
              <button
                onClick={handleLoginClick}
                className="px-8 py-3 rounded-lg border border-[#3a3a3a] text-white hover:bg-[#2a2a2a] transition-colors text-lg font-medium"
              >
                Login
              </button>
            </div>
          </div>

          {/* Right Side - Image Placeholder */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md aspect-square bg-[#1c1c1c] rounded-2xl border border-[#2a2a2a] flex items-center justify-center">
              <div className="text-center">
                <img
                  src="/landing-page.svg"
                  alt="EchoChat"
                  className="w-112 h-102 mx-auto mb-4 opacity-100"
                />
                
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="p-6 border-t border-[#2a2a2a]">
        <div className="max-w-6xl mx-auto text-center text-gray-500">
          <p>&copy; 2026 EchoChat. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-2 text-sm">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
