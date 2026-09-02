import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import contactRoutes from "./routes/contactRoutes";
import messageHistoryRoutes from "./routes/messageHistoryRoutes";
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
}) => ({
  id: message._id?.toString() || message.id,
  senderId: message.senderId,
  receiverId: message.receiverId,
  content: message.content,
  timestamp: message.timestamp,
});

export const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
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
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.get("/", (req, res) => {
  res.send("EchoChat API Running 🚀");
});

io.on("connection", (socket) => {
  const userId = socket.data.userId as string;
  socket.join(`user:${userId}`);
  console.log(`Socket connected: ${userId}`);

  socket.on(
    "send_message",
    async (
      payload: { receiverId?: string; content?: string },
      acknowledge: (response: { message?: ReturnType<typeof mapMessage>; error?: string }) => void,
    ) => {
      const receiverId = payload?.receiverId;
      const content = payload?.content;

      if (!receiverId || typeof content !== "string" || content.trim() === "") {
        acknowledge({ error: "Receiver ID and message content are required" });
        return;
      }

      try {
        const canonicalReceiverId = await resolveUserId(receiverId);
        const message = await MessageHistory.create({
          senderId: userId,
          receiverId: canonicalReceiverId,
          content: content.trim(),
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

export { server };
export default app;
