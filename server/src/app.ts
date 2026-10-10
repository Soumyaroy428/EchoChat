import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import contactRoutes from "./routes/contactRoutes";
import groupRoutes from "./routes/groupRoutes";
import messageHistoryRoutes from "./routes/messageHistoryRoutes";
import mediaRoutes from "./routes/mediaRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import bodyParser from "body-parser";
import { createServer } from "node:http";
import { Server } from "socket.io";
import path from "node:path";
import fs from "fs";
import jwt from "jsonwebtoken";
import MessageHistory from "./models/messageHistory";
import { sendPushNotificationToUser } from "./utils/push";
import User from "./models/User";
import NewContact from "./models/newContact";
import Group from "./models/Group";

const app = express();
const server = createServer(app);
const mapMessage = (message: {
  _id?: { toString(): string };
  id?: string;
  senderId: string;
  receiverId?: string;
  groupId?: string;
  content: string;
  timestamp: Date;
  status?: string;
  mediaUrl?: string;
}) => ({
  id: message._id?.toString() || message.id,
  senderId: message.senderId,
  receiverId: message.receiverId,
  groupId: message.groupId,
  content: message.content,
  timestamp: message.timestamp,
  status: message.status || "sent",
  mediaUrl: message.mediaUrl,
});

export const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
  },
});

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const resolveUserId = async (id: string) => {
  const user = await User.findById(id).select("_id");
  if (user) return user._id.toString();
  const contact = await NewContact.findById(id).select("mobile");
  if (!contact) return id;
  const contactUser = await User.findOne({ mobile: contact.mobile }).select("_id");
  return contactUser?._id.toString() || id;
};
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (typeof token !== "string" || token.length === 0) {
    next(new Error("Authentication required"));
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId?: string };
    if (!decoded.userId) {
      next(new Error("Invalid token"));
      return;
    }
    socket.data.userId = decoded.userId;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

//body-purser to parse incoming HTTP request bodies
app.use(bodyParser.json());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
// Serve media files securely
app.get("/uploads/chat_media/:filename", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const token = authHeader.split(" ")[1];
    let userId: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId?: string };
      if (!decoded.userId) throw new Error("Invalid token");
      userId = decoded.userId;
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { filename } = req.params;
    
    // Find message with this media
    const message = await MessageHistory.findOne({ mediaUrl: { $regex: filename } });
    if (!message) {
      // If no message found, the file might be abandoned or not saved yet.
      // Deny access unless it's a very recently uploaded file? 
      // Actually, since it's uploaded via /upload and immediately attached to a message,
      // it should exist. If it doesn't, we can default to denying for security.
      return res.status(404).json({ error: "Media not found" });
    }

    // Check authorization
    let authorized = false;
    if (message.groupId) {
      const group = await Group.findById(message.groupId);
      if (group && group.members.includes(userId)) {
        authorized = true;
      }
    } else {
      if (message.senderId === userId) authorized = true;
      else {
        // We need to resolve receiverId
        const resolveUserIdInner = async (id: string) => {
          const user = await User.findById(id).select("_id mobile");
          if (user) return user._id.toString();
          const contact = await NewContact.findById(id).select("mobile");
          if (!contact) return id;
          const contactUser = await User.findOne({ mobile: contact.mobile }).select("_id");
          return contactUser?._id.toString() || id;
        };
        const canonicalReceiver = await resolveUserIdInner(message.receiverId || "");
        if (canonicalReceiver === userId) authorized = true;
        // Check if current user is the original NewContact ID
        if (message.receiverId === userId) authorized = true;
      }
    }

    if (!authorized) {
      return res.status(403).json({ error: "Forbidden: You don't have access to this media" });
    }

    const filePath = path.join(process.cwd(), "uploads", "chat_media", filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found on disk" });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error("Media secure route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/", (req, res) => {
  res.send("EchoChat API Running 🚀");
});

const activeCalls = new Map<string, { participants: Set<string> }>();

io.on("connection", async (socket) => {
  const userId = socket.data.userId as string;
  socket.join(`user:${userId}`);
  console.log(`Socket connected: ${userId}`);

  // Set user as online and mark delivered
  try {
    await User.findByIdAndUpdate(userId, { isOnline: true });
    io.emit("user_status", { userId, isOnline: true, lastSeen: new Date() });
    
    // Mark pending messages as delivered
    const undelivered = await MessageHistory.find({ receiverId: userId, status: "sent" });
    if (undelivered.length > 0) {
      await MessageHistory.updateMany({ receiverId: userId, status: "sent" }, { $set: { status: "delivered" } });
      const bySender: Record<string, string[]> = {};
      undelivered.forEach(m => {
        if (!bySender[m.senderId]) bySender[m.senderId] = [];
        bySender[m.senderId].push(m._id.toString());
      });
      for (const [senderId, msgIds] of Object.entries(bySender)) {
        socket.to(`user:${senderId}`).emit("messages_delivered", { messageIds: msgIds, receiverId: userId });
      }
    }
  } catch (err) {
    console.error("Error updating online status/delivery:", err);
  }

  socket.on("disconnect", async () => {
    console.log(`Socket disconnected: ${userId}`);
    // Check if user has other active connections
    const sockets = await io.in(`user:${userId}`).fetchSockets();
    if (sockets.length === 0) {
      try {
        const lastSeen = new Date();
        await User.findByIdAndUpdate(userId, { 
          isOnline: false, 
          lastSeen: lastSeen 
        });
        io.emit("user_status", { userId, isOnline: false, lastSeen: lastSeen });
      } catch (err) {
        console.error("Error updating offline status:", err);
      }
    }
  });

  socket.on("typing", async (data: { receiverId: string }) => {
    try {
      const canonicalReceiverId = await resolveUserId(data.receiverId);
      socket.to(`user:${canonicalReceiverId}`).emit("user_typing", { senderId: userId });
    } catch (e) {
      console.error(e);
    }
  });

  socket.on("stop_typing", async (data: { receiverId: string }) => {
    try {
      const canonicalReceiverId = await resolveUserId(data.receiverId);
      socket.to(`user:${canonicalReceiverId}`).emit("user_stop_typing", { senderId: userId });
    } catch (e) {
      console.error(e);
    }
  });

  socket.on("mark_read", async (data: { messageIds: string[], senderId: string }) => {
    try {
      await MessageHistory.updateMany(
        { _id: { $in: data.messageIds }, receiverId: userId },
        { $set: { status: "read" } }
      );
      const canonicalSenderId = await resolveUserId(data.senderId);
      socket.to(`user:${canonicalSenderId}`).emit("messages_read", { messageIds: data.messageIds, readerId: userId });
    } catch (e) {
      console.error(e);
    }
  });

  socket.on("message_deleted", async (data: { messageId: string, receiverId: string }) => {
    try {
      const canonicalReceiverId = await resolveUserId(data.receiverId);
      socket.to(`user:${canonicalReceiverId}`).emit("message_deleted", { messageId: data.messageId });
    } catch (e) {
      console.error(e);
    }
  });

  // WebRTC Signaling
  socket.on("call_user", async (data: { userToCall: string, signalData: any, name: string, isVideo: boolean }) => {
    try {
      const canonicalReceiverId = await resolveUserId(data.userToCall);
      socket.to(`user:${canonicalReceiverId}`).emit("call_incoming", {
        signal: data.signalData,
        from: userId,
        name: data.name,
        isVideo: data.isVideo
      });
    } catch (e) { console.error(e); }
  });

  socket.on("answer_call", async (data: { to: string, signal: any }) => {
    try {
      const canonicalReceiverId = await resolveUserId(data.to);
      socket.to(`user:${canonicalReceiverId}`).emit("call_accepted", data.signal);
    } catch (e) { console.error(e); }
  });

  socket.on("end_call", async (data: { to: string }) => {
    try {
      const canonicalReceiverId = await resolveUserId(data.to);
      socket.to(`user:${canonicalReceiverId}`).emit("call_ended");
    } catch (e) { console.error(e); }
  });

  socket.on("reject_call", async (data: { to: string }) => {
    try {
      const canonicalReceiverId = await resolveUserId(data.to);
      socket.to(`user:${canonicalReceiverId}`).emit("call_rejected");
    } catch (e) { console.error(e); }
  });

  socket.on(
    "send_message",
    async (
      payload: { receiverId?: string; groupId?: string; content?: string; mediaUrl?: string },
      acknowledge: (response: { message?: ReturnType<typeof mapMessage>; error?: string }) => void,
    ) => {
      const receiverId = payload?.receiverId;
      const groupId = payload?.groupId;
      const content = payload?.content || "";
      const mediaUrl = payload?.mediaUrl || "";

      if ((!receiverId && !groupId) || (content.trim() === "" && mediaUrl.trim() === "")) {
        acknowledge({ error: "Receiver/Group ID and message content are required" });
        return;
      }

      try {
        if (groupId) {
          const group = await Group.findById(groupId);
          if (!group || !group.members.includes(userId)) {
            acknowledge({ error: "Group not found or you are not a member" });
            return;
          }

          const message = await MessageHistory.create({
            senderId: userId,
            groupId,
            content: content.trim(),
            mediaUrl: mediaUrl.trim(),
            timestamp: new Date(),
          });
          const mappedMessage = mapMessage(message);

          const memberRooms = group.members.map(memberId => `user:${memberId}`);
          io.to(memberRooms).emit("message_received", mappedMessage);
          acknowledge({ message: mappedMessage });

          // Send push notifications to offline group members
          const sender = await User.findById(userId).select("name mobile");
          const senderName = sender?.name || sender?.mobile || "Someone";
          group.members.forEach(memberId => {
            if (memberId !== userId) {
              sendPushNotificationToUser(memberId, {
                title: `${group.name}`,
                body: `${senderName}: ${content.trim() || 'Sent an attachment'}`,
                icon: "/icon-192.png",
                badge: "/icon-192.png",
                data: { url: `/?groupId=${groupId}` }
              });
            }
          });

        } else if (receiverId) {
          const canonicalReceiverId = await resolveUserId(receiverId);
          const message = await MessageHistory.create({
            senderId: userId,
            receiverId: canonicalReceiverId,
            content: content.trim(),
            mediaUrl: mediaUrl.trim(),
            timestamp: new Date(),
          });
          const mappedMessage = mapMessage(message);

          io.to([`user:${userId}`, `user:${canonicalReceiverId}`]).emit(
            "message_received",
            mappedMessage,
          );
          acknowledge({ message: mappedMessage });

          // Send push notification to direct receiver
          const sender = await User.findById(userId).select("name mobile");
          const senderName = sender?.name || sender?.mobile || "Someone";
          sendPushNotificationToUser(canonicalReceiverId, {
            title: senderName,
            body: content.trim() || 'Sent an attachment',
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            data: { url: `/?contactId=${canonicalReceiverId}` }
          });
        }
      } catch (error) {
        console.error("Socket message error:", error);
        acknowledge({ error: "Failed to send message" });
      }
    },
  );
});

app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/messages", messageHistoryRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/notifications", notificationRoutes);

export { server };
export default app;
