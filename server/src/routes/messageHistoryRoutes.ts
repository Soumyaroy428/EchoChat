import { Router } from "express";
import { getMessageHistory, sendMessage } from "../controllers/messageHistoryController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/:contactId", authenticate, getMessageHistory);
router.post("/", authenticate, sendMessage);

export default router;