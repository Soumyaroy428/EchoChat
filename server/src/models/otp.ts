import mongoose, { Document, Schema } from "mongoose";

const otpSchema = new Schema({
  phonenumber: {
    type: String,
    default: "",
    index: true,
  },
  email: {
    type: String,
    default: "",
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  otpExpiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 5 * 60 * 1000),
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Otp", otpSchema);
