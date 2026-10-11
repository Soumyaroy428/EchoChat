"use client";

import { Phone, Video, PhoneIncoming, PhoneOutgoing, User } from "lucide-react";
import AuthImage from "../chat/AuthImage";

type Contact = {
  id: string;
  name: string;
  mobile?: string;
  avatar?: string;
  isOnline?: boolean;
};

type CallSectionProps = {
  contacts: Contact[];
  onStartCall: (contact: Contact, isVideo: boolean) => void;
};

export default function CallSection({ contacts, onStartCall }: CallSectionProps) {
  const individualContacts = contacts.filter((c: any) => !c.isGroup);

  return (
    <div className="flex h-full w-full flex-col rounded-[1.75rem] border border-white/10 bg-[#08101b] p-4 text-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Calls</h2>
          <p className="text-xs text-gray-400">Voice & Video calls</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pt-4 pr-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-2">
          Start a call
        </h3>

        {individualContacts.length === 0 ? (
          <div className="text-center py-8 px-4 text-gray-400 text-sm">
            No contacts available to call. Add a contact first!
          </div>
        ) : (
          <div className="space-y-1">
            {individualContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/5 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-11 w-11 rounded-full overflow-hidden bg-white/10 shrink-0">
                    {contact.avatar ? (
                      <AuthImage
                        src={contact.avatar}
                        alt={contact.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-blue-600 text-white font-bold text-sm">
                        {contact.name[0]?.toUpperCase() || <User size={16} />}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {contact.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {contact.mobile || "EchoChat contact"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onStartCall(contact, false)}
                    aria-label={`Voice call ${contact.name}`}
                    className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-white/10 rounded-full transition"
                  >
                    <Phone size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onStartCall(contact, true)}
                    aria-label={`Video call ${contact.name}`}
                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-white/10 rounded-full transition"
                  >
                    <Video size={17} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

