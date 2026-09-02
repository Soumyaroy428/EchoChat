"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const newContactSchema = new mongoose_1.default.Schema({
    avatar: {
        type: String,
        default: "",
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        default: "",
    },
    username: {
        type: String,
        required: true,
    },
    mobile: {
        type: String,
        required: true,
    },
    active: {
        type: Boolean,
        default: true,
    },
});
exports.default = mongoose_1.default.model("NewContact", newContactSchema);
//# sourceMappingURL=newContact.js.map