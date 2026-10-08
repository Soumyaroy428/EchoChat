import mongoose, { Document, Schema } from "mongoose";

export interface IGroup extends Document {
  name: string;
  description?: string;
  avatar?: string;
  admins: string[];
  members: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    avatar: { type: String, default: "" },
    admins: [{ type: String, required: true }],
    members: [{ type: String, required: true }],
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IGroup>("Group", GroupSchema);

