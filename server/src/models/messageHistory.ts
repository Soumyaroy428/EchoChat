import mongoose from "mongoose";

const messageHistorySchema = new mongoose.Schema({
  senderId: {
    type: String,
    required: true,
  },
  receiverId: {
    type: String,
    required: false,
  },
  groupId: {
    type: String,
    required: false,
  },
  content: {
    type: String,
    required: true,
    maxlength: 1500,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "sent",
  },
  mediaUrl: {
    type: String,
    default: "",
  },
});

export default mongoose.model("MessageHistory", messageHistorySchema);
