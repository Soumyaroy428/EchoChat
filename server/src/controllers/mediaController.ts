import { Request, Response } from "express";

export const uploadMedia = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const url = `${req.protocol}://${req.get("host")}/uploads/chat_media/${file.filename}`;
    
    return res.status(201).json({
      url,
      metadata: {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      }
    });
  } catch (error) {
    console.error("Upload media error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
