import { Request, Response } from "express";
export declare const register: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getProfile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateAbout: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateName: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getContacts: (req: Request, res: Response) => Promise<void>;
export declare const uploadAvatar: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const removeAvatar: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAvatar: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const sendOtp: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const verifyOtp: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=authController.d.ts.map