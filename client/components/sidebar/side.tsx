"use client";

import { MessageSquare, Phone, Radio, UserCircle } from "lucide-react";

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
    <aside className="h-full w-full rounded-[1.5rem] md:rounded-[2rem] border border-white/10 bg-[#07101b]/95 p-3 md:p-5 shadow-[0_10px_60px_-40px_rgba(0,0,0,0.9)] flex flex-row md:flex-col items-center justify-around md:justify-start gap-2 md:gap-5">
      {/* Chats Tab */}
      <button
        type="button"
        onClick={() => handleTab("chats")}
        aria-label="Chats"
        className={`flex h-12 w-12 md:h-16 md:w-16 flex-shrink-0 items-center justify-center rounded-[1rem] md:rounded-[1.5rem] border transition ${
          currentTab === "chats"
            ? "border-blue-500/30 bg-blue-500/20 text-blue-300 shadow-sm shadow-blue-500/10"
            : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
        }`}
      >
        <MessageSquare size={20} className="md:w-6 md:h-6" />
      </button>

      {/* Calls Tab */}
      <button
        type="button"
        onClick={() => handleTab("calls")}
        aria-label="Calls"
        className={`flex h-12 w-12 md:h-16 md:w-16 flex-shrink-0 items-center justify-center rounded-[1rem] md:rounded-[1.5rem] border transition ${
          currentTab === "calls"
            ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-300 shadow-sm shadow-emerald-500/10"
            : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
        }`}
      >
        <Phone
          size={18}
          className={hasActiveChat ? "text-emerald-400" : currentTab === "calls" ? "text-emerald-300" : "text-gray-400"}
        />
      </button>

      {/* Status / Stories Tab */}
      <button
        type="button"
        onClick={() => handleTab("status")}
        aria-label="Status & Stories"
        className={`flex h-12 w-12 md:h-16 md:w-16 flex-shrink-0 items-center justify-center rounded-[1rem] md:rounded-[1.5rem] border transition ${
          currentTab === "status"
            ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-300 shadow-sm shadow-emerald-500/10"
            : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
        }`}
      >
        <Radio size={20} className="md:w-6 md:h-6" />
      </button>

      {/* Profile Tab */}
      <button
        type="button"
        onClick={() => handleTab("profile")}
        aria-label="Open profile settings"
        aria-pressed={currentTab === "profile"}
        className={`md:mt-auto flex h-12 w-12 md:h-16 md:w-16 flex-shrink-0 items-center justify-center rounded-[1rem] md:rounded-[1.5rem] border transition ${
          currentTab === "profile"
            ? "border-blue-400/50 bg-blue-500/20 text-blue-200"
            : "border-white/10 bg-[#131c2b] text-white hover:bg-white/10"
        }`}
      >
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt={userName ? `${userName}'s profile` : "Your profile"}
            className="h-full w-full rounded-[1rem] md:rounded-[2rem] object-cover"
          />
        ) : (
          <UserCircle size={24} className="md:w-[26px] md:h-[26px]" />
        )}
      </button>
    </aside>
  );
}
