import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authenticate } from "../middleware/auth";
import {
  createStatus,
  getStatuses,
  viewStatus,
  deleteStatus,
} from "../controllers/statusController";

const router = Router();

// Ensure status upload dir exists
const statusUploadDir = path.join(process.cwd(), "uploads", "status");
if (!fs.existsSync(statusUploadDir)) {
  fs.mkdirSync(statusUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(statusUploadDir)) {
      fs.mkdirSync(statusUploadDir, { recursive: true });
    }
    cb(null, statusUploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "status-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB limit for images/videos
});

router.post("/", authenticate, upload.single("media"), createStatus);
router.get("/", authenticate, getStatuses);
router.post("/:statusId/view", authenticate, viewStatus);
router.delete("/:statusId", authenticate, deleteStatus);

export default router;

