"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
exports.disconnectDB = disconnectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const MONGODB_URI = process.env.MONGODB_URI;
async function connectDB() {
    try {
        console.log("Attempting to connect to MongoDB...");
        console.log("MongoDB URI:", MONGODB_URI.replace(/:[^:@]+@/, ":****@"));
        await mongoose_1.default.connect(MONGODB_URI);
        console.log("✅ MongoDB connected successfully");
        console.log("Database name:", mongoose_1.default.connection.name);
    }
    catch (error) {
        console.error("❌ MongoDB connection error:", error);
        console.error("Please check your MongoDB connection string in .env file");
        process.exit(1);
    }
}
function disconnectDB() {
    mongoose_1.default.disconnect();
}
//# sourceMappingURL=database.js.map