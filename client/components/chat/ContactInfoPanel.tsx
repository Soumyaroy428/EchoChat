"use client";

import {
  Bell,
  ChevronRight,
  CircleAlert,
  Download,
  FileImage,
  Heart,
  KeyRound,
  ListPlus,
  LockKeyhole,
  MessageCircleDashed,
  Phone,
  Search,
  ShieldCheck,
  Star,
  Video,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";

type Contact = {
  id: string;
  name: string;
  mobile: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
};

type ContactInfoPanelProps = {
  contact: Contact | null;
  onClose: () => void;
};

const menuItemClass =
  "flex w-full items-center gap-4 px-5 py-4 text-left text-sm font-medium text-[#e9edef] transition hover:bg-white/5";

export default function ContactInfoPanel({ contact, onClose }: ContactInfoPanelProps) {
  const [muted, setMuted] = useState(false);
  const [favourite, setFavourite] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  if (!contact) return null;

  const initials = contact.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const showAction = (message: string) => {
    setActionMessage(message);
    window.setTimeout(() => setActionMessage(null), 2400);
  };

  return (
    <aside className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#111b21] text-[#e9edef] shadow-[0_20px_40px_-30px_rgba(0,0,0,0.9)]">
      <header className="flex items-center gap-5 border-b border-white/10 px-5 py-5">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close contact info"
          className="rounded-full p-1 text-[#d9dde0] transition hover:bg-white/10"
        >
          <X size={23} />
        </button>
        <h2 className="text-base font-semibold">Contact info</h2>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <section className="flex flex-col items-center px-5 pb-7 pt-8 text-center">
          <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-[#2a3942] text-3xl font-semibold text-[#d9e5ea]">
            {contact.avatar ? (
              <img src={contact.avatar} alt={contact.name} className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <h3 className="mt-4 text-2xl font-semibold">{contact.name}</h3>
          <p className="mt-1 text-sm text-[#aebac1]">{contact.mobile}</p>
          <p className="mt-1 text-xs text-[#8696a0]">
            {contact.isOnline ? "online" : contact.lastSeen || "offline"}
          </p>

          <div className="mt-5 flex items-start justify-center gap-5">
            <ActionButton icon={<Phone size={20} />} label="Voice" onClick={() => showAction("Starting a voice call…")} />
            <ActionButton icon={<Video size={20} />} label="Video" onClick={() => showAction("Starting a video call…")} />
            <ActionButton icon={<Search size={20} />} label="Search" onClick={() => showAction("Search is ready in this chat.")} />
          </div>
        </section>

        <div className="border-y border-white/10 px-5 py-5">
          <button type="button" className="flex w-full items-center justify-between text-left" onClick={() => showAction("Media gallery coming soon.")}>
            <span className="flex items-center gap-4 text-sm font-semibold"><FileImage size={21} className="text-[#aebac1]" />Media, links and docs</span>
            <span className="text-sm text-[#aebac1]">0</span>
          </button>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[0, 1, 2].map((item) => (
              <button key={item} type="button" onClick={() => showAction("No shared media yet.")} className="group relative aspect-square overflow-hidden rounded-lg bg-[#23313a]">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,#31444f,#17242b)]" />
                <Download className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#182229]/80 p-2 text-white opacity-0 transition group-hover:opacity-100" size={39} />
              </button>
            ))}
          </div>
        </div>

        <div className="py-2">
          <button type="button" className={menuItemClass} onClick={() => showAction("No starred messages yet.")}><Star size={21} className="text-[#aebac1]" />Starred messages</button>
          <button type="button" className={menuItemClass} onClick={() => setMuted((value) => !value)}>
            <Bell size={21} className="text-[#aebac1]" /><span className="flex-1">Mute notifications</span>
            <span className={`relative h-6 w-10 rounded-full transition ${muted ? "bg-[#00a884]" : "bg-[#667781]"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-[#e9edef] transition ${muted ? "left-5" : "left-1"}`} /></span>
          </button>
          <InfoRow icon={<MessageCircleDashed size={21} />} title="Disappearing messages" subtitle="Off" onClick={() => showAction("Disappearing messages settings opened.")} />
          <InfoRow icon={<ShieldCheck size={21} />} title="Advanced chat privacy" subtitle="Off" onClick={() => showAction("Advanced chat privacy settings opened.")} />
          <InfoRow icon={<LockKeyhole size={21} />} title="Encryption" subtitle="Messages are end-to-end encrypted" onClick={() => showAction("Your messages are protected with end-to-end encryption.")} />
        </div>

        <div className="border-t border-white/10 py-2">
          <button type="button" className={menuItemClass} onClick={() => setFavourite((value) => !value)}><Heart size={21} className={favourite ? "fill-[#ff9aad] text-[#ff9aad]" : "text-[#aebac1]"} />{favourite ? "Remove from favourites" : "Add to favourites"}</button>
          <button type="button" className={menuItemClass} onClick={() => showAction("Lists are not available yet.")}><ListPlus size={21} className="text-[#aebac1]" />Add to list</button>
        </div>

        <div className="border-t border-white/10 py-2">
          <button type="button" className={`${menuItemClass} text-[#ff8fa3] hover:bg-[#ff8fa3]/10`} onClick={() => showAction("Chat cleared locally.")}><CircleAlert size={21} />Clear chat</button>
          <button type="button" className={`${menuItemClass} text-[#ff8fa3] hover:bg-[#ff8fa3]/10`} onClick={() => showAction(`${contact.name} is blocked.`)}><KeyRound size={21} />Block </button>
        </div>
      </div>

      {actionMessage && <div role="status" className="absolute bottom-5 left-1/2 w-max max-w-[85%] -translate-x-1/2 rounded-lg bg-[#233138] px-4 py-2 text-center text-sm text-white shadow-xl">{actionMessage}</div>}
    </aside>
  );
}

function ActionButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex w-16 flex-col items-center gap-2 text-xs font-semibold text-[#e9edef]"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2a3942] transition hover:bg-[#3b4a54]">{icon}</span>{label}</button>;
}

function InfoRow({ icon, title, subtitle, onClick }: { icon: ReactNode; title: string; subtitle: string; onClick: () => void }) {
  return <button type="button" className={`${menuItemClass} items-start`} onClick={onClick}><span className="mt-1 text-[#aebac1]">{icon}</span><span className="flex-1"><span className="block">{title}</span><span className="mt-1 block text-xs font-normal text-[#8696a0]">{subtitle}</span></span><ChevronRight size={18} className="mt-1 text-[#8696a0]" /></button>;
}
