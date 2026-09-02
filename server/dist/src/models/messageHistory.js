"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const messageHistorySchema = new mongoose_1.default.Schema({
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
exports.default = mongoose_1.default.model("MessageHistory", messageHistorySchema);
//# sourceMappingURL=messageHistory.js.map