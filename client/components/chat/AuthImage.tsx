import React, { useState, useEffect } from 'react';

interface AuthImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

export default function AuthImage({ src, ...props }: AuthImageProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    setError(false);
    setObjectUrl(null);

    const fetchImage = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(src, {
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
      } catch (err) {
        if (active) {
          setError(true);
        }
      }
    };

    if (src) {
      fetchImage();
    }

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [src]);

  if (error) {
    return <div className="flex items-center justify-center bg-white/10 rounded-lg p-4 text-sm text-gray-400">Failed to load image</div>;
  }

  if (!objectUrl) {
    return <div className="flex items-center justify-center bg-white/5 animate-pulse rounded-lg w-[200px] h-[150px]"></div>;
  }

  return <img src={objectUrl} {...props} />;
}
