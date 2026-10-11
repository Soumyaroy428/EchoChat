import { Request, Response } from "express";
import { uploadMediaFile } from "../services/storageService";

export const uploadMedia = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const uploadResult = await uploadMediaFile(file.path);
    const forwardedProto = req.get("x-forwarded-proto");
    const protocol = forwardedProto
      ? forwardedProto.split(",")[0].trim()
      : (req.protocol === "http" && process.env.NODE_ENV === "production" ? "https" : req.protocol);
    const finalUrl = uploadResult.isCloud
      ? uploadResult.url
      : `${protocol}://${req.get("host")}${uploadResult.url}`;

    return res.status(201).json({
      url: finalUrl,
      metadata: {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: uploadResult.size || file.size,
        isCloud: uploadResult.isCloud,
      },
    });
  } catch (error) {
    console.error("Upload media error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
