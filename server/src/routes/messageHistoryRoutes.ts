import { Router } from "express";
import { getMessageHistory, sendMessage, deleteMessage } from "../controllers/messageHistoryController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/:contactId", authenticate, getMessageHistory);
router.post("/", authenticate, sendMessage);
router.delete("/:messageId", authenticate, deleteMessage);

export default router;