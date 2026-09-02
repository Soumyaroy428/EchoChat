import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI;

export async function connectDB() {
  try {
    console.log("Attempting to connect to MongoDB...");
    console.log("MongoDB URI:", MONGODB_URI.replace(/:[^:@]+@/, ":****@"));
    
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected successfully");
    console.log("Database name:", mongoose.connection.name);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    console.error("Please check your MongoDB connection string in .env file");
    process.exit(1);
  }
}

export function disconnectDB() {
  mongoose.disconnect();
}
