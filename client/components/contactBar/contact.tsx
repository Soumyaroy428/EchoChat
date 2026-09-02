"use client";

import React, { useState, useRef, useEffect } from "react";
import { LogOut, MoreVertical, Plus, Search, Trash2, Edit2 } from "lucide-react";
import NewContact from "./newContact";

type Contact = {
  id: string;
  name: string;
  mobile: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
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
    <section className="rounded-[2rem] border border-white/10 bg-[#0d1725]/95 p-6 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.9)] flex flex-col">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xl uppercase tracking-[0.35em] text-gray-500">
            ECHO-CHAT
                  </p>
                  
        </div>
        
                <div className="relative">
          <button
            onClick={() => { setEditingContact(null); setNewContactMode("menu"); setNewContactOpen(true); }}
            aria-haspopup="true"
            className="inline-flex items-center gap-2 rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10"
            type="button"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="relative" ref={moreMenuRef}>
          <button
            onClick={() => setMoreMenuOpen((s) => !s)}
            aria-expanded={moreMenuOpen}
            aria-haspopup="true"
            className="inline-flex items-center gap-2 rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10"
            type="button"
          >
            <MoreVertical size={16} />
          </button>

          {moreMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-40 rounded-md border border-white/10 bg-[#07101b] shadow-md z-20">
              <button
                onClick={() => {
                  setMoreMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/5"
                type="button"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="relative mb-5">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
        <input
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search contacts"
          className="w-full rounded-[1.75rem] border border-white/10 bg-[#07101b] py-4 pl-12 pr-4 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
        />
      </div>

      <div className="flex-1 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#08101b] p-4">
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
          <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-4 rounded-[1.5rem] border border-dashed border-white/10 bg-[#07101b] p-6 text-center text-gray-400">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-white/5 text-blue-300">
              <Plus size={28} />
            </div>
            <p className="text-lg font-semibold text-white">
              No contact details
            </p>
            <p className="max-w-xs text-sm leading-6 text-gray-400">
              Add a new contact to start messaging. Otherwise this area will
              remain empty and show a placeholder welcome page.
            </p>
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto pr-1 pb-2">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => onSelectContact(contact)}
                role="button"
                tabIndex={0}
                className={`w-full rounded-[1.75rem] border p-4 text-left transition duration-200 flex items-center ${
                  selectedContact?.id === contact.id
                    ? "border-blue-500/60 bg-white/10"
                    : "border-white/10 bg-[#0a1620] hover:border-blue-500/30 hover:bg-white/5"
                }`}
                onKeyDown={(e) => { if (e.key === 'Enter') onSelectContact(contact); }}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[1.5rem] bg-blue-500/10 text-blue-200">
                    {contact.avatar ? (
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="h-12 w-12 rounded-[1.5rem] object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold">
                        {contact.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-white">{contact.name}</p>
                      <span
                        className={`text-xs ${contact.isOnline ? "text-emerald-400" : "text-gray-500"}`}
                      >
                        {contact.isOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-400 truncate">
                      {contact.mobile}
                    </p>
                  </div>
                </div>

                {/* edit + delete buttons */}
                <div className="ml-3 flex items-center gap-1">
                  <button
                    onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setEditingContact(contact);
                  setNewContactMode("edit");
                  setNewContactOpen(true);
                    }}
                    aria-label={`Edit ${contact.name}`}
                    className="inline-flex items-center justify-center rounded-md p-2 text-sm text-gray-300 hover:bg-white/5"
                    type="button"
                  >
                    <Edit2 size={16} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (typeof onDeleteContact === "function") {
                        onDeleteContact(contact.id);
                      } else {
                        // fallback: confirm and alert
                        if (confirm("Delete contact?")) {
                          alert(`Delete: ${contact.name}`);
                        }
                      }
                    }}
                    aria-label={`Delete ${contact.name}`}
                    className="inline-flex items-center justify-center rounded-md p-2 text-sm text-gray-300 hover:bg-white/5"
                    type="button"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
