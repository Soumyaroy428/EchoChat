import { Request, Response } from "express";
export declare const createContact: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getContacts: (req: Request, res: Response) => Promise<void>;
export declare const deleteContact: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateContact: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=contactController.d.ts.map