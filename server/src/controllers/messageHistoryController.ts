import { Response } from "express";
import MessageHistory from "../models/messageHistory";
import type { AuthRequest } from "../middleware/auth";
import User from "../models/User";
import NewContact from "../models/newContact";

const mapMessage = (message: any) => ({
  id: message._id?.toString() || message.id,
  senderId: message.senderId,
  receiverId: message.receiverId,
  content: message.content,
  timestamp: message.timestamp,
});

const resolveUserId = async (id: string) => {
  const user = await User.findById(id).select("_id mobile");
  if (user) return user._id.toString();

  const contact = await NewContact.findById(id).select("mobile");
  if (!contact) return id;

  const contactUser = await User.findOne({ mobile: contact.mobile }).select("_id");
  return contactUser?._id.toString() || id;
};

const getConversationIds = async (id: string) => {
  const ids = new Set([id, await resolveUserId(id)]);
  const contact = await NewContact.findById(id).select("mobile");
  if (contact) {
    const matchingContact = await NewContact.findOne({ mobile: contact.mobile }).select("_id");
    if (matchingContact) ids.add(matchingContact._id.toString());
  }
  return [...ids];
};

export const getMessageHistory = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.userId;
    const contactId = Array.isArray(req.params.contactId)
      ? req.params.contactId[0]
      : req.params.contactId;

    if (!currentUserId || !contactId) {
      return res.status(400).json({ error: "User and contact IDs are required" });
    }

    const participantIds = await getConversationIds(contactId);
    const messages = await MessageHistory.find({
      $or: [
        { senderId: currentUserId, receiverId: { $in: participantIds } },
        { senderId: { $in: participantIds }, receiverId: currentUserId },
      ],
    }).sort({ timestamp: 1 });

    res.json({ messages: messages.map(mapMessage) });
  } catch (error) {
    console.error("Get message history error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.userId;
    const { receiverId, content } = req.body as { receiverId?: string; content?: string };

    if (!currentUserId || !receiverId) {
      return res.status(400).json({ error: "User and receiver IDs are required" });
    }

    if (typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({ error: "Message content is required" });
    }

    const canonicalReceiverId = await resolveUserId(receiverId);
    const message = await MessageHistory.create({
      senderId: currentUserId,
      receiverId: canonicalReceiverId,
      content: content.trim(),
      timestamp: new Date(),
    });

    res.status(201).json({ message: mapMessage(message) });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
