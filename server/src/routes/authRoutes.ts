import { Router } from "express";
import rateLimit from "express-rate-limit";
import { register, login, getProfile, getContacts, sendOtp, verifyOtp, uploadAvatar, removeAvatar, getAvatar, updateAbout, updateName } from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import { avatarUpload } from "../middleware/avatarUpload";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { error: "Too many requests from this IP, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/profile", authenticate, getProfile);
router.put("/profile/about", authenticate, updateAbout);
router.put("/profile/name", authenticate, updateName);
router.get("/contacts", authenticate, getContacts);
router.get("/avatar/:userId", getAvatar);
router.put("/profile/avatar", authenticate, avatarUpload.single("avatar"), uploadAvatar);
router.delete("/profile/avatar", authenticate, removeAvatar);
router.post("/sendOtp", authLimiter, sendOtp);
router.post("/verifyOtp", authLimiter, verifyOtp);

export default router;
