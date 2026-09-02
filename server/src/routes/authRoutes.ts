import { Router } from "express";
import { register, login, getProfile, getContacts, sendOtp, verifyOtp, uploadAvatar, removeAvatar, getAvatar, updateAbout, updateName } from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import { avatarUpload } from "../middleware/avatarUpload";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authenticate, getProfile);
router.put("/profile/about", authenticate, updateAbout);
router.put("/profile/name", authenticate, updateName);
router.get("/contacts", authenticate, getContacts);
router.get("/avatar/:userId", getAvatar);
router.put("/profile/avatar", authenticate, avatarUpload.single("avatar"), uploadAvatar);
router.delete("/profile/avatar", authenticate, removeAvatar);
router.post("/sendOtp", sendOtp);
router.post("/verifyOtp", verifyOtp);

export default router;
