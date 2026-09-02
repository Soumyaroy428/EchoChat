import mongoose from "mongoose";
declare const _default: mongoose.Model<{
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: NativeDate;
}, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: NativeDate;
}, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<{
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: NativeDate;
}, mongoose.Document<unknown, {}, {
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: NativeDate;
}, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<{
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, unknown, {
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export default _default;
//# sourceMappingURL=messageHistory.d.ts.map