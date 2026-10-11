import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Status from "../models/Status";
import NewContact from "../models/newContact";
import User from "../models/User";
import { uploadMediaFile } from "../services/storageService";
import mongoose from "mongoose";
import { io } from "../app";

export const createStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { text, backgroundColor, font } = req.body;
    let { mediaUrl, mediaType } = req.body;

    if (req.file) {
      const uploadResult = await uploadMediaFile(req.file.path, "echochat/status");
      mediaUrl = uploadResult.isCloud
        ? uploadResult.url
        : `${req.protocol}://${req.get("host")}/uploads/status/${req.file.filename}`;
      mediaType = req.file.mimetype.startsWith("video/") ? "video" : "image";
    }

    if (!mediaUrl && !text) {
      return res.status(400).json({ error: "Status must contain text or media" });
    }

    if (!mediaType) {
      mediaType = mediaUrl ? "image" : "text";
    }

    // Status expires in 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newStatus = await Status.create({
      user: userId,
      mediaUrl: mediaUrl || "",
      mediaType,
      text: text || "",
      backgroundColor: backgroundColor || "#0d6b50",
      font: font || "sans-serif",
      expiresAt,
    });
    io.emit("new_status");

    const populatedStatus = await Status.findById(newStatus._id).populate(
      "user",
      "name mobile avatar"
    );

    return res.status(201).json({
      message: "Status created successfully",
      status: populatedStatus,
    });
  } catch (error) {
    console.error("Create status error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getStatuses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const now = new Date();

    const contacts = await NewContact.find({ ownerId: userId }).select("mobile");
    const registeredContacts = await User.find({
      mobile: { $in: contacts.map((contact) => contact.mobile) },
    }).select("_id");
    const visibleUserIds = [userId, ...registeredContacts.map((user) => user._id)];

    const activeStatuses = await Status.find({
      expiresAt: { $gt: now },
      user: { $in: visibleUserIds },
    })
      .populate("user", "name mobile avatar")
      .sort({ createdAt: 1 });

    const myStatuses: any[] = [];
    const contactMap = new Map<string, { user: any; stories: any[]; allViewed: boolean; latestTimestamp: Date }>();

    for (const st of activeStatuses) {
      const author = st.user as any;
      if (!author) continue;

      const authorId = author._id ? author._id.toString() : author.toString();

      if (authorId === userId) {
        myStatuses.push(st);
      } else {
        const isViewed = st.viewers.some((v: any) => {
          const vId = v.user?._id ? v.user._id.toString() : v.user?.toString();
          return vId === userId;
        });

        if (!contactMap.has(authorId)) {
          contactMap.set(authorId, {
            user: author,
            stories: [st],
            allViewed: isViewed,
            latestTimestamp: st.createdAt,
          });
        } else {
          const group = contactMap.get(authorId)!;
          group.stories.push(st);
          if (!isViewed) {
            group.allViewed = false;
          }
          if (st.createdAt > group.latestTimestamp) {
            group.latestTimestamp = st.createdAt;
          }
        }
      }
    }

    await Status.populate(myStatuses, {
      path: "viewers.user",
      select: "name mobile avatar",
    });

    const contactStatuses = Array.from(contactMap.values()).sort((a, b) => {
      // Unviewed stories first, then by recency
      if (a.allViewed !== b.allViewed) {
        return a.allViewed ? 1 : -1;
      }
      return b.latestTimestamp.getTime() - a.latestTimestamp.getTime();
    });

    return res.status(200).json({
      myStatuses,
      contactStatuses,
    });
  } catch (error) {
    console.error("Get statuses error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const viewStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const statusId = String(req.params.statusId);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!statusId || !mongoose.Types.ObjectId.isValid(statusId)) {
      return res.status(400).json({ error: "Invalid status ID" });
    }

    const status = await Status.findById(statusId);
    if (!status) {
      return res.status(404).json({ error: "Status not found or expired" });
    }

    const authorId = status.user.toString();
    // Do not count author's own views
    if (authorId !== userId) {
      const alreadyViewed = status.viewers.some(
        (v: any) => (v.user?._id ? v.user._id.toString() : v.user?.toString()) === userId
      );

      if (!alreadyViewed) {
        status.viewers.push({
          user: new mongoose.Types.ObjectId(userId) as any,
          viewedAt: new Date(),
        });
        await status.save();
      }
    }

    return res.status(200).json({ message: "Status marked as viewed" });
  } catch (error) {
    console.error("View status error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const statusId = String(req.params.statusId);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!statusId || !mongoose.Types.ObjectId.isValid(statusId)) {
      return res.status(400).json({ error: "Invalid status ID" });
    }

    const status = await Status.findById(statusId);
    if (!status) {
      return res.status(404).json({ error: "Status not found" });
    }

    if (status.user.toString() !== userId) {
      return res.status(403).json({ error: "You can only delete your own status" });
    }

    await Status.findByIdAndDelete(statusId);

    return res.status(200).json({ message: "Status deleted successfully" });
  } catch (error) {
    console.error("Delete status error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
