import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import contactRoutes from "./routes/contactRoutes";
import messageHistoryRoutes from "./routes/messageHistoryRoutes";
import mediaRoutes from "./routes/mediaRoutes";
import bodyParser from "body-parser";
import { createServer } from "node:http";
import { Server } from "socket.io";
import path from "node:path";
import jwt from "jsonwebtoken";
import MessageHistory from "./models/messageHistory";
import User from "./models/User";
import NewContact from "./models/newContact";

const app = express();
const server = createServer(app);
const mapMessage = (message: {
  _id?: { toString(): string };
  id?: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  status?: string;
  mediaUrl?: string;
}) => ({
  id: message._id?.toString() || message.id,
  senderId: message.senderId,
  receiverId: message.receiverId,
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
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.get("/", (req, res) => {
  res.send("EchoChat API Running 🚀");
});

io.on("connection", async (socket) => {
  const userId = socket.data.userId as string;
  socket.join(`user:${userId}`);
  console.log(`Socket connected: ${userId}`);

  // Set user as online and mark delivered
  try {
    await User.findByIdAndUpdate(userId, { isOnline: true });
    
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
        await User.findByIdAndUpdate(userId, { 
          isOnline: false, 
          lastSeen: new Date() 
        });
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

  socket.on(
    "send_message",
    async (
      payload: { receiverId?: string; content?: string; mediaUrl?: string },
      acknowledge: (response: { message?: ReturnType<typeof mapMessage>; error?: string }) => void,
    ) => {
      const receiverId = payload?.receiverId;
      const content = payload?.content || "";
      const mediaUrl = payload?.mediaUrl || "";

      if (!receiverId || (content.trim() === "" && mediaUrl.trim() === "")) {
        acknowledge({ error: "Receiver ID and message content are required" });
        return;
      }

      try {
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
      } catch (error) {
        console.error("Socket message error:", error);
        acknowledge({ error: "Failed to send message" });
      }
    },
  );
});

app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/messages", messageHistoryRoutes);
app.use("/api/media", mediaRoutes);

export { server };
export default app;
