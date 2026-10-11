"use client";

import { useState, useRef, type ChangeEvent, type FormEvent } from "react";
import { X, Image as ImageIcon, Type, Send, Loader2, Palette } from "lucide-react";

type CreateStatusModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onStatusCreated: () => void;
};

const COLOR_PALETTE = [
  "#0d6b50", // WhatsApp emerald
  "#128C7E", // Teal
  "#1b74e4", // Blue
  "#7b1fa2", // Purple
  "#c2185b", // Magenta
  "#d32f2f", // Red
  "#e65100", // Orange
  "#263238", // Dark slate
];

export default function CreateStatusModal({
  isOpen,
  onClose,
  onStatusCreated,
}: CreateStatusModalProps) {
  const [mode, setMode] = useState<"text" | "media">("text");
  const [text, setText] = useState("");
  const [bgColor, setBgColor] = useState(COLOR_PALETTE[0]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setMode("media");
    }
  };

  const handleReset = () => {
    setText("");
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setMode("text");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (mode === "text" && !text.trim()) return;
    if (mode === "media" && !selectedFile) return;

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();

      if (mode === "text") {
        formData.append("text", text.trim());
        formData.append("backgroundColor", bgColor);
        formData.append("mediaType", "text");
      } else if (selectedFile) {
        formData.append("media", selectedFile);
        if (text.trim()) {
          formData.append("text", text.trim());
        }
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/status`,
        {
          method: "POST",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create status");
      }

      handleReset();
      onStatusCreated();
      onClose();
    } catch (err: any) {
      console.error("Create status error:", err);
      alert(err.message || "Failed to publish status");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0c1524] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMode("text")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                mode === "text"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Type size={16} />
              Text
            </button>
            <button
              type="button"
              onClick={() => {
                if (!selectedFile) {
                  fileInputRef.current?.click();
                } else {
                  setMode("media");
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                mode === "media"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <ImageIcon size={16} />
              Media
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*"
              className="hidden"
            />
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-full p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
          {mode === "text" ? (
            <div
              className="flex-1 min-h-[300px] flex flex-col justify-center items-center p-6 transition-colors duration-300 relative"
              style={{ backgroundColor: bgColor }}
            >
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={500}
                placeholder="Type a status update..."
                className="w-full text-center bg-transparent text-white text-2xl md:text-3xl font-medium outline-none placeholder:text-white/60 resize-none drop-shadow-md"
                rows={4}
                autoFocus
              />
              <span className="absolute bottom-3 right-4 text-xs text-white/70">
                {text.length}/500
              </span>
            </div>
          ) : (
            <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center p-4 bg-black/40 relative">
              {previewUrl ? (
                <div className="relative max-h-[320px] w-full flex items-center justify-center overflow-hidden rounded-xl bg-black">
                  {selectedFile?.type.startsWith("video/") ? (
                    <video
                      src={previewUrl}
                      controls
                      className="max-h-[300px] w-auto rounded-lg object-contain"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewUrl}
                      alt="Status preview"
                      className="max-h-[300px] w-auto rounded-lg object-contain"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      fileInputRef.current?.click();
                    }}
                    className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-white/20 rounded-2xl text-gray-400 hover:text-white hover:border-white/40 transition"
                >
                  <ImageIcon size={40} />
                  <span className="text-sm">Click to select photo or video</span>
                </button>
              )}

              {/* Caption */}
              <div className="w-full mt-3">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={200}
                  placeholder="Add a caption..."
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder:text-gray-500 outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>
          )}

          {/* Color palette selector for Text mode */}
          {mode === "text" && (
            <div className="flex items-center gap-2 px-5 py-3 border-t border-white/10 bg-[#08101c] overflow-x-auto">
              <Palette size={16} className="text-gray-400 shrink-0 mr-1" />
              {COLOR_PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setBgColor(color)}
                  className={`h-7 w-7 rounded-full shrink-0 transition-transform ${
                    bgColor === color ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-black" : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}

          {/* Footer Submit */}
          <div className="flex items-center justify-between border-t border-white/10 px-5 py-3.5 bg-[#070e18]">
            <p className="text-xs text-gray-400">
              Disappears after 24 hours
            </p>
            <button
              type="submit"
              disabled={isSubmitting || (mode === "text" && !text.trim()) || (mode === "media" && !selectedFile)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Share Status
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
