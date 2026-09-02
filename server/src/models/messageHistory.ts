import mongoose from "mongoose";

const messageHistorySchema = new mongoose.Schema({
  senderId: {
    type: String,
    required: true,
  },
  receiverId: {
    type: String,
    required: true,
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
});

export default mongoose.model("MessageHistory", messageHistorySchema);
