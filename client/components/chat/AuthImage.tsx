import React, { useState, useEffect, useMemo } from 'react';
import { User, ImageOff } from 'lucide-react';

interface AuthImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallback?: React.ReactNode;
}

export function resolveImageUrl(src: string): string {
  if (!src) return "";
  let resolved = src.trim();

  // Upgrade http:// to https:// when running in HTTPS environment
  if (
    typeof window !== "undefined" &&
    window.location.protocol === "https:" &&
    resolved.startsWith("http://") &&
    !resolved.includes("localhost") &&
    !resolved.includes("127.0.0.1")
  ) {
    resolved = resolved.replace(/^http:\/\//, "https://");
  }

  // Prepend backend URL if relative path
  if (resolved.startsWith("/")) {
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000")
      .replace(/\/api\/v1\/?$/, "")
      .replace(/\/+$/, "");
    resolved = `${apiBase}${resolved}`;
  }

  return resolved;
}

export default function AuthImage({ src, fallback, alt = "image", className = "", ...props }: AuthImageProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const cleanUrl = useMemo(() => resolveImageUrl(src), [src]);

  // Only chat_media uploads require an authenticated Bearer token
  const isProtectedMedia = useMemo(() => {
    return cleanUrl.includes("/uploads/chat_media/");
  }, [cleanUrl]);

  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    setError(false);
    setObjectUrl(null);

    if (!cleanUrl) {
      setError(true);
      return;
    }

    if (!isProtectedMedia) {
      // Direct load for public images, avatars, Cloudinary, data:, blob:
      return;
    }

    const fetchImage = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(cleanUrl, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch image');
        }

        const blob = await response.blob();
        if (active) {
          createdUrl = URL.createObjectURL(blob);
          setObjectUrl(createdUrl);
        }
      } catch {
        if (active) {
          setError(true);
        }
      }
    };

    fetchImage();

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [cleanUrl, isProtectedMedia]);

  if (error) {
    if (fallback) {
      return <>{fallback}</>;
    }
    const isAvatar = className.includes("rounded-full");
    if (isAvatar) {
      return (
        <div className={`flex items-center justify-center bg-white/10 text-gray-400 ${className}`}>
          <User size={16} />
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center gap-1.5 bg-white/5 rounded-lg p-2.5 text-xs text-gray-400 border border-white/5">
        <ImageOff size={14} />
        <span>Image unavailable</span>
      </div>
    );
  }

  if (isProtectedMedia) {
    if (!objectUrl) {
      return fallback ? (
        <>{fallback}</>
      ) : (
        <div className={`bg-white/5 animate-pulse rounded-lg ${className || "w-[200px] h-[150px]"}`} />
      );
    }
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={objectUrl}
        alt={alt}
        className={className}
        onError={() => setError(true)}
        {...props}
      />
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={cleanUrl}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
}
