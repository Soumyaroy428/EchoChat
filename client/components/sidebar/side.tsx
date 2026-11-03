"use client";

import { MessageSquare, Phone, Radio, UserCircle, Settings } from "lucide-react";

type SideProps = {
  hasActiveChat: boolean;
  activeTab?: "chats" | "calls" | "status" | "profile";
  onTabChange?: (tab: "chats" | "calls" | "status" | "profile") => void;
  isProfileOpen?: boolean;
  onProfileClick?: () => void;
  onMessagesClick?: () => void;
  avatar?: string;
  userName?: string;
};

export default function Side({
  hasActiveChat,
  activeTab = "chats",
  onTabChange,
  isProfileOpen,
  onProfileClick,
  onMessagesClick,
  avatar,
  userName,
}: SideProps) {
  const currentTab = isProfileOpen ? "profile" : activeTab;

  const handleTab = (tab: "chats" | "calls" | "status" | "profile") => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      if (tab === "profile" && onProfileClick) onProfileClick();
      if (tab === "chats" && onMessagesClick) onMessagesClick();
    }
  };

  return (
    <aside className="h-full w-full rounded-2xl md:rounded-3xl border border-[rgba(148,163,184,0.12)] bg-[#0B1222]/90 backdrop-blur-xl p-2.5 md:p-3 shadow-2xl flex flex-row md:flex-col items-center justify-around md:justify-between gap-2 z-20">
      
      {/* Top Section: Brand Glyph + Nav Actions */}
      <div className="flex flex-row md:flex-col items-center gap-2 md:gap-3 w-full">
        {/* Logo Glyph */}
        <div 
          onClick={() => handleTab("chats")}
          className="hidden md:flex w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#10B981] to-[#06B6D4] p-0.5 shadow-lg shadow-[#10B981]/15 mb-2 cursor-pointer hover:scale-105 transition-transform items-center justify-center"
          title="ECHO-CHAT"
        >
          <div className="w-full h-full bg-[#0F172A] rounded-[14px] flex items-center justify-center">
            <svg className="w-5 h-5 text-[#10B981]" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
        </div>

        {/* Chats Tab */}
        <button
          type="button"
          onClick={() => handleTab("chats")}
          aria-label="Chats"
          title="All Chats"
          className={`relative group flex h-11 w-11 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-xl md:rounded-2xl transition-all ${
            currentTab === "chats"
              ? "bg-[#10B981]/15 text-[#10B981] shadow-sm shadow-[#10B981]/10 border border-[#10B981]/30"
              : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]/60"
          }`}
        >
          {currentTab === "chats" && (
            <span className="hidden md:block absolute left-0 w-1 h-5 bg-[#10B981] rounded-r-full shadow-[0_0_10px_#10B981]"></span>
          )}
          <MessageSquare className="w-5 h-5 transition-transform group-hover:scale-110" strokeWidth={2} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#10B981] ring-2 ring-[#0B1222]"></span>
        </button>

        {/* Calls Tab */}
        <button
          type="button"
          onClick={() => handleTab("calls")}
          aria-label="Calls"
          title="Voice & Video Calls"
          className={`relative group flex h-11 w-11 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-xl md:rounded-2xl transition-all ${
            currentTab === "calls"
              ? "bg-[#10B981]/15 text-[#10B981] shadow-sm shadow-[#10B981]/10 border border-[#10B981]/30"
              : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]/60"
          }`}
        >
          {currentTab === "calls" && (
            <span className="hidden md:block absolute left-0 w-1 h-5 bg-[#10B981] rounded-r-full shadow-[0_0_10px_#10B981]"></span>
          )}
          <Phone className={`w-5 h-5 transition-transform group-hover:scale-110 ${hasActiveChat ? "text-[#10B981]" : ""}`} strokeWidth={2} />
        </button>

        {/* Status / Stories Tab */}
        <button
          type="button"
          onClick={() => handleTab("status")}
          aria-label="Status & Stories"
          title="Status Stories"
          className={`relative group flex h-11 w-11 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-xl md:rounded-2xl transition-all ${
            currentTab === "status"
              ? "bg-[#06B6D4]/15 text-[#06B6D4] shadow-sm shadow-[#06B6D4]/10 border border-[#06B6D4]/30"
              : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]/60"
          }`}
        >
          {currentTab === "status" && (
            <span className="hidden md:block absolute left-0 w-1 h-5 bg-[#06B6D4] rounded-r-full shadow-[0_0_10px_#06B6D4]"></span>
          )}
          <Radio className="w-5 h-5 transition-transform group-hover:scale-110" strokeWidth={2} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#06B6D4] ring-2 ring-[#0B1222]"></span>
        </button>
      </div>

      {/* Bottom Profile Avatar */}
      <button
        type="button"
        onClick={() => handleTab("profile")}
        aria-label="Open profile settings"
        aria-pressed={currentTab === "profile"}
        title={userName ? `${userName} (Profile)` : "Your Profile"}
        className={`relative group flex h-11 w-11 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-full transition-all ${
          currentTab === "profile"
            ? "ring-2 ring-[#10B981] p-0.5 shadow-lg shadow-[#10B981]/20"
            : "ring-1 ring-[rgba(148,163,184,0.2)] hover:ring-[#10B981]"
        }`}
      >
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt={userName ? `${userName}'s profile` : "Your profile"}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-[#1E293B] flex items-center justify-center text-[#94A3B8] group-hover:text-[#F8FAFC]">
            <UserCircle size={22} />
          </div>
        )}
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#10B981] border-2 border-[#0B1222] rounded-full"></span>
      </button>
    </aside>
  );
}
