"use client";

import React, { useState, useRef, useEffect } from "react";
import { LogOut, MoreVertical, Plus, Search, Trash2, Edit2, X } from "lucide-react";
import NewContact from "./newContact";

type Contact = {
  id: string;
  name: string;
  mobile?: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: string;
  lastMessage?: string;
  unreadCount?: number;
  isGroup?: boolean;
  members?: string[];
};

type ContactBarProps = {
  filteredContacts: Contact[];
  selectedContact: Contact | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSelectContact: (contact: Contact) => void;
  onLogout: () => void;
  onCreateContact?: (contact: { name: string; mobile: string; avatar?: string }) => void;
  onDeleteContact?: (id: string) => void;
  onEditContact?: (id: string, payload: { name?: string; mobile?: string }) => void;
};

export default function ContactBar({
  filteredContacts,
  selectedContact,
  searchTerm,
  onSearchChange,
  onSelectContact,
  onLogout,
  onCreateContact,
  onDeleteContact,
  onEditContact,
}: ContactBarProps) {
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [newContactOpen, setNewContactOpen] = useState(false);
  const [newContactMode, setNewContactMode] = useState<"menu" | "create" | "edit">("menu");
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <section className="h-full rounded-2xl md:rounded-3xl border border-[rgba(148,163,184,0.12)] bg-[#1E293B]/80 backdrop-blur-xl p-4 md:p-5 shadow-2xl flex flex-col overflow-hidden">
      
      {/* Header: Branding & Action Icons */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-base md:text-lg font-bold tracking-tight text-[#F8FAFC]">
            ECHO<span className="text-[#10B981]">CHAT</span>
          </h1>
          <span className="text-[10px] font-semibold bg-[#10B981]/15 text-[#10B981] px-2 py-0.5 rounded-full border border-[#10B981]/30">
            Live
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* New Contact (+) Button */}
          <button
            onClick={() => { setEditingContact(null); setNewContactMode("menu"); setNewContactOpen(true); }}
            aria-label="New contact or group"
            title="Start New Chat"
            className="w-8 h-8 rounded-lg bg-[#10B981]/15 hover:bg-[#10B981] text-[#10B981] hover:text-[#0F172A] transition-all flex items-center justify-center font-medium shadow-sm"
            type="button"
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>

          {/* More Options Menu */}
          <div className="relative" ref={moreMenuRef}>
            <button
              onClick={() => setMoreMenuOpen((s) => !s)}
              aria-expanded={moreMenuOpen}
              aria-haspopup="true"
              title="More Options"
              className="w-8 h-8 rounded-lg hover:bg-[#334155]/60 text-[#94A3B8] hover:text-white transition flex items-center justify-center"
              type="button"
            >
              <MoreVertical size={16} strokeWidth={2} />
            </button>

            {moreMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-[rgba(148,163,184,0.15)] bg-[#0F172A]/95 backdrop-blur-xl shadow-2xl p-1 z-30 animate-fadeIn">
                <button
                  onClick={() => {
                    setMoreMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                  type="button"
                >
                  <LogOut size={15} />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Integrated Search Bar */}
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
        <input
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search contacts or chats..."
          className="w-full rounded-xl border border-[rgba(148,163,184,0.15)] bg-[#0F172A]/80 py-2.5 pl-10 pr-8 text-xs text-[#F8FAFC] placeholder-[#64748B] outline-none transition focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white"
            type="button"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Main List Area */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-[rgba(148,163,184,0.08)] bg-[#0F172A]/50 p-2 space-y-1">
        {newContactOpen ? (
          <NewContact
            onClose={() => { setNewContactOpen(false); setEditingContact(null); setNewContactMode("menu"); }}
            onCreate={(data) => {
              setNewContactOpen(false);
              setEditingContact(null);
              setNewContactMode("menu");
              if (typeof onCreateContact === "function") {
                onCreateContact(data);
              } else {
                alert(`Contact created: ${data.name} (${data.mobile})`);
              }
            }}
            onUpdate={(id, payload) => {
              setNewContactOpen(false);
              setNewContactMode("menu");
              if (typeof onEditContact === "function") {
                onEditContact(id, payload);
              } else {
                alert(`Updated ${id}: ${payload.name} ${payload.mobile}`);
              }
              setEditingContact(null);
            }}
            editContact={editingContact ? { id: editingContact.id, name: editingContact.name, mobile: editingContact.mobile } : null}
            mode={newContactMode}
            inline
            contacts={filteredContacts}
            onSelectContact={onSelectContact}
          />
        ) : filteredContacts.length === 0 ? (
          <div className="flex h-full min-h-[260px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[rgba(148,163,184,0.15)] p-6 text-center text-[#94A3B8]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#10B981]/10 text-[#10B981]">
              <Plus size={24} />
            </div>
            <p className="text-sm font-semibold text-[#F8FAFC]">
              No contacts found
            </p>
            <p className="max-w-xs text-xs text-[#94A3B8] leading-relaxed">
              Add a contact or start a new conversation to begin chatting.
            </p>
          </div>
        ) : (
          <div className="space-y-1 overflow-y-auto pr-1">
            {filteredContacts.map((contact) => {
              const isSelected = selectedContact?.id === contact.id;
              return (
                <div
                  key={contact.id}
                  onClick={() => onSelectContact(contact)}
                  role="button"
                  tabIndex={0}
                  className={`group w-full rounded-xl border p-2.5 text-left transition-all flex items-center gap-3 ${
                    isSelected
                      ? "border-[#10B981]/40 bg-[#10B981]/15 shadow-sm"
                      : "border-transparent bg-[#162032]/40 hover:bg-[#1E293B]/70 hover:border-[rgba(148,163,184,0.12)]"
                  }`}
                  onKeyDown={(e) => { if (e.key === 'Enter') onSelectContact(contact); }}
                >
                  {/* Avatar with Online Ring */}
                  <div className="relative flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-[#1E293B] to-[#334155] text-sm font-bold text-[#F8FAFC] ring-1 ring-[rgba(148,163,184,0.2)] overflow-hidden">
                      {contact.avatar ? (
                        <img
                          src={contact.avatar}
                          alt={contact.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        contact.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    {contact.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#10B981] border-2 border-[#1E293B] rounded-full"></span>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="text-xs md:text-sm font-semibold text-[#F8FAFC] truncate">
                        {contact.name}
                      </p>
                      <span className={`text-[10px] font-medium flex-shrink-0 ${contact.isOnline ? "text-[#10B981]" : "text-[#64748B]"}`}>
                        {contact.isOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs text-[#94A3B8] truncate">
                        {contact.lastMessage || contact.mobile || "Tap to chat"}
                      </p>
                      {!!contact.unreadCount && contact.unreadCount > 0 && (
                        <span className="flex h-4 min-w-[1.25rem] items-center justify-center rounded-full bg-[#10B981] px-1 text-[10px] font-bold text-[#0F172A] flex-shrink-0 shadow-sm">
                          {contact.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setEditingContact(contact);
                        setNewContactMode("edit");
                        setNewContactOpen(true);
                      }}
                      aria-label={`Edit ${contact.name}`}
                      title="Edit Contact"
                      className="p-1 rounded-md text-[#94A3B8] hover:text-[#10B981] hover:bg-[#334155]/50 transition"
                      type="button"
                    >
                      <Edit2 size={13} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (typeof onDeleteContact === "function") {
                          onDeleteContact(contact.id);
                        } else {
                          if (confirm(`Delete ${contact.name}?`)) {
                            alert(`Deleted: ${contact.name}`);
                          }
                        }
                      }}
                      aria-label={`Delete ${contact.name}`}
                      title="Delete Contact"
                      className="p-1 rounded-md text-[#94A3B8] hover:text-rose-400 hover:bg-rose-500/10 transition"
                      type="button"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </section>
  );
}
