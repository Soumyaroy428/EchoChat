"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { socket } from "../../lib/socket";
import {
  MessageCircle,
  MoreVertical,
  Search,
  Paperclip,
  Smile,
  Send,
  UserPlus,
  Info,
  SquareCheck,
  BellOff,
  Timer,
  Heart,
  ListPlus,
  CircleX,
  Link,
  UsersRound,
  Flag,
  Ban,
  CircleMinus,
  Trash2,
  Video,
  Phone,
  Reply,
  Copy,
  Forward,
  Pin,
  Sparkles,
  Star,
  Pencil,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

type Contact = {
  id: string;
  name: string;
  mobile: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
};

type CurrentUser = {
  id: string;
  name: string;
  mobile: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: string;
};

type ChatBarProps = {
  selectedContact: Contact | null;
  currentUser: CurrentUser | null;
  onOpenContactInfo: () => void;
};

type Message = {
  id: string;
  sender: "me" | "them";
  content: string;
  time: string;
  isMedia?: boolean;
};

export default function ChatBar({
  selectedContact,
  currentUser,
  onOpenContactInfo,
}: ChatBarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef(socket);

  // Reset messages when contact changes
  useEffect(() => {
    setMessages([]);
    setNewMessage("");
    setMoreMenuOpen(false);
  }, [selectedContact]);

  // Connect once for the authenticated user and receive private messages.
  useEffect(() => {
    if (!currentUser) return;

    const chatSocket = socketRef.current;
    const token = localStorage.getItem("token");
    if (!token) return;

    chatSocket.auth = { token };
    const handleMessage = (message: {
      id?: string;
      senderId: string;
      receiverId: string;
      content: string;
      timestamp: string;
    }) => {
      if (
        !selectedContact ||
        ![message.senderId, message.receiverId].includes(selectedContact.id)
      ) {
        return;
      }

      setMessages((previous) => {
        if (previous.some((item) => item.id === message.id)) return previous;
        return [
          ...previous,
          {
            id: message.id || crypto.randomUUID(),
            sender: message.senderId === currentUser.id ? "me" : "them",
            content: message.content,
            time: formatTime(message.timestamp),
          },
        ];
      });
    };

    chatSocket.on("message_received", handleMessage);
    if (chatSocket.connected) chatSocket.disconnect();
    chatSocket.connect();

    return () => {
      chatSocket.off("message_received", handleMessage);
      chatSocket.disconnect();
    };
  }, [currentUser?.id, selectedContact?.id]);

  // Load messages
  useEffect(() => {
    if (!selectedContact || !currentUser) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(
          `http://localhost:5000/api/messages/${selectedContact.id}`,
          {
            headers: {
              ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : {}),
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch message history");
        }

        const data = await response.json();

        const formattedMessages = (data.messages || []).map((message: any) => ({
          id: message.id,
          sender: message.senderId === currentUser.id ? "me" : "them",
          content: message.content,
          time: formatTime(new Date(message.timestamp || Date.now())),
        }));

        setMessages((previous) => {
          const historyIds = new Set(formattedMessages.map((message: Message) => message.id));
          return [
            ...formattedMessages,
            ...previous.filter((message) => !historyIds.has(message.id)),
          ];
        });
      } catch (error) {
        console.error("Failed to load message history", error);

        setMessages([]);
      }
    };

    loadMessages();
  }, [selectedContact?.id, currentUser?.id]);

  // Format message time
  const formatTime = (date: Date | string) =>
    new Date(date)
      .toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })
      .toLowerCase();

  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      console.error("Failed to copy message", error);
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages((previousMessages) =>
      previousMessages.filter((message) => message.id !== messageId),
    );
  };

  // Send message
  const handleSend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = newMessage.trim();

    if (!trimmed || !selectedContact || !currentUser) {
      return;
    }

    setNewMessage("");

    const chatSocket = socketRef.current;
    if (!chatSocket.connected) {
      console.error("Failed to send message: socket is not connected");
      return;
    }

    chatSocket.emit(
      "send_message",
      { receiverId: selectedContact.id, content: trimmed },
      (response: { error?: string }) => {
        if (response.error) {
          console.error("Failed to send message:", response.error);
        }
      },
    );
    /*
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/messages", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },

        body: JSON.stringify({
          receiverId: selectedContact.id,
          content: trimmed,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      setMessages((prev) =>
        prev.map((message) =>
          message.id === optimisticMessage.id
            ? {
                ...message,
                id: data.message?.id || message.id,
                time: formatTime(data.message?.timestamp || new Date()),
              }
            : message,
        ),
      );
    } catch (error) {
      console.error("Failed to send message", error);

      // Remove optimistic message
      setMessages((prev) =>
        prev.filter((message) => message.id !== optimisticMessage.id),
      );
    }
    */
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleDocClick(e: MouseEvent) {
      if (!wrapperRef.current) return;

      const target = e.target as Node | null;

      if (target && !wrapperRef.current.contains(target)) {
        setMoreMenuOpen(false);
      }
    }

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMoreMenuOpen(false);
      }
    }

    document.addEventListener("click", handleDocClick);

    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("click", handleDocClick);

      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <section className="relative flex h-full min-h-[calc(100vh-4rem)] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a111a]/95 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.9)]">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.06),_transparent_20%),radial-gradient(circle_at_bottom_right,_rgba(16,163,127,0.12),_transparent_18%)] opacity-80" />

      {/* Header */}
      <div className="relative z-20 flex items-center justify-between gap-4 border-b border-white/10 px-6 py-4">
        {/* Contact information */}
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-lg font-semibold uppercase text-white shadow-sm shadow-black/20">
            {selectedContact ? (
              selectedContact.avatar ? (
                <img
                  src={selectedContact.avatar}
                  alt={selectedContact.name}
                  className="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                selectedContact.name.charAt(0).toUpperCase()
              )
            ) : (
              <MessageCircle size={24} />
            )}
          </div>

          {/* Name and status */}
          <div>
            <h2 className="text-xl font-semibold text-white">
              {selectedContact ? selectedContact.name : "Welcome to EchoChat"}
            </h2>

            {selectedContact && (
              <p className="text-xs text-gray-400">
                {selectedContact.isOnline
                  ? "Active now"
                  : selectedContact.lastSeen ||
                    "Last seen on " + new Date().toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Header buttons */}
        <div className="flex items-center gap-3 text-gray-400">
          {/* Phone call */}
          <button
            type="button"
            className="rounded-full bg-white/5 p-2 transition hover:bg-white/10"
            aria-label="Phone call"
          >
            <Phone size={20} />
          </button>

          {/* Video call */}
          <button
            type="button"
            className="rounded-full bg-white/5 p-2 transition hover:bg-white/10"
            aria-label="Video call"
          >
            <Video size={20} />
          </button>

          {/* Search */}
          <button
            type="button"
            className="rounded-full bg-white/5 p-2 transition hover:bg-white/10"
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          {/* More menu */}
          <div className="relative" ref={wrapperRef}>
            <button
              type="button"
              className="rounded-full bg-white/5 p-2 transition hover:bg-white/10"
              aria-label="Menu"
              onClick={(e) => {
                e.stopPropagation();
                setMoreMenuOpen((prev) => !prev);
              }}
            >
              <MoreVertical size={18} />
            </button>

            {/* Dropdown menu */}
            {moreMenuOpen && (
              <div
                className="p-1.5 text-[#f0f2f5] shadow-2xl shadow-black/50
          absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-md border border-white/20 bg-[#1b1d1d] py-1 shadow-2xl shadow-black/60 transition duration-300 ease-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
                role="menu"
                aria-orientation="vertical"
              >
                
                {/* Contact info */}
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-white transition hover:bg-white/5 pointer"
                  onClick={() => {
                    setMoreMenuOpen(false);
                    if (selectedContact) onOpenContactInfo();
                  }}
                >
                  <Info size={16} />
                  <span>Contact info</span>
                </button>

                {/* Search */}
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-white transition hover:bg-white/5"
                  onClick={() => setMoreMenuOpen(false)}
                >
                  <Search size={16} />
                  <span>Search</span>
                </button>

                {/* Select messages */}
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-white transition hover:bg-white/5"
                  onClick={() => setMoreMenuOpen(false)}
                >
                  <SquareCheck size={16} />
                  <span>Select messages</span>
                </button>

                {/* Mute notifications */}
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-2.5 text-sm text-white transition hover:bg-white/5"
                  onClick={() => setMoreMenuOpen(false)}
                >
                  <span className="flex items-center gap-3">
                    <BellOff size={16} />
                    <span>Mute notifications</span>
                  </span>

                  <span className="text-gray-500">›</span>
                </button>

                {/* Disappearing messages */}
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-white transition hover:bg-white/5"
                  onClick={() => setMoreMenuOpen(false)}
                >
                  <Timer size={16} />
                  <span>Disappearing messages</span>
                </button>

                {/* Add to favourites */}
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-white transition hover:bg-white/5"
                  onClick={() => setMoreMenuOpen(false)}
                >
                  <Heart size={16} />
                  <span>Add to favourites</span>
                </button>

                {/* Add to list */}
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-2.5 text-sm text-white transition hover:bg-white/5"
                  onClick={() => setMoreMenuOpen(false)}
                >
                  <span className="flex items-center gap-3">
                    <ListPlus size={16} />
                    <span>Add to list</span>
                  </span>

                  <span className="text-gray-500">›</span>
                </button>

                {/* Close chat */}
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-white transition hover:bg-white/5"
                  onClick={() => setMoreMenuOpen(false)}
                >
                  <CircleX size={16} />
                  <span>Close chat</span>
                </button>

                <div className="my-1 border-t border-white/10" />

                {/* Send call link */}
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-white transition hover:bg-white/5"
                  onClick={() => setMoreMenuOpen(false)}
                >
                  <Link size={16} />
                  <span>Send call link</span>
                </button>

                {/* New group call */}
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-white transition hover:bg-white/5"
                  onClick={() => setMoreMenuOpen(false)}
                >
                  <UsersRound size={16} />
                  <span>New group call</span>
                </button>

                <div className="my-1 border-t border-white/10" />

                {/* Report */}
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-white transition hover:bg-white/5"
                  onClick={() => setMoreMenuOpen(false)}
                >
                  <Flag size={16} />
                  <span>Report</span>
                </button>

                {/* Block */}
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-white transition hover:bg-white/5"
                  onClick={() => setMoreMenuOpen(false)}
                >
                  <Ban size={16} />
                  <span>Block</span>
                </button>

                {/* Clear chat */}
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-white transition hover:bg-white/5"
                  onClick={() => setMoreMenuOpen(false)}
                >
                  <CircleMinus size={16} />
                  <span>Clear chat</span>
                </button>

                {/* Delete chat */}
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-white transition hover:bg-white/5"
                  onClick={() => setMoreMenuOpen(false)}
                >
                  <Trash2 size={16} />
                  <span>Delete chat</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="relative z-10 flex h-full flex-col">
        {selectedContact ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-hidden px-6 py-6">
              <div className="flex h-full flex-col gap-4 overflow-y-auto pr-2 pb-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex w-full ${
                      message.sender === "me" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`group relative max-w-[80%] rounded-[1.5rem] border border-white/10 px-4 py-3 text-sm leading-6 shadow-[0_10px_30px_-25px_rgba(0,0,0,0.9)] ${
                        message.sender === "me"
                          ? "rounded-br-[0.4rem] bg-[#17a1239f] text-white"
                          : "rounded-bl-[0.4rem] bg-[#191a1c] text-gray-200"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <p className="min-w-0 flex-1 break-words">
                          {message.content}
                        </p>

                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="mt-0.5 shrink-0 rounded p-0.5 text-white/65 opacity-0 outline-none transition hover:bg-black/15 hover:text-white group-hover:opacity-100 data-popup-open:opacity-100"
                            aria-label="Message actions"
                          >
                            <ChevronDown size={24} />
                          </DropdownMenuTrigger>

                          <DropdownMenuContent
                            align={message.sender === "me" ? "end" : "start"}
                            side="bottom"
                            sideOffset={6}
                            className="w-36 rounded-xl border border-white/10 bg-[#1b1d1d] p-1.5 text-[#f0f2f5] shadow-2xl shadow-black/50"
                          >
                            <DropdownMenuItem className="gap-3 rounded-lg px-2.5 py-2 text-sm focus:bg-white/10">
                              <Info size={16} />
                              Message info
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-3 rounded-lg px-2.5 py-2 text-sm focus:bg-white/10">
                              <Reply size={16} />
                              Reply
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-3 rounded-lg px-2.5 py-2 text-sm focus:bg-white/10"
                              onClick={() => handleCopyMessage(message.content)}
                            >
                              <Copy size={16} />
                              Copy
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-3 rounded-lg px-2.5 py-2 text-sm focus:bg-white/10">
                              <Smile size={16} />
                              React
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-3 rounded-lg px-2.5 py-2 text-sm focus:bg-white/10">
                              <Forward size={16} />
                              Forward
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-3 rounded-lg px-2.5 py-2 text-sm focus:bg-white/10">
                              <Pin size={16} />
                              Pin
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-3 rounded-lg px-2.5 py-2 text-sm focus:bg-white/10">
                              <Sparkles size={16} />
                              Ask Meta AI
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-3 rounded-lg px-2.5 py-2 text-sm focus:bg-white/10">
                              <Star size={16} />
                              Star
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-3 rounded-lg px-2.5 py-2 text-sm focus:bg-white/10">
                              <Pencil size={16} />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1 border-white/10 bg-white/10" />
                            <DropdownMenuItem
                              variant="destructive"
                              className="gap-3 rounded-lg px-2.5 py-2 text-sm text-[#f15c5c] focus:bg-red-500/10"
                              onClick={() => handleDeleteMessage(message.id)}
                            >
                              <Trash2 size={16} />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mt-2 flex items-center justify-end gap-2 text-[11px] text-gray-200/80">
                        <span>{message.time}</span>

                        {message.sender === "me" && <span>✓</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Message input */}
            <div className="border-t border-white/10 px-5 py-4">
              <form
                onSubmit={handleSend}
                className="flex items-center gap-3 rounded-full bg-[#15202f] px-4 py-3 text-gray-200 shadow-[0_10px_40px_-30px_rgba(0,0,0,0.8)]"
              >
                {/* Attach */}
                <button
                  type="button"
                  className="rounded-full p-2 text-gray-400 transition hover:bg-white/5 hover:text-white"
                  aria-label="Attach"
                >
                  <Paperclip size={18} />
                </button>

                {/* Emoji */}
                <button
                  type="button"
                  className="rounded-full p-2 text-gray-400 transition hover:bg-white/5 hover:text-white"
                  aria-label="Emoji"
                >
                  <Smile size={18} />
                </button>

                {/* Input */}
                <input
                  value={newMessage}
                  onChange={(event) => setNewMessage(event.target.value)}
                  type="text"
                  placeholder="Type a message"
                  className="flex-1 bg-transparent outline-none placeholder:text-gray-500"
                />

                {/* Send */}
                <button
                  type="submit"
                  className="rounded-full bg-[#0d6b50] p-3 text-white transition hover:bg-[#109e72]"
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        ) : (
          /* No contact selected */
          <div className="flex flex-1 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-[#08101b] p-10 text-center text-gray-400">
            <p className="mb-3 text-xl font-semibold text-white">
              Select a contact to open chat
            </p>

            <p className="mx-auto max-w-2xl text-sm leading-7 text-gray-400">
              Choose a contact from the list on the left to view your
              WhatsApp-style conversation. You’ll see your recent chat history
              and be able to send messages when a conversation is selected.
            </p>

            <div className="mx-auto mt-8 inline-flex items-center gap-2 rounded-full bg-white/5 px-5 py-3 text-sm text-gray-300">
              <MessageCircle size={18} />
              <span>Start by selecting a person to message.</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
