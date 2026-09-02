"use client";

import React, { useMemo, useState } from "react";
import { ArrowLeft, Grid } from "lucide-react";

type Contact = {
  id: string;
  name: string;
  mobile: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
};

type NewContactProps = {
  onClose?: () => void;
  onCreate?: (contact: { name: string; mobile: string; avatar?: string }) => void;
  onUpdate?: (id: string, contact: { name: string; mobile: string; avatar?: string }) => void;
  editContact?: { id: string; name?: string; firstName?: string; lastName?: string; mobile?: string; avatar?: string } | null;
  mode?: "menu" | "create" | "edit";
  inline?: boolean;
  contacts?: Contact[];
  onSelectContact?: (c: Contact) => void;
};

export default function NewContact({
  onClose = () => {},
  onCreate = () => {},
  onUpdate = () => {},
  editContact = null,
  mode: propMode,
  inline = false,
  contacts = [],
  onSelectContact = () => {},
}: NewContactProps) {
  const [mode, setMode] = useState<"menu" | "create" | "edit">(propMode === "edit" ? "edit" : propMode === "create" ? "create" : "menu");
  const [menuSearch, setMenuSearch] = useState("");

  // keep local mode in sync if parent provides a propMode explicitly
  React.useEffect(() => {
    if (propMode === "edit" || propMode === "create" || propMode === "menu") {
      setMode(propMode);
    }
  }, [propMode]);

  // form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [country, setCountry] = useState("IN +91");
  const [phone, setPhone] = useState("");
  const [syncToPhone, setSyncToPhone] = useState(false);

  // populate when editContact provided
  React.useEffect(() => {
    if (propMode === "edit" && editContact) {
      const ec = editContact;
      // if editContact includes firstName/lastName (from server mapping) use them, otherwise try name
      if (ec.firstName || ec.lastName) {
        setFirstName(ec.firstName || "");
        setLastName(ec.lastName || "");
      } else if (ec.name) {
        const parts = (ec.name || "").split(/\s+/);
        setFirstName(parts[0] || "");
        setLastName(parts.slice(1).join(" ") || "");
      }
      setUsername(ec.name || "");
      setPhone(ec.mobile ? ec.mobile.replace(/[^0-9]/g, "") : "");
      setMode("edit");
    }
  }, [propMode, editContact]);

  const handleSave = () => {
    const name = `${firstName.trim()} ${lastName.trim()}`.trim() || username || phone;
    const mobile = `${country.split(" ")[2] ? country.split(" ")[2] : "+91"}${phone.trim()}`.replace(/\s+/g, "");
    if (!name) {
      alert("Please enter a name or username");
      return;
    }
    if (!phone.trim()) {
      alert("Please enter a phone number");
      return;
    }

    if (mode === "edit" && editContact && typeof onUpdate === "function") {
      onUpdate(editContact.id, { name, mobile, avatar: editContact.avatar });
    } else {
      onCreate?.({ name, mobile, avatar: undefined });
    }

    // reset and go back to menu
    setFirstName("");
    setLastName("");
    setUsername("");
    setPhone("");
    setSyncToPhone(false);
    setMode("menu");
    onClose?.();
  };

  const filtered = useMemo(() => {
    const q = menuSearch.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(
      (c) => c.name.toLowerCase().includes(q) || c.mobile.toLowerCase().includes(q)
    );
  }, [contacts, menuSearch]);

  // New Chat view (like second picture) and New Contact form (third picture)
  if (inline) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => onClose?.()}
            className="p-2 rounded-full hover:bg-white/5"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-lg font-semibold">New chat</h2>
          <div className="ml-auto">
            <Grid size={18} />
          </div>
        </div>

        <div className="mb-3">
          <input
            placeholder="Search name, number or @username"
            className="w-full rounded-full border border-white/10 bg-transparent py-3 px-4 text-sm text-white outline-none"
            value={menuSearch}
            onChange={(e) => setMenuSearch(e.target.value)}
          />
        </div>

        <div className="space-y-3 overflow-y-auto flex-1">
          <div className="space-y-2 px-1">
            <button
              className="w-full flex items-center gap-3 rounded px-2 py-3 text-sm text-white hover:bg-white/5"
              type="button"
              onClick={() => alert("New group - not implemented")}
            >
              <span className="inline-block h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">👥</span>
              New group
            </button>

            <button
              className="w-full flex items-center gap-3 rounded px-2 py-3 text-sm text-white hover:bg-white/5"
              type="button"
              onClick={() => setMode("create")}
            >
              <span className="inline-block h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">➕</span>
              New contact
            </button>

            <button
              className="w-full flex items-center gap-3 rounded px-2 py-3 text-sm text-white hover:bg-white/5"
              type="button"
              onClick={() => alert("New community - not implemented")}
            >
              <span className="inline-block h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">👥</span>
              New community
            </button>
          </div>

          <div className="border-t border-white/5 my-2" />

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <p className="mb-3">No contacts found</p>
            </div>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectContact?.(c)}
                className="w-full flex items-center gap-3 px-2 py-3 hover:bg-white/5 rounded"
              >
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-200">
                  {c.avatar ? (
                    <img src={c.avatar} alt={c.name} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <span className="font-semibold">{c.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{c.name}</p>
                      <p className="text-sm text-gray-400">{c.mobile}</p>
                    </div>
                    <div className="text-xs text-gray-500">{c.lastSeen ?? ""}</div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* New contact form (rendered as a panel replacing list) */}
        {(mode === "create" || mode === "edit") && (
          <div className="fixed inset-y-4 left-30 w-[430px] bg-[#0c223d] border-l border-white/10 p-6 rounded-3xl">
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => { setMode("menu"); onClose?.(); }} className="p-2 rounded-full hover:bg-white/5">
                <ArrowLeft size={18} />
              </button>
              <h3 className="text-lg font-semibold">{mode === "edit" ? "Edit contact" : "New contact"}</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">First name</label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-transparent border-b border-white/10 py-2 px-1 text-white outline-none" placeholder="First name" />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Last name</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-transparent border-b border-white/10 py-2 px-1 text-white outline-none" placeholder="Last name" />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Username</label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-transparent border-b border-green-500/60 py-2 px-1 text-white outline-none" placeholder="Username" />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-28">
                  <label className="text-sm text-gray-400 mb-1 block">Country</label>
                  <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full bg-transparent border-b border-white/10 py-2 px-1 text-white outline-none">
                    <option>IN +91</option>
                    <option>US +1</option>
                    <option>GB +44</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-sm text-gray-400 mb-1 block">Phone</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-transparent border-b border-white/10 py-2 px-1 text-white outline-none" placeholder="Phone" />
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div>
                  <p className="text-sm font-medium">Sync contact to phone</p>
                  <p className="text-xs text-gray-400">This contact will be added to your phone's address book.</p>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={syncToPhone} onChange={(e) => setSyncToPhone(e.target.checked)} className="sr-only" />
                  <span className={`w-10 h-6 inline-block rounded-full transition-colors ${syncToPhone ? 'bg-green-500' : 'bg-gray-600'}`} />
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setMode("menu")} className="rounded px-4 py-2 text-sm text-gray-300 hover:bg-white/5">Cancel</button>
                <button onClick={handleSave} className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Modal fallback
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-[420px] max-w-[95%] rounded-lg border border-white/10 bg-[#07101b] p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{mode === "edit" || propMode === "edit" ? "Edit contact" : "New contact"}</h3>
          <button onClick={onClose} className="text-sm text-gray-400">Cancel</button>
        </div>

        <div className="space-y-3">
          <label className="block text-sm text-gray-300">Name</label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Full name"
            className="w-full rounded border border-white/10 bg-transparent py-2 px-3 text-sm text-white outline-none"
          />

          <label className="block text-sm text-gray-300">Mobile</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Mobile number"
            className="w-full rounded border border-white/10 bg-transparent py-2 px-3 text-sm text-white outline-none"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            type="button"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
