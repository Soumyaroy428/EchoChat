"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Eye, Trash2, Send, Pause, Play } from "lucide-react";
import AuthImage from "../chat/AuthImage";
import { socket } from "../../lib/socket";

export type StatusItem = {
  _id: string;
  user: {
    _id: string;
    name?: string;
    mobile?: string;
    avatar?: any;
  };
  mediaUrl?: string;
  mediaType: "text" | "image" | "video";
  text?: string;
  backgroundColor?: string;
  font?: string;
  viewers?: Array<{
    user: {
      _id: string;
      name?: string;
      mobile?: string;
      avatar?: any;
    };
    viewedAt: string;
  }>;
  createdAt: string;
  expiresAt: string;
};

type StatusViewerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  stories: StatusItem[];
  initialIndex?: number;
  isOwner?: boolean;
  onDeleteStatus?: (statusId: string) => Promise<boolean>;
  currentUserId?: string;
};

const STORY_DURATION_MS = 5000;

export default function StatusViewerModal({
  isOpen,
  onClose,
  stories,
  initialIndex = 0,
  isOwner = false,
  onDeleteStatus,
  currentUserId,
}: StatusViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const elapsedBeforePauseRef = useRef<number>(0);

  const currentStory = stories[currentIndex];

  const handleNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
      elapsedBeforePauseRef.current = 0;
      setShowViewers(false);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
      elapsedBeforePauseRef.current = 0;
      setShowViewers(false);
    }
  }, [currentIndex]);

  // Mark status as viewed
  useEffect(() => {
    if (!isOpen || !currentStory || isOwner) return;

    const markViewed = async () => {
      try {
        const token = localStorage.getItem("token");
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/status/${currentStory._id}/view`,
          {
            method: "POST",
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );
      } catch (err) {
        console.error("Failed to mark status viewed:", err);
      }
    };

    markViewed();
  }, [isOpen, currentStory, isOwner]);

  // Reset when initial index changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setProgress(0);
      elapsedBeforePauseRef.current = 0;
      setIsPaused(false);
      setShowViewers(false);
    }
  }, [isOpen, initialIndex]);

  // Story progress timer
  useEffect(() => {
    if (!isOpen || isPaused || showViewers) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    startTimeRef.current = Date.now() - elapsedBeforePauseRef.current;

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / STORY_DURATION_MS) * 100, 100);
      setProgress(pct);

      if (pct >= 100) {
        if (timerRef.current) clearInterval(timerRef.current);
        handleNext();
      }
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isPaused, showViewers, currentIndex, currentStory?._id, handleNext]);

  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
    } else {
      elapsedBeforePauseRef.current = (progress / 100) * STORY_DURATION_MS;
      setIsPaused(true);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !currentStory || !currentUserId) return;

    try {
      setIsSendingReply(true);
      const recipientId = currentStory.user._id;
      const content = `Replied to status: "${currentStory.text || "media"}": ${replyText.trim()}`;

      socket.emit("send_message", {
        receiverId: recipientId,
        content,
        messageType: "text",
      });

      setReplyText("");
      alert("Reply sent to chat!");
    } catch (err) {
      console.error("Failed to send reply:", err);
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleDelete = async () => {
    if (!currentStory || !onDeleteStatus) return;
    if (window.confirm("Are you sure you want to delete this status update?")) {
      const deleted = await onDeleteStatus(currentStory._id);
      if (!deleted) return;

      if (stories.length <= 1) {
        onClose();
      } else if (currentIndex < stories.length - 1) {
        setProgress(0);
        elapsedBeforePauseRef.current = 0;
        setShowViewers(false);
      } else {
        setCurrentIndex((prev) => prev - 1);
        setProgress(0);
        elapsedBeforePauseRef.current = 0;
        setShowViewers(false);
      }
    }
  };

  const formatStoryTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  if (!isOpen || !currentStory) return null;

  const authorName = currentStory.user?.name || currentStory.user?.mobile || "User";
  const avatarUrl =
    typeof currentStory.user?.avatar === "string"
      ? currentStory.user.avatar
      : currentStory.user?.avatar?.url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 select-none">
      {/* Container simulating a mobile story display */}
      <div className="relative h-full w-full max-w-md md:h-[90vh] md:max-h-[800px] flex flex-col justify-between overflow-hidden md:rounded-2xl bg-black shadow-2xl border border-white/10">
        
        {/* Top Progress Bars */}
        <div className="absolute top-0 left-0 right-0 z-30 flex items-center gap-1.5 p-3 bg-gradient-to-b from-black/80 to-transparent">
          {stories.map((st, idx) => (
            <div
              key={st._id}
              className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden"
            >
              <div
                className="h-full bg-white transition-all duration-75"
                style={{
                  width:
                    idx < currentIndex
                      ? "100%"
                      : idx === currentIndex
                      ? `${progress}%`
                      : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Top Header Bar */}
        <div className="absolute top-6 left-0 right-0 z-30 flex items-center justify-between px-4 py-2 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full overflow-hidden bg-white/10 border border-white/20 shrink-0">
              {avatarUrl ? (
                <AuthImage
                  src={avatarUrl}
                  alt={authorName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-white font-bold text-sm bg-blue-600">
                  {authorName[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-white drop-shadow">
                {isOwner ? "My Status" : authorName}
              </p>
              <p className="text-xs text-white/70">
                {formatStoryTime(currentStory.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePause}
              aria-label={isPaused ? "Play story" : "Pause story"}
              className="p-1.5 text-white/80 hover:text-white transition rounded-full hover:bg-white/10"
            >
              {isPaused ? <Play size={18} /> : <Pause size={18} />}
            </button>

            {isOwner && (
              <button
                type="button"
                onClick={handleDelete}
                aria-label="Delete status"
                className="p-1.5 text-red-400 hover:text-red-300 transition rounded-full hover:bg-white/10"
              >
                <Trash2 size={18} />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close story viewer"
              className="p-1.5 text-white/80 hover:text-white transition rounded-full hover:bg-white/10"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Middle Content View */}
        <div
          className="relative flex-1 flex items-center justify-center overflow-hidden"
          style={{
            backgroundColor:
              currentStory.mediaType === "text"
                ? currentStory.backgroundColor || "#0d6b50"
                : "#000000",
          }}
        >
          {/* Left / Right Tap zones */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-0 top-16 bottom-20 w-1/3 z-20 opacity-0 hover:opacity-20 flex items-center justify-start pl-2 text-white"
            aria-label="Previous story"
          >
            <ChevronLeft size={36} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-0 top-16 bottom-20 w-1/3 z-20 opacity-0 hover:opacity-20 flex items-center justify-end pr-2 text-white"
            aria-label="Next story"
          >
            <ChevronRight size={36} />
          </button>

          {/* Render Text or Media */}
          {currentStory.mediaType === "text" ? (
            <div className="px-8 text-center">
              <p
                className="text-white text-2xl md:text-3xl font-semibold leading-relaxed break-words drop-shadow-md"
                style={{ fontFamily: currentStory.font || "sans-serif" }}
              >
                {currentStory.text}
              </p>
            </div>
          ) : currentStory.mediaType === "video" ? (
            <video
              src={currentStory.mediaUrl}
              autoPlay
              playsInline
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="relative h-full w-full flex flex-col items-center justify-center">
              {currentStory.mediaUrl && (
                <AuthImage
                  src={currentStory.mediaUrl}
                  alt="Story photo"
                  className="max-h-full max-w-full object-contain"
                />
              )}
              {currentStory.text && (
                <div className="absolute bottom-6 left-4 right-4 z-20 rounded-xl bg-black/60 backdrop-blur-sm p-3 text-center">
                  <p className="text-white text-sm font-medium">{currentStory.text}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Bar: Reply or Viewers Drawer */}
        <div className="z-30 p-4 bg-gradient-to-t from-black/90 to-transparent">
          {isOwner ? (
            <div>
              <button
                type="button"
                onClick={() => {
                  setShowViewers((v) => !v);
                  setIsPaused(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-white/90 hover:text-white transition text-sm font-medium bg-white/10 rounded-xl hover:bg-white/15"
              >
                <Eye size={18} />
                <span>
                  {currentStory.viewers?.length || 0}{" "}
                  {currentStory.viewers?.length === 1 ? "view" : "views"}
                </span>
              </button>

              {/* Viewers Drawer */}
              {showViewers && (
                <div className="mt-3 max-h-48 overflow-y-auto rounded-xl bg-[#111a28] border border-white/10 p-3 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-semibold text-gray-400">
                    <span>Viewed by ({currentStory.viewers?.length || 0})</span>
                    <button
                      type="button"
                      onClick={() => setShowViewers(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  {currentStory.viewers && currentStory.viewers.length > 0 ? (
                    currentStory.viewers.map((vw, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs py-1"
                      >
                        <span className="text-white font-medium">
                          {vw.user?.name || vw.user?.mobile || "User"}
                        </span>
                        <span className="text-gray-400">
                          {new Date(vw.viewedAt).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-2">
                      No views yet
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSendReply} className="flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onFocus={() => setIsPaused(true)}
                onBlur={() => setIsPaused(false)}
                placeholder="Reply to status..."
                className="flex-1 rounded-full bg-white/10 border border-white/20 px-4 py-2.5 text-sm text-white placeholder:text-gray-400 outline-none focus:border-white/50"
              />
              <button
                type="submit"
                disabled={!replyText.trim() || isSendingReply}
                aria-label="Send reply"
                className="rounded-full bg-blue-600 p-2.5 text-white transition hover:bg-blue-500 disabled:opacity-40"
              >
                <Send size={16} />
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
