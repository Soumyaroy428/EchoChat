import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import fs from "fs";
import path from "path";

// Initialize Cloudinary if credentials exist
const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_NAME &&
  process.env.CLOUDINARY_KEY &&
  process.env.CLOUDINARY_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
    secure: true,
  });
}

export interface UploadResult {
  url: string;
  isCloud: boolean;
  publicId?: string;
  mimetype?: string;
  size?: number;
}

/**
 * Uploads a local file or buffer to Cloudinary CDN if configured,
 * or serves from local storage otherwise.
 */
export async function uploadMediaFile(
  filePath: string,
  folder: string = "echochat/media",
  resourceType: "auto" | "image" | "video" | "raw" = "auto"
): Promise<UploadResult> {
  if (isCloudinaryConfigured) {
    try {
      const result: UploadApiResponse = await cloudinary.uploader.upload(filePath, {
        folder,
        resource_type: resourceType,
      });

      // Optionally clean up local file if uploaded to cloud
      fs.unlink(filePath, () => {});

      return {
        url: result.secure_url,
        isCloud: true,
        publicId: result.public_id,
        size: result.bytes,
      };
    } catch (error) {
      console.error("Cloudinary upload failed, falling back to local storage:", error);
    }
  }

  // Fallback: Local storage
  const filename = path.basename(filePath);
  const uploadDirectory = folder === "echochat/status" ? "status" : "chat_media";
  return {
    url: `/uploads/${uploadDirectory}/${filename}`,
    isCloud: false,
  };
}

/**
 * Uploads a buffer directly (e.g. for avatar memory storage) to Cloudinary or returns buffer
 */
export async function uploadBufferToCloud(
  buffer: Buffer,
  folder: string = "echochat/avatars"
): Promise<string | null> {
  if (!isCloudinaryConfigured) return null;

  return new Promise((resolve) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) {
          console.error("Cloudinary buffer upload error:", error);
          resolve(null);
        } else {
          resolve(result.secure_url);
        }
      }
    );
    uploadStream.end(buffer);
  });
}
