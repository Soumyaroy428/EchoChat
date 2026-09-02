"use client";

import {
  AtSign,
  ArrowLeft,
  Bell,
  Camera,
  CircleHelp,
  Copy,
  Edit3,
  Eye,
  FolderOpen,
  Keyboard,
  LockKeyhole,
  LogOut,
  MessageSquareText,
  Search,
  ShieldCheck,
  ChevronRight,
  Phone,
  Trash2,
  UserRound,
  X,
  Check,
  Clock3,
  CalendarDays,
  Smile,
} from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

type UserProfile = {
  name: string;
  mobile: string;
  avatar?: string;
  about?: string;
  aboutVisibility?: "everyone" | "contacts" | "nobody";
  aboutExpiresAt?: string | null;
};

type UserProfileEditProps = {
  user: UserProfile | null;
  onLogout: () => void;
  onAvatarChange: (avatar: string) => void;
  onProfileChange: (changes: Partial<UserProfile>) => void;
};

const settings = [
  { label: "Profile", description: "Name, profile picture, username", icon: UserRound },
  { label: "Account", description: "Security notifications, account info", icon: ShieldCheck },
  { label: "Privacy", description: "Blocked contacts, disappearing messages", icon: LockKeyhole },
  { label: "Chats", description: "Theme, wallpaper, chat settings", icon: MessageSquareText },
  { label: "Notifications", description: "Messages, groups, sounds", icon: Bell },
  { label: "Keyboard shortcuts", description: "Quick actions", icon: Keyboard },
  { label: "Help and feedback", description: "Help centre, contact us, privacy policy", icon: CircleHelp },
];

export default function UserProfileEdit({ user, onLogout, onAvatarChange, onProfileChange }: UserProfileEditProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isPhotoMenuOpen, setIsPhotoMenuOpen] = useState(false);
  const [about, setAbout] = useState(user?.about || "Available");
  const [aboutVisibility, setAboutVisibility] = useState<UserProfile["aboutVisibility"]>(user?.aboutVisibility || "everyone");
  const [aboutExpiresAt, setAboutExpiresAt] = useState(user?.aboutExpiresAt || null);
  const [name, setName] = useState(user?.name?.trim() || "");
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isNameEditorOpen, setIsNameEditorOpen] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const [isSavingName, setIsSavingName] = useState(false);
  const [draftAbout, setDraftAbout] = useState(about);
  const [draftVisibility, setDraftVisibility] = useState<UserProfile["aboutVisibility"]>(aboutVisibility);
  const [draftExpiry, setDraftExpiry] = useState(aboutExpiresAt ? new Date(aboutExpiresAt).toISOString().slice(0, 16) : "");
  const [isSavingAbout, setIsSavingAbout] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoMenuRef = useRef<HTMLDivElement>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const visibleSettings = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return settings;
    return settings.filter(
      (item) =>
        item.label.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );
  }, [searchTerm]);

  const displayName = name || user?.mobile || "Your profile";
  const initial = displayName.charAt(0).toUpperCase();
  const username = `@${(user?.mobile || displayName).replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}`;

  const openNameEditor = () => {
    setDraftName(name);
    setIsNameEditorOpen(true);
  };

  const saveName = async () => {
    setIsSavingName(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/profile/name", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        body: JSON.stringify({ name: draftName }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save name");
      setName(data.user.name);
      onProfileChange({ name: data.user.name });
      setIsNameEditorOpen(false);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to save name");
    } finally {
      setIsSavingName(false);
    }
  };

  const openAboutEditor = () => {
    setDraftAbout(about);
    setDraftVisibility(aboutVisibility);
    setDraftExpiry(aboutExpiresAt ? new Date(aboutExpiresAt).toISOString().slice(0, 16) : "");
    setIsAboutOpen(true);
  };

  const saveAbout = async () => {
    setIsSavingAbout(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/profile/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        body: JSON.stringify({ about: draftAbout, visibility: draftVisibility, expiresAt: draftExpiry ? new Date(draftExpiry).toISOString() : null }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save about");
      const updated = data.user;
      setAbout(updated.about);
      setAboutVisibility(updated.aboutVisibility);
      setAboutExpiresAt(updated.aboutExpiresAt);
      onProfileChange({ about: updated.about, aboutVisibility: updated.aboutVisibility, aboutExpiresAt: updated.aboutExpiresAt });
      setIsAboutOpen(false);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to save about");
    } finally {
      setIsSavingAbout(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/) || file.size > 5 * 1024 * 1024) {
      window.alert("Choose a JPG, PNG, or WEBP image smaller than 5 MB.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const response = await fetch("http://localhost:5000/api/auth/profile/avatar", {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        body: formData,
      });
      const data: { avatar?: string; error?: string } = await response.json().catch(() => ({}));
      if (!response.ok || !data.avatar) throw new Error(data.error || "Upload failed. Please restart the server and try again.");
      onAvatarChange(data.avatar);
      setIsPhotoMenuOpen(false);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to upload photo");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhotoSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void uploadAvatar(file);
  };

  const stopCamera = () => {
    cameraStream?.getTracks().forEach((track) => track.stop());
    setCameraStream(null);
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      window.alert("Camera access is not available in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      setIsPhotoMenuOpen(false);
      setCameraStream(stream);
    } catch {
      window.alert("Camera permission was denied or the camera is unavailable.");
    }
  };

  const capturePhoto = () => {
    const video = cameraVideoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      stopCamera();
      void uploadAvatar(new File([blob], `camera-avatar-${Date.now()}.jpg`, { type: "image/jpeg" }));
    }, "image/jpeg", 0.9);
  };

  const handleRemovePhoto = async () => {
    if (!user?.avatar || !window.confirm("Remove your profile photo?")) return;

    try {
      const response = await fetch("http://localhost:5000/api/auth/profile/avatar", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to remove photo");
      onAvatarChange("");
      setIsPhotoMenuOpen(false);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to remove photo");
    }
  };

  useEffect(() => {
    if (!isPhotoMenuOpen) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (photoMenuRef.current && !photoMenuRef.current.contains(event.target as Node)) {
        setIsPhotoMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [isPhotoMenuOpen]);

  useEffect(() => {
    if (cameraStream && cameraVideoRef.current) cameraVideoRef.current.srcObject = cameraStream;
    return () => cameraStream?.getTracks().forEach((track) => track.stop());
  }, [cameraStream]);

  if (isEditingProfile) {
    return (
      <section className="flex min-h-0 flex-col rounded-[2rem] border border-white/10 bg-[#0d1725]/95 p-6 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.9)]">
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoSelected} className="hidden" />
        {cameraStream && (
          <div className="absolute inset-0 z-30 flex items-center justify-center rounded-[2rem] bg-[#07101b]/95 p-6">
            <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/15 bg-[#111827] shadow-2xl">
              <video ref={cameraVideoRef} autoPlay playsInline muted className="aspect-square w-full object-cover" />
              <div className="flex items-center justify-between gap-3 p-4">
                <button type="button" onClick={stopCamera} className="rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10">Cancel</button>
                <button type="button" onClick={capturePhoto} className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-400">Take photo</button>
              </div>
            </div>
          </div>
        )}
        <div className="mb-10 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsEditingProfile(false)}
            aria-label="Back to settings"
            className="rounded-xl p-2 text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-white">Edit profile</h1>
        </div>

        <div ref={photoMenuRef} className="relative mb-8 flex flex-col items-center">
          <button type="button" onClick={() => setIsPhotoMenuOpen((open) => !open)} aria-label="Change profile photo" aria-expanded={isPhotoMenuOpen} className="group relative h-28 w-28 overflow-hidden rounded-full border-2 border-white/15 bg-blue-500/15">
            {user?.avatar ? (
              // Profile images are external user-provided URLs, so next/image cannot optimize them without domain configuration.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt={`${displayName}'s profile`} className="h-full w-full object-cover transition group-hover:brightness-50" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-4xl font-semibold text-blue-200 transition group-hover:brightness-50">{initial}</span>
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-white opacity-0 transition group-hover:opacity-100">
              <Camera className="h-10 w-10" />
            </span>
          </button>
          <button type="button" onClick={() => setIsPhotoMenuOpen((open) => !open)} className="mt-3 rounded-md bg-white px-3 py-1 text-sm font-medium text-[#1a1a1a] transition hover:bg-gray-200">Edit</button>

          {isPhotoMenuOpen && (
            <div className="absolute top-[8.75rem] z-20 w-40 overflow-hidden rounded-2xl border border-white/15 bg-[#171a1d] py-1 shadow-2xl shadow-black/50">
              <PhotoAction icon={Eye} label="View photo" onClick={() => setIsPhotoMenuOpen(false)} />
              <PhotoAction icon={Camera} label="Take photo" onClick={() => void startCamera()} />
              <PhotoAction
                icon={FolderOpen}
                label={isUploading ? "Uploading..." : "Upload photo"}
                onClick={() => {
                  if (isUploading) return;
                  setIsPhotoMenuOpen(false);
                  requestAnimationFrame(() => fileInputRef.current?.click());
                }}
              />
              <div className="my-1 border-t border-white/10" />
              <PhotoAction icon={Trash2} label="Remove photo" onClick={handleRemovePhoto} />
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 space-y-7 overflow-y-auto pr-1">
          <ProfileField label="About" value={about} hint={aboutExpiresAt ? `Until ${new Date(aboutExpiresAt).toLocaleString()}` : "Until I change it"} onEdit={openAboutEditor} />
          {isNameEditorOpen ? (
            <InlineNameField
              name={draftName}
              isSaving={isSavingName}
              onNameChange={setDraftName}
              onSave={() => void saveName()}
            />
          ) : (
            <ProfileField label="Name" value={displayName} onEdit={openNameEditor} />
          )}
          <div>
            <p className="mb-3 text-sm font-semibold text-gray-400">Reserved Username</p>
            <button type="button" className="flex w-full items-center gap-4 rounded-xl py-2 text-left transition hover:bg-white/5">
              <AtSign className="h-5 w-5 text-gray-400" />
              <span className="flex-1 font-medium text-white">{username}</span>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-gray-400">Phone</p>
            <div className="flex items-center gap-4 py-2">
              <Phone className="h-5 w-5 text-gray-400" />
              <span className="flex-1 font-medium text-white">{user?.mobile || "Not added"}</span>
              <button type="button" aria-label="Copy phone number" onClick={() => navigator.clipboard?.writeText(user?.mobile || "")} className="rounded-lg p-2 text-white transition hover:bg-white/10">
                <Copy className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        {isAboutOpen && (
          <AboutEditor
            about={draftAbout}
            visibility={draftVisibility || "everyone"}
            expiresAt={draftExpiry}
            isSaving={isSavingAbout}
            onAboutChange={setDraftAbout}
            onVisibilityChange={setDraftVisibility}
            onExpiryChange={setDraftExpiry}
            onClose={() => setIsAboutOpen(false)}
            onSave={() => void saveAbout()}
          />
        )}
      </section>
    );
  }

  return (
    <section className="flex min-h-0 flex-col rounded-[2rem] border border-white/10 bg-[#0d1725]/95 p-6 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.9)]">
      <h1 className="mb-6 text-2xl font-semibold text-white">{displayName}</h1>

      <label className="relative mb-6 block">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search"
          aria-label="Search settings"
          className="w-full rounded-[1.75rem] border border-white/10 bg-white/10 py-3 pl-12 pr-4 text-sm text-white outline-none placeholder:text-gray-400 transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/15"
        />
      </label>

      <div className="mb-7 flex justify-center">
        <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-white/15 bg-blue-500/15 text-4xl font-semibold text-blue-200 shadow-lg shadow-black/20">
          {user?.avatar ? (
            // Profile images are external user-provided URLs, so next/image cannot optimize them without domain configuration.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar} alt={`${displayName}'s profile`} className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {visibleSettings.length ? (
          <div className="space-y-1">
            {visibleSettings.map(({ label, description, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={label === "Profile" ? () => setIsEditingProfile(true) : undefined}
                className="flex w-full items-center gap-5 rounded-2xl px-3 py-3 text-left transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                <Icon className="h-5 w-5 shrink-0 text-gray-400" />
                <span>
                  <span className="block font-medium text-white">{label}</span>
                  <span className="mt-0.5 block text-sm text-gray-400">{description}</span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="px-3 py-6 text-sm text-gray-400">No settings found.</p>
        )}
      </div>

      <div className="mt-4 border-t border-white/10 pt-3">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-5 rounded-2xl px-3 py-3 text-left text-rose-400 transition hover:bg-rose-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Log out</span>
        </button>
      </div>
    </section>
  );
}

function ProfileField({ label, value, hint, onEdit }: { label: string; value: string; hint?: string; onEdit: () => void }) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-gray-400">{label}</p>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="break-words font-medium text-white">{value}</p>
          {hint && <p className="mt-4 text-sm text-gray-400">{hint}</p>}
        </div>
        <button type="button" onClick={onEdit} aria-label={`Edit ${label}`} className="rounded-lg p-2 text-white transition hover:bg-white/10">
          <Edit3 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function PhotoAction({ icon: Icon, label, onClick }: { icon: typeof Eye; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-white transition hover:bg-white/10">
      <Icon className="h-4 w-4 text-white" />
      {label}
    </button>
  );
}

function AboutEditor({
  about,
  visibility,
  expiresAt,
  isSaving,
  onAboutChange,
  onVisibilityChange,
  onExpiryChange,
  onClose,
  onSave,
}: {
  about: string;
  visibility: "everyone" | "contacts" | "nobody";
  expiresAt: string;
  isSaving: boolean;
  onAboutChange: (value: string) => void;
  onVisibilityChange: (value: "everyone" | "contacts" | "nobody") => void;
  onExpiryChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const suggestions = ["🟢  Free to chat", "⏰  Slow to respond", "🍻  Hanging with friends", "✈️  Travelling", "🔥  Excited!"];

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center rounded-[2rem] bg-black/55 p-4 backdrop-blur-sm">
      <div className="flex max-h-full w-full max-w-[500px] flex-col overflow-hidden rounded-2xl bg-[#161717] shadow-2xl shadow-black/60">
        <header className="flex items-center gap-4 px-5 py-5">
          <button type="button" onClick={onClose} aria-label="Close about editor" className="rounded-full p-1 text-[#d9dde0] transition hover:bg-white/10"><X size={23} /></button>
          <h2 className="text-lg font-semibold text-white">About</h2>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-5">
          <div className="relative">
            <Smile className="absolute left-3 top-4 h-5 w-5 text-emerald-400" />
            <textarea value={about} maxLength={50} rows={2} onChange={(event) => onAboutChange(event.target.value)} placeholder="Share what you’re up to" className="w-full resize-none rounded-xl border border-[#54656f] bg-transparent py-3 pl-11 pr-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400" />
            <span className={`mt-1 block text-right text-xs ${about.length === 50 ? "text-rose-400" : "text-[#aebac1]"}`}>{about.length}/50</span>
          </div>

          <div className="mt-4 flex items-center gap-3 text-sm text-[#aebac1]"><LockKeyhole size={19} /><span>Visible in chats to:</span><select value={visibility} onChange={(event) => onVisibilityChange(event.target.value as "everyone" | "contacts" | "nobody")} className="bg-transparent font-semibold text-emerald-400 outline-none"><option value="everyone" className="bg-[#161717]">Everyone</option><option value="contacts" className="bg-[#161717]">My contacts</option><option value="nobody" className="bg-[#161717]">Nobody</option></select></div>

          <div className="mt-7 flex items-center gap-3 text-[#d9dde0]"><Clock3 size={21} className="text-[#aebac1]" /><span className="text-sm font-medium">Duration</span></div>
          <div className="mt-3 flex gap-2"><button type="button" onClick={() => onExpiryChange("")} className={`rounded-lg border px-4 py-2 text-sm ${!expiresAt ? "border-emerald-400 bg-emerald-400/10 text-emerald-300" : "border-[#54656f] text-white"}`}>Until I change it</button><span className={`rounded-lg border px-4 py-2 text-sm ${expiresAt ? "border-emerald-400 bg-emerald-400/10 text-emerald-300" : "border-[#54656f] text-[#aebac1]"}`}>Custom</span></div>
          <div className="mt-3 flex items-center gap-2"><CalendarDays size={19} className="text-[#aebac1]" /><input type="datetime-local" value={expiresAt} onChange={(event) => onExpiryChange(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-[#54656f] bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-emerald-400" /></div>

          <div className="mt-6 space-y-1">{suggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => onAboutChange(suggestion.slice(3))} className="block w-full rounded-lg px-3 py-3 text-left text-sm font-medium text-[#e9edef] transition hover:bg-white/5">{suggestion}</button>)}</div>
        </div>
        <footer className="flex items-center justify-between bg-[#222526] px-5 py-4"><button type="button" onClick={() => onAboutChange("")} className="rounded-lg p-2 text-[#aebac1] transition hover:bg-white/10" aria-label="Clear about"><Trash2 size={20} /></button><button type="button" disabled={isSaving} onClick={onSave} className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white transition hover:bg-emerald-400 disabled:opacity-60" aria-label="Save about"><Check size={21} /></button></footer>
      </div>
    </div>
  );
}

function InlineNameField({
  name,
  isSaving,
  onNameChange,
  onSave,
}: {
  name: string;
  isSaving: boolean;
  onNameChange: (value: string) => void;
  onSave: () => void;
}) {
  const remaining = 25 - name.length;

  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-gray-400">Name</p>
      <div className="border-b-2 border-emerald-400 pb-2">
        <div className="flex items-center gap-3">
          <input autoFocus value={name} maxLength={25} onChange={(event) => onNameChange(event.target.value)} aria-label="Name" className="min-w-0 flex-1 bg-transparent text-base font-medium text-white outline-none" />
          <span className={`text-sm ${remaining === 0 ? "text-rose-400" : "text-[#aebac1]"}`}>{remaining}</span>
          <Smile size={21} className="text-[#d9dde0]" />
          <button type="button" disabled={isSaving || !name.trim()} onClick={onSave} aria-label="Save name" className="rounded p-1 text-white transition hover:bg-white/10 disabled:opacity-40"><Check size={22} /></button>
        </div>
      </div>
    </div>
  );
}
