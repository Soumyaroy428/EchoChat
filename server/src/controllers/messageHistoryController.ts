import { Response } from "express";
import MessageHistory from "../models/messageHistory";
import type { AuthRequest } from "../middleware/auth";
import User from "../models/User";
import NewContact from "../models/newContact";

const mapMessage = (message: any) => ({
  id: message._id?.toString() || message.id,
  senderId: message.senderId,
  receiverId: message.receiverId,
  groupId: message.groupId,
  content: message.content,
  timestamp: message.timestamp,
  status: message.status || "sent",
  mediaUrl: message.mediaUrl,
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
      return res.status(400).json({ error: "User and contact/group IDs are required" });
    }

    // Check if the contactId is actually a Group ID
    const isGroupQuery = req.query.isGroup === "true";

    let messages;
    if (isGroupQuery) {
      messages = await MessageHistory.find({ groupId: contactId }).sort({ timestamp: 1 });
    } else {
      const participantIds = await getConversationIds(contactId);
      messages = await MessageHistory.find({
        $or: [
          { senderId: currentUserId, receiverId: { $in: participantIds } },
          { senderId: { $in: participantIds }, receiverId: currentUserId },
        ],
      }).sort({ timestamp: 1 });
    }

    res.json({ messages: messages.map(mapMessage) });
  } catch (error) {
    console.error("Get message history error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.userId;
    const { receiverId, groupId, content } = req.body as { receiverId?: string; groupId?: string; content?: string };

    if (!currentUserId || (!receiverId && !groupId)) {
      return res.status(400).json({ error: "User ID and (Receiver ID or Group ID) are required" });
    }

    if (typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({ error: "Message content is required" });
    }

    let message;
    if (groupId) {
      message = await MessageHistory.create({
        senderId: currentUserId,
        groupId,
        content: content.trim(),
        timestamp: new Date(),
      });
    } else if (receiverId) {
      const canonicalReceiverId = await resolveUserId(receiverId);
      message = await MessageHistory.create({
        senderId: currentUserId,
        receiverId: canonicalReceiverId,
        content: content.trim(),
        timestamp: new Date(),
      });
    }

    res.status(201).json({ message: mapMessage(message) });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    const messageId = req.params.messageId;
    const userId = req.userId;

    if (!messageId || !userId) {
      return res.status(400).json({ error: "Message ID is required" });
    }

    const message = await MessageHistory.findOneAndDelete({
      _id: messageId,
      senderId: userId
    });

    if (!message) {
      return res.status(404).json({ error: "Message not found or unauthorized" });
    }

    res.json({ success: true, messageId });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
