"use client";

import { useEffect, useMemo, useState } from "react";
import { socket } from "../../lib/socket";
import { subscribeToPushNotifications } from "../../lib/push";
import Side from "../sidebar/side";
import UserProfileEdit from "../sidebar/userProfileEdit";
import ContactBar from "../contactBar/contact";
import ChatBar from "../chat/message";
import ContactInfoPanel from "../chat/ContactInfoPanel";

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
  description?: string;
  admins?: string[];
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
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js").catch(console.error);
      }
      subscribeToPushNotifications();
      try {
        const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/profile`, {
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
          
          const [contactsRes, groupsRes] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/contacts`, {
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
            }),
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/groups`, {
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
            })
          ]);

          let mappedContacts: Contact[] = [];
          if (contactsRes.ok) {
            const contactsData = await contactsRes.json();
            mappedContacts = (contactsData.contacts || []).map((c: any) => ({
              id: c.id || c._id,
              name: `${c.firstName || ""}${c.lastName ? " " + c.lastName : ""}`.trim() || c.username || c.mobile,
              mobile: c.mobile,
              avatar: c.avatar,
              isOnline: c.isOnline || false,
              lastSeen: c.lastSeen,
            }));
          }

          let mappedGroups: Contact[] = [];
          if (groupsRes.ok) {
            const groupsData = await groupsRes.json();
            mappedGroups = (groupsData.groups || []).map((g: any) => ({
              id: g._id,
              name: g.name,
              isGroup: true,
              members: g.members,
              admins: g.admins,
              description: g.description,
              avatar: g.avatar,
            }));
          }

          setContacts([...mappedGroups, ...mappedContacts]);
        } catch (fetchErr) {
          console.error("Failed to fetch contacts or groups", fetchErr);
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

  // Socket Connection and Global Message Handler
  useEffect(() => {
    if (!token) return;
    
    socket.auth = { token };
    if (!socket.connected) {
      socket.connect();
    }

    const handleMessage = (message: any) => {
      setContacts((prevContacts) => {
        const targetId = message.groupId ? message.groupId : (message.senderId === user?.id ? message.receiverId : message.senderId);
        const existingContactIndex = prevContacts.findIndex(c => c.id === targetId);
        
        if (existingContactIndex === -1) {
          // If the sender/group is not in our contacts, add them dynamically
          const isSelected = targetId === selectedContact?.id;
          const newContact = {
            id: targetId,
            name: message.groupId ? "Unknown Group" : "Unknown Contact",
            mobile: "Unknown",
            isOnline: false,
            isGroup: !!message.groupId,
            lastMessage: message.content,
            unreadCount: isSelected ? 0 : 1,
          };

          if (!isSelected && message.senderId !== user?.id) {
            if (Notification.permission === "granted") {
              new Notification(`New message`, {
                body: message.content,
              });
            }
          }
          return [newContact, ...prevContacts];
        }

        const updatedContacts = [...prevContacts];
        const contact = updatedContacts[existingContactIndex];
        
        // Remove contact from current position
        updatedContacts.splice(existingContactIndex, 1);
        
        // Add to the top with updated info
        const isSelected = contact.id === selectedContact?.id;
        updatedContacts.unshift({
          ...contact,
          lastMessage: message.content,
          unreadCount: isSelected ? 0 : (contact.unreadCount || 0) + 1,
        });

        if (!isSelected && message.senderId !== user?.id) {
          if (Notification.permission === "granted") {
            new Notification(message.groupId ? `New message in ${contact.name}` : `New message from ${contact.name}`, {
              body: message.content,
              icon: contact.avatar,
            });
          }
        }

        return updatedContacts;
      });
    };

    const handleUserStatus = (data: { userId: string, isOnline: boolean, lastSeen: string }) => {
      setContacts((prevContacts) => prevContacts.map(c => 
        c.id === data.userId ? { ...c, isOnline: data.isOnline, lastSeen: data.lastSeen } : c
      ));
      if (selectedContact?.id === data.userId) {
        setSelectedContact(prev => prev ? { ...prev, isOnline: data.isOnline, lastSeen: data.lastSeen } : prev);
      }
    };

    socket.on("message_received", handleMessage);
    socket.on("user_status", handleUserStatus);

    return () => {
      socket.off("message_received", handleMessage);
      socket.off("user_status", handleUserStatus);
      // We do not call socket.disconnect() here so it remains connected across re-renders!
    };
  }, [token, selectedContact?.id, user?.id]);

  const filteredContacts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return contacts;
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(query) ||
        contact.mobile?.toLowerCase().includes(query)
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
    
    // Reset unread count for this contact
    setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, unreadCount: 0 } : c));
  };

  const handleCreateContact = async (c: { name: string; mobile: string }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/contacts`, {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/contacts/${id}`, {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/contacts/${id}`, {
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
    <div className="h-screen w-screen bg-[#05060b] text-white overflow-hidden p-2 md:p-4">
      <div className="flex flex-col md:flex-row h-full w-full gap-2 md:gap-4 relative overflow-hidden">
        
        {/* Side Navigation - Bottom bar on mobile, left bar on desktop */}
        <div className={`md:w-[80px] xl:w-[96px] flex-shrink-0 order-last md:order-first mt-auto md:mt-0 h-16 md:h-full ${selectedContact ? 'hidden md:block' : 'block'}`}>
          <Side
            hasActiveChat={!!selectedContact}
            isProfileOpen={isProfileOpen}
            onProfileClick={() => setIsProfileOpen((isOpen) => !isOpen)}
            onMessagesClick={() => setIsProfileOpen(false)}
            avatar={user?.avatar}
            userName={user?.name}
          />
        </div>

        {/* Left Panel (ContactBar / Profile) - Hidden on mobile if a chat is selected */}
        <div className={`w-full md:w-[280px] lg:w-[320px] xl:w-[420px] flex-shrink-0 flex flex-col h-[calc(100%-4.5rem)] md:h-full ${selectedContact ? 'hidden md:flex' : 'flex'}`}>
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
        </div>

        {/* Right Panel (ChatBar) - Hidden on mobile if NO chat is selected */}
        <div className={`flex-1 w-full h-full flex-col ${!selectedContact ? 'hidden md:flex' : 'flex'}`}>
          <ChatBar
            selectedContact={selectedContact}
            currentUser={user}
            onOpenContactInfo={() => setIsContactInfoOpen(true)}
            onBack={() => {
              setSelectedContact(null);
              setIsContactInfoOpen(false);
            }}
          />
        </div>

      </div>
    </div>
  );
}
