import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { createGroup, getUserGroups, updateGroup } from "../controllers/groupController";

const router = Router();

router.post("/", authenticate, createGroup);
router.get("/", authenticate, getUserGroups);
router.put("/:groupId", authenticate, updateGroup);

export default router;

