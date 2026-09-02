import "dotenv/config";
import { Server } from "socket.io";
declare const app: import("express-serve-static-core").Express;
declare const server: import("node:http").Server<typeof import("node:http").IncomingMessage, typeof import("node:http").ServerResponse>;
export declare const io: Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export { server };
export default app;
//# sourceMappingURL=app.d.ts.map