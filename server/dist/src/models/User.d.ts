import mongoose, { Document } from "mongoose";
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
declare const _default: mongoose.Model<IUser, {}, {}, {}, Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
export default _default;
//# sourceMappingURL=User.d.ts.map