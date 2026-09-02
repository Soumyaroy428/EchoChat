"use client";

import { useEffect, useMemo, useState } from "react";
import Side from "../sidebar/side";
import UserProfileEdit from "../sidebar/userProfileEdit";
import ContactBar from "../contactBar/contact";
import ChatBar from "../chat/message";
import ContactInfoPanel from "../chat/ContactInfoPanel";

type Contact = {
  id: string;
  name: string;
  mobile: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
};

type UserProfile = {
  id: string;
  name: string;
  mobile: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
  about?: string;
  aboutVisibility?: "everyone" | "contacts" | "nobody";
  aboutExpiresAt?: string | null;
};

type ContactResponse = {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  mobile: string;
  avatar?: string;
};

export default function MainPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isContactInfoOpen, setIsContactInfoOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      window.location.reload();
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const profileRes = await fetch("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!profileRes.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.reload();
          return;
        }

        const profileData = await profileRes.json();
        setUser(profileData.user);
        // fetch contacts from server (persisted contacts)
        try {
          const token = localStorage.getItem("token");
          const contactsRes = await fetch("http://localhost:5000/api/contacts", {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          if (contactsRes.ok) {
            const contactsData: { contacts?: ContactResponse[] } = await contactsRes.json();
            const mapped = (contactsData.contacts || []).map((c) => ({
              id: c.id,
              name: `${c.firstName || ""}${c.lastName ? " " + c.lastName : ""}`.trim() || c.username || c.mobile,
              mobile: c.mobile,
              avatar: c.avatar,
              isOnline: false,
            }));
            setContacts(mapped);
          } else {
            setContacts([]);
          }
        } catch (fetchErr) {
          console.error("Failed to fetch contacts", fetchErr);
          setContacts([]);
        }
      } catch (error) {
        console.error("Failed to load profile", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.reload();
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const filteredContacts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return contacts;
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(query) ||
        contact.mobile.toLowerCase().includes(query)
    );
  }, [contacts, searchTerm]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
  };

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsContactInfoOpen(false);
  };

  const handleCreateContact = async (c: { name: string; mobile: string }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name: c.name, mobile: c.mobile }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        console.error("Failed to create contact", err);
        // fallback: add locally
        setContacts((prev) => [
          ...prev,
          { id: crypto.randomUUID(), name: c.name, mobile: c.mobile, isOnline: false },
        ]);
        return;
      }

      const data = await res.json();
      const created = data.contact;

      setContacts((prev) => [
        ...prev,
        {
          id: created.id || crypto.randomUUID(),
          name: `${created.firstName || ""}${created.lastName ? " " + created.lastName : ""}`.trim() || created.username || c.name,
          mobile: created.mobile || c.mobile,
          isOnline: false,
        },
      ]);
    } catch (error) {
      console.error("Create contact error:", error);
      setContacts((prev) => [
        ...prev,
        { id: crypto.randomUUID(), name: c.name, mobile: c.mobile, isOnline: false },
      ]);
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/contacts/${id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        console.warn("Failed to delete contact on server", err);
        // still remove from local state to keep UI responsive
        setContacts((prev) => prev.filter((ct) => ct.id !== id));
        if (selectedContact?.id === id) setSelectedContact(null);
        return;
      }

      setContacts((prev) => prev.filter((ct) => ct.id !== id));
      if (selectedContact?.id === id) setSelectedContact(null);
    } catch (error) {
      console.error("Delete contact error:", error);
      setContacts((prev) => prev.filter((ct) => ct.id !== id));
      if (selectedContact?.id === id) setSelectedContact(null);
    }
  };

  const handleEditContact = async (id: string, payload: { name?: string; mobile?: string }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/contacts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

    if (!res.ok) {
        const updated = await res.json().catch(() => ({ error: res.statusText }));
        console.warn("Failed to update contact on server", updated);
        return;
      }

     const data = await res.json();
      const updated = data.contact;
      setContacts((prev) =>
        prev.map((ct) =>
          ct.id === id
            ? {
                ...ct,
                name: `${updated.firstName || ""}${updated.lastName ? " " + updated.lastName : ""}`.trim() || updated.username || ct.name,
                mobile: updated.mobile || ct.mobile,
              }
            : ct
        )
      );
      if (selectedContact?.id === id) {
        setSelectedContact((prev) =>
          prev ? { ...prev, name: `${updated.firstName || ""}${updated.lastName ? " " + updated.lastName : ""}`.trim() || updated.username || prev.name, mobile: updated.mobile || prev.mobile } : prev
        );
      }
    } catch (error) {
      console.error("Edit contact error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0f] flex items-center justify-center">
        <div className="text-white text-xl">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#05060b] text-white overflow-hidden p-4">
      <div className="grid h-full gap-4 xl:grid-cols-[96px_minmax(360px,420px)_1fr]">
        <Side
          hasActiveChat={!!selectedContact}
          isProfileOpen={isProfileOpen}
          onProfileClick={() => setIsProfileOpen((isOpen) => !isOpen)}
          onMessagesClick={() => setIsProfileOpen(false)}
          avatar={user?.avatar}
          userName={user?.name}
        />

        {isProfileOpen ? (
          <UserProfileEdit
            user={user}
            onLogout={handleLogout}
            onAvatarChange={(avatar) => setUser((currentUser) => currentUser ? { ...currentUser, avatar } : currentUser)}
            onProfileChange={(changes) => setUser((currentUser) => currentUser ? { ...currentUser, ...changes } : currentUser)}
          />
        ) : isContactInfoOpen ? (
          <ContactInfoPanel contact={selectedContact} onClose={() => setIsContactInfoOpen(false)} />
        ) : (
          <ContactBar
          filteredContacts={filteredContacts}
          selectedContact={selectedContact}
          searchTerm={searchTerm}
          onSearchChange={(value) => setSearchTerm(value)}
          onSelectContact={handleSelectContact}
          onLogout={handleLogout}
          onCreateContact={handleCreateContact}
          onDeleteContact={handleDeleteContact}
        onEditContact={handleEditContact}
          />
        )}

        <ChatBar
          selectedContact={selectedContact}
          currentUser={user}
          onOpenContactInfo={() => setIsContactInfoOpen(true)}
        />
      </div>
    </div>
  );
}
