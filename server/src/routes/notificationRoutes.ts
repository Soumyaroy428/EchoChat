import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { subscribeToNotifications } from "../controllers/notificationController";

const router = Router();

router.post("/subscribe", authenticate, subscribeToNotifications);

export default router;
