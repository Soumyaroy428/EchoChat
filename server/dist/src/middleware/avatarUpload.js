"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.avatarUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
exports.avatarUpload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, callback) => {
        if (allowedMimeTypes.has(file.mimetype))
            callback(null, true);
        else
            callback(new Error("Only JPG, PNG, and WEBP images are allowed"));
    },
});
//# sourceMappingURL=avatarUpload.js.map