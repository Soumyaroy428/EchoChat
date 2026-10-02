import { Router } from "express";
import multer from "multer";
import path from "path";
import { authenticate } from "../middleware/auth";
import { uploadMedia } from "../controllers/mediaController";

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "uploads", "chat_media"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post("/upload", authenticate, upload.single("media"), uploadMedia);

export default router;
