"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = exports.getMessageHistory = void 0;
const messageHistory_1 = __importDefault(require("../models/messageHistory"));
const User_1 = __importDefault(require("../models/User"));
const newContact_1 = __importDefault(require("../models/newContact"));
const mapMessage = (message) => ({
    id: message._id?.toString() || message.id,
    senderId: message.senderId,
    receiverId: message.receiverId,
    content: message.content,
    timestamp: message.timestamp,
});
const resolveUserId = async (id) => {
    const user = await User_1.default.findById(id).select("_id mobile");
    if (user)
        return user._id.toString();
    const contact = await newContact_1.default.findById(id).select("mobile");
    if (!contact)
        return id;
    const contactUser = await User_1.default.findOne({ mobile: contact.mobile }).select("_id");
    return contactUser?._id.toString() || id;
};
const getConversationIds = async (id) => {
    const ids = new Set([id, await resolveUserId(id)]);
    const contact = await newContact_1.default.findById(id).select("mobile");
    if (contact) {
        const matchingContact = await newContact_1.default.findOne({ mobile: contact.mobile }).select("_id");
        if (matchingContact)
            ids.add(matchingContact._id.toString());
    }
    return [...ids];
};
const getMessageHistory = async (req, res) => {
    try {
        const currentUserId = req.userId;
        const contactId = Array.isArray(req.params.contactId)
            ? req.params.contactId[0]
            : req.params.contactId;
        if (!currentUserId || !contactId) {
            return res.status(400).json({ error: "User and contact IDs are required" });
        }
        const participantIds = await getConversationIds(contactId);
        const messages = await messageHistory_1.default.find({
            $or: [
                { senderId: currentUserId, receiverId: { $in: participantIds } },
                { senderId: { $in: participantIds }, receiverId: currentUserId },
            ],
        }).sort({ timestamp: 1 });
        res.json({ messages: messages.map(mapMessage) });
    }
    catch (error) {
        console.error("Get message history error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getMessageHistory = getMessageHistory;
const sendMessage = async (req, res) => {
    try {
        const currentUserId = req.userId;
        const { receiverId, content } = req.body;
        if (!currentUserId || !receiverId) {
            return res.status(400).json({ error: "User and receiver IDs are required" });
        }
        if (typeof content !== "string" || content.trim() === "") {
            return res.status(400).json({ error: "Message content is required" });
        }
        const canonicalReceiverId = await resolveUserId(receiverId);
        const message = await messageHistory_1.default.create({
            senderId: currentUserId,
            receiverId: canonicalReceiverId,
            content: content.trim(),
            timestamp: new Date(),
        });
        res.status(201).json({ message: mapMessage(message) });
    }
    catch (error) {
        console.error("Send message error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.sendMessage = sendMessage;
//# sourceMappingURL=messageHistoryController.js.map