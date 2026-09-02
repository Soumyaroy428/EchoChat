import mongoose, { Document, Schema } from "mongoose";
declare const _default: mongoose.Model<{
    phonenumber: string;
    otp: string;
    otpExpiresAt: NativeDate;
    createdAt: NativeDate;
}, {}, {}, {
    id: string;
}, Document<unknown, {}, {
    phonenumber: string;
    otp: string;
    otpExpiresAt: NativeDate;
    createdAt: NativeDate;
}, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<{
    phonenumber: string;
    otp: string;
    otpExpiresAt: NativeDate;
    createdAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    phonenumber: string;
    otp: string;
    otpExpiresAt: NativeDate;
    createdAt: NativeDate;
}, Document<unknown, {}, {
    phonenumber: string;
    otp: string;
    otpExpiresAt: NativeDate;
    createdAt: NativeDate;
}, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<{
    phonenumber: string;
    otp: string;
    otpExpiresAt: NativeDate;
    createdAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, unknown, {
    phonenumber: string;
    otp: string;
    otpExpiresAt: NativeDate;
    createdAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    phonenumber: string;
    otp: string;
    otpExpiresAt: NativeDate;
    createdAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export default _default;
//# sourceMappingURL=otp.d.ts.map