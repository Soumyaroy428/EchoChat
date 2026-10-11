"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Camera, Eye } from "lucide-react";
import AuthImage from "../chat/AuthImage";
import CreateStatusModal from "./CreateStatusModal";
import StatusViewerModal, { StatusItem } from "./StatusViewerModal";
import { socket } from "../../lib/socket";

type UserProfile = {
  id: string;
  name: string;
  mobile: string;
  avatar?: string;
};

type ContactStatusGroup = {
  user: {
    _id: string;
    name?: string;
    mobile?: string;
    avatar?: any;
  };
  stories: StatusItem[];
  allViewed: boolean;
  latestTimestamp: string;
};

type StatusSectionProps = {
  currentUser: UserProfile | null;
  onBackToChats?: () => void;
};

export default function StatusSection({
  currentUser,
}: StatusSectionProps) {
  const [myStatuses, setMyStatuses] = useState<StatusItem[]>([]);
  const [contactStatuses, setContactStatuses] = useState<ContactStatusGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeViewerStories, setActiveViewerStories] = useState<StatusItem[] | null>(null);
  const [isViewerOwner, setIsViewerOwner] = useState(false);

  const fetchStatuses = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setMyStatuses(data.myStatuses || []);
        setContactStatuses(data.contactStatuses || []);
      }
    } catch (err) {
      console.error("Failed to fetch statuses:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatuses();

    // Listen for live status events
    socket.on("new_status", fetchStatuses);
    return () => {
      socket.off("new_status", fetchStatuses);
    };
  }, [fetchStatuses]);

  const handleDeleteStatus = async (statusId: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/status/${statusId}`,
        {
          method: "DELETE",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      if (res.ok) {
        setActiveViewerStories((stories) =>
          stories?.filter((story) => story._id !== statusId) ?? null
        );
        fetchStatuses();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to delete status:", err);
      return false;
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return "Yesterday";
  };

  const recentUpdates = contactStatuses.filter((c) => !c.allViewed);
  const viewedUpdates = contactStatuses.filter((c) => c.allViewed);

  const totalMyViews = myStatuses.reduce(
    (sum, st) => sum + (st.viewers?.length || 0),
    0
  );

  return (
    <div className="flex h-full w-full flex-col rounded-[1.75rem] border border-white/10 bg-[#08101b] p-4 text-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Status</h2>
          <p className="text-xs text-gray-400">24-hour stories</p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition"
          aria-label="Add status"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-5 pt-4 pr-1">
        {/* My Status */}
        <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-white/5 transition">
          <div
            className="flex items-center gap-3.5 flex-1 cursor-pointer"
            onClick={() => {
              if (myStatuses.length > 0) {
                setActiveViewerStories(myStatuses);
                setIsViewerOwner(true);
              } else {
                setIsCreateModalOpen(true);
              }
            }}
          >
            <div className="relative h-13 w-13 shrink-0">
              <div
                className={`h-12 w-12 rounded-full overflow-hidden p-0.5 ${
                  myStatuses.length > 0
                    ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-[#08101b]"
                    : ""
                }`}
              >
                {currentUser?.avatar ? (
                  <AuthImage
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-blue-600 text-white font-bold rounded-full text-base">
                    {currentUser?.name?.[0]?.toUpperCase() || "M"}
                  </div>
                )}
              </div>

              {myStatuses.length === 0 && (
                <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-[#08101b]">
                  <Plus size={13} strokeWidth={3} />
                </div>
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <p className="font-semibold text-sm text-white">My Status</p>
              <p className="text-xs text-gray-400 truncate">
                {myStatuses.length > 0
                  ? `${myStatuses.length} ${
                      myStatuses.length === 1 ? "update" : "updates"
                    } • ${formatRelativeTime(
                      myStatuses[myStatuses.length - 1].createdAt
                    )}`
                  : "Tap to add status update"}
              </p>
            </div>
          </div>

          {myStatuses.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs text-gray-400 bg-white/5 px-2.5 py-1 rounded-full">
                <Eye size={12} />
                {totalMyViews}
              </span>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                aria-label="Add another status"
                className="p-2 text-emerald-400 hover:text-emerald-300 transition hover:bg-white/5 rounded-full"
              >
                <Camera size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Recent Updates */}
        {recentUpdates.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400/90 px-2">
              Recent updates
            </h3>
            <div className="space-y-1">
              {recentUpdates.map((item) => {
                const name = item.user?.name || item.user?.mobile || "Contact";
                const avatar =
                  typeof item.user?.avatar === "string"
                    ? item.user.avatar
                    : item.user?.avatar?.url;

                return (
                  <div
                    key={item.user._id}
                    onClick={() => {
                      setActiveViewerStories(item.stories);
                      setIsViewerOwner(false);
                    }}
                    className="flex items-center gap-3.5 p-2 rounded-2xl hover:bg-white/5 cursor-pointer transition"
                  >
                    <div className="h-12 w-12 rounded-full p-0.5 ring-2 ring-emerald-500 ring-offset-2 ring-offset-[#08101b] shrink-0 overflow-hidden">
                      {avatar ? (
                        <AuthImage
                          src={avatar}
                          alt={name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-purple-600 text-white font-bold rounded-full text-base">
                          {name[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <p className="font-medium text-sm text-white truncate">
                        {name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatRelativeTime(item.latestTimestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Viewed Updates */}
        {viewedUpdates.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 px-2">
              Viewed updates
            </h3>
            <div className="space-y-1">
              {viewedUpdates.map((item) => {
                const name = item.user?.name || item.user?.mobile || "Contact";
                const avatar =
                  typeof item.user?.avatar === "string"
                    ? item.user.avatar
                    : item.user?.avatar?.url;

                return (
                  <div
                    key={item.user._id}
                    onClick={() => {
                      setActiveViewerStories(item.stories);
                      setIsViewerOwner(false);
                    }}
                    className="flex items-center gap-3.5 p-2 rounded-2xl hover:bg-white/5 cursor-pointer transition opacity-80"
                  >
                    <div className="h-12 w-12 rounded-full p-0.5 ring-2 ring-gray-600 ring-offset-2 ring-offset-[#08101b] shrink-0 overflow-hidden">
                      {avatar ? (
                        <AuthImage
                          src={avatar}
                          alt={name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-600 text-white font-bold rounded-full text-base">
                          {name[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <p className="font-medium text-sm text-white truncate">
                        {name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatRelativeTime(item.latestTimestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && recentUpdates.length === 0 && viewedUpdates.length === 0 && (
          <div className="pt-6 pb-4 text-center px-4">
            <p className="text-sm text-gray-400">
              No updates from contacts yet.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Tap the plus button above to share your own status update!
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateStatusModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onStatusCreated={fetchStatuses}
      />

      {activeViewerStories && (
        <StatusViewerModal
          isOpen={true}
          onClose={() => {
            setActiveViewerStories(null);
            fetchStatuses();
          }}
          stories={activeViewerStories}
          isOwner={isViewerOwner}
          onDeleteStatus={handleDeleteStatus}
          currentUserId={currentUser?.id}
        />
      )}
    </div>
  );
}
