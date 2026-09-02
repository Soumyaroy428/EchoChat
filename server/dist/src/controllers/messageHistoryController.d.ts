import { Response } from "express";
import type { AuthRequest } from "../middleware/auth";
export declare const getMessageHistory: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const sendMessage: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=messageHistoryController.d.ts.map