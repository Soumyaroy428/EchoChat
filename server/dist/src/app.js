"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.io = void 0;
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const contactRoutes_1 = __importDefault(require("./routes/contactRoutes"));
const messageHistoryRoutes_1 = __importDefault(require("./routes/messageHistoryRoutes"));
const body_parser_1 = __importDefault(require("body-parser"));
const node_http_1 = require("node:http");
const socket_io_1 = require("socket.io");
const node_path_1 = __importDefault(require("node:path"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const messageHistory_1 = __importDefault(require("./models/messageHistory"));
const User_1 = __importDefault(require("./models/User"));
const newContact_1 = __importDefault(require("./models/newContact"));
const app = (0, express_1.default)();
const server = (0, node_http_1.createServer)(app);
exports.server = server;
const mapMessage = (message) => ({
    id: message._id?.toString() || message.id,
    senderId: message.senderId,
    receiverId: message.receiverId,
    content: message.content,
    timestamp: message.timestamp,
});
exports.io = new socket_io_1.Server(server, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:3001"],
        credentials: true,
    },
});
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const resolveUserId = async (id) => {
    const user = await User_1.default.findById(id).select("_id");
    if (user)
        return user._id.toString();
    const contact = await newContact_1.default.findById(id).select("mobile");
    if (!contact)
        return id;
    const contactUser = await User_1.default.findOne({ mobile: contact.mobile }).select("_id");
    return contactUser?._id.toString() || id;
};
exports.io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (typeof token !== "string" || token.length === 0) {
        next(new Error("Authentication required"));
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (!decoded.userId) {
            next(new Error("Invalid token"));
            return;
        }
        socket.data.userId = decoded.userId;
        next();
    }
    catch {
        next(new Error("Invalid token"));
    }
});
//body-purser to parse incoming HTTP request bodies
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));
app.use(express_1.default.json());
app.use("/uploads", express_1.default.static(node_path_1.default.resolve(process.cwd(), "uploads")));
app.get("/", (req, res) => {
    res.send("EchoChat API Running 🚀");
});
exports.io.on("connection", (socket) => {
    const userId = socket.data.userId;
    socket.join(`user:${userId}`);
    console.log(`Socket connected: ${userId}`);
    socket.on("send_message", async (payload, acknowledge) => {
        const receiverId = payload?.receiverId;
        const content = payload?.content;
        if (!receiverId || typeof content !== "string" || content.trim() === "") {
            acknowledge({ error: "Receiver ID and message content are required" });
            return;
        }
        try {
            const canonicalReceiverId = await resolveUserId(receiverId);
            const message = await messageHistory_1.default.create({
                senderId: userId,
                receiverId: canonicalReceiverId,
                content: content.trim(),
                timestamp: new Date(),
            });
            const mappedMessage = mapMessage(message);
            exports.io.to([`user:${userId}`, `user:${canonicalReceiverId}`]).emit("message_received", mappedMessage);
            acknowledge({ message: mappedMessage });
        }
        catch (error) {
            console.error("Socket message error:", error);
            acknowledge({ error: "Failed to send message" });
        }
    });
});
app.use("/api/auth", authRoutes_1.default);
app.use("/api/contacts", contactRoutes_1.default);
app.use("/api/messages", messageHistoryRoutes_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map