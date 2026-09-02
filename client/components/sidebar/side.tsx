"use client";

import { MessageSquare, Phone, Radio, UserCircle } from "lucide-react";

type SideProps = {
  hasActiveChat: boolean;
  isProfileOpen: boolean;
  onProfileClick: () => void;
  onMessagesClick: () => void;
  avatar?: string;
  userName?: string;
};

export default function Side({ hasActiveChat, isProfileOpen, onProfileClick, onMessagesClick, avatar, userName }: SideProps) {
  return (
    <aside className="rounded-[2rem] border border-white/10 bg-[#07101b]/95 p-5 shadow-[0_10px_60px_-40px_rgba(0,0,0,0.9)] flex flex-col items-center gap-5">
      <button
        type="button"
        onClick={onMessagesClick}
        aria-label="Open contact list"
        className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-blue-500/20 text-blue-300 border border-blue-500/20 shadow-sm shadow-blue-500/5 transition hover:bg-blue-500/25"
      >
        <MessageSquare size={24} />
      </button>
      <button className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 transition">
        <Phone
          size={18}
          className={hasActiveChat ? "text-emerald-400" : "text-gray-400"}
        />
      </button>
      <button className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 transition">
        <Radio size={20} />
      </button>
      
      <button
        type="button"
        onClick={onProfileClick}
        aria-label="Open profile settings"
        aria-pressed={isProfileOpen}
        className={`mt-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] border transition ${
          isProfileOpen
            ? "border-blue-400/50 bg-blue-500/20 text-blue-200"
            : "border-white/10 bg-[#131c2b] text-white hover:bg-white/10"
        }`}
      >
        {avatar ? (
          // Avatar URLs are user-provided and may come from a local upload server.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt={userName ? `${userName}'s profile` : "Your profile"} className="h-full w-full rounded-[2rem] object-cover" />
        ) : (
          <UserCircle size={26} />
        )}
      </button>
    </aside>
  );
}
