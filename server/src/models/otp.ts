import mongoose, { Document, Schema } from "mongoose";


const otpSchema = new Schema({
  phonenumber: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  otpExpiresAt: {
    type: Date,
    default: Date.now,
    get: (otpExpiresAt) => otpExpiresAt.getTime() + 5 * 60 * 1000, // 5 minutes in milliseconds
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Otp", otpSchema);
