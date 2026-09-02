import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  mobile: string;
  password: string;
  name?: string;
  avatar?: {
    url: string;
    filename: string;
    mimeType: string;
    size: number;
    data?: Buffer;
  };
  isOnline: boolean;
  lastSeen?: Date;
  about?: string;
  aboutVisibility?: "everyone" | "contacts" | "nobody";
  aboutExpiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      default: "",
    },
    avatar: {
      url: { type: String, default: "" },
      filename: { type: String, default: "" },
      mimeType: { type: String, default: "" },
      size: { type: Number, default: 0 },
      data: { type: Buffer, default: undefined },
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    about: {
      type: String,
      default: "",
      maxlength: 50,
    },
    aboutVisibility: {
      type: String,
      enum: ["everyone", "contacts", "nobody"],
      default: "everyone",
    },
    aboutExpiresAt: {
      type: Date,
      default: null,
    },
  },
  
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>("User", UserSchema);
