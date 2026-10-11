import mongoose, { Document, Schema } from "mongoose";

export interface IStatusViewer {
  user: mongoose.Types.ObjectId;
  viewedAt: Date;
}

export interface IStatus extends Document {
  user: mongoose.Types.ObjectId;
  mediaUrl?: string;
  mediaType: "text" | "image" | "video";
  text?: string;
  backgroundColor?: string;
  font?: string;
  viewers: IStatusViewer[];
  createdAt: Date;
  expiresAt: Date;
}

const statusViewerSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const statusSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    mediaUrl: {
      type: String,
      default: "",
    },
    mediaType: {
      type: String,
      enum: ["text", "image", "video"],
      default: "text",
    },
    text: {
      type: String,
      default: "",
      maxlength: 500,
    },
    backgroundColor: {
      type: String,
      default: "#0d6b50",
    },
    font: {
      type: String,
      default: "sans-serif",
    },
    viewers: [statusViewerSchema],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index: auto delete when expiresAt is reached
    },
  },
  { timestamps: true }
);

export default mongoose.model<IStatus>("Status", statusSchema);
