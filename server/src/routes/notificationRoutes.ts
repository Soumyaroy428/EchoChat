import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  subscribeToNotifications,
  unsubscribeFromNotifications,
} from "../controllers/notificationController";

const router = Router();

router.post("/subscribe", authenticate, subscribeToNotifications);
router.post("/unsubscribe", authenticate, unsubscribeFromNotifications);

export default router;
