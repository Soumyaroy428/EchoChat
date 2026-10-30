import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";
import otpModel from "../models/otp";
import otpGenerator from "otp-generator";
import { sendOtpEmail } from "../services/emailService";
import mongoose from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const avatarUrl = (avatar?: { url?: string }) => {
  if (!avatar?.url) return "";
  let url = avatar.url;
  if (url.startsWith("http://") && !url.includes("localhost") && !url.includes("127.0.0.1")) {
    url = url.replace("http://", "https://");
  }
  return url;
};

const profilePayload = (user: any) => ({
  id: user._id,
  mobile: user.mobile,
  email: user.email || "",
  name: user.name,
  avatar: avatarUrl(user.avatar),
  isOnline: user.isOnline,
  lastSeen: user.lastSeen,
  about: user.about || "",
  aboutVisibility: user.aboutVisibility || "everyone",
  aboutExpiresAt: user.aboutExpiresAt || null,
  publicKey: user.publicKey || "",
});

export const register = async (req: Request, res: Response) => {
  try {
    const { password, name } = req.body;
    const email = (req.body.email || "").trim().toLowerCase();
    const rawMobile = (req.body.mobile || "").trim();

    console.log("📝 Registration attempt:", { email, mobile: rawMobile });

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Check if user already exists with this email address
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "An account already exists with this email address" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      mobile: rawMobile,
      password: hashedPassword,
      name: name ? name.trim() : "",
      isOnline: false,
      lastSeen: new Date(),
    });

    await user.save();
    console.log("✅ User registered:", user._id, user.email);

    res.status(201).json({
      message: "Account registered successfully",
      email: user.email,
      requiresOtp: true,
      user: {
        id: user._id,
        email: user.email,
        mobile: user.mobile,
        name: user.name,
        avatar: avatarUrl(user.avatar),
      },
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    const email = (req.body.email || req.body.identifier || req.body.mobile || "").trim().toLowerCase();

    console.log("🔐 Login attempt for email:", email);

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({
      $or: [
        { email },
        { mobile: email },
      ],
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Ensure email is set if it was missing
    if (!user.email && email.includes("@")) {
      user.email = email;
      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      message: "Credentials verified",
      token,
      email: user.email,
      requiresOtp: true,
      user: {
        id: user._id,
        email: user.email,
        mobile: user.mobile,
        name: user.name,
        avatar: avatarUrl(user.avatar),
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: profilePayload(user),
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateAbout = async (req: Request, res: Response) => {
  try {
    const { about, visibility, expiresAt } = req.body;
    if (typeof about !== "string" || about.trim().length > 50) {
      return res.status(400).json({ error: "About must be 50 characters or fewer" });
    }
    if (!["everyone", "contacts", "nobody"].includes(visibility)) {
      return res.status(400).json({ error: "Invalid visibility setting" });
    }

    let expiry: Date | null = null;
    if (expiresAt) {
      expiry = new Date(expiresAt);
      if (Number.isNaN(expiry.getTime())) return res.status(400).json({ error: "Invalid expiry date" });
    }

    const user = await User.findByIdAndUpdate(
      (req as any).userId,
      { about: about.trim(), aboutVisibility: visibility, aboutExpiresAt: expiry },
      { new: true, runValidators: true },
    ).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ message: "About updated", user: profilePayload(user) });
  } catch (error) {
    console.error("Update about error:", error);
    return res.status(500).json({ error: "Unable to update about" });
  }
};

export const updateName = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (typeof name !== "string" || !name.trim() || name.trim().length > 25) {
      return res.status(400).json({ error: "Name must be between 1 and 25 characters" });
    }
    const user = await User.findByIdAndUpdate(
      (req as any).userId,
      { name: name.trim() },
      { new: true, runValidators: true },
    ).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ message: "Name updated", user: profilePayload(user) });
  } catch (error) {
    console.error("Update name error:", error);
    return res.status(500).json({ error: "Unable to update name" });
  }
};

export const getContacts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const users = await User.find({ _id: { $ne: userId } }).select("name mobile avatar isOnline lastSeen publicKey");

    res.json({
      contacts: users.map((contact) => ({
        id: contact._id,
        name: contact.name || contact.mobile,
        mobile: contact.mobile,
        avatar: avatarUrl(contact.avatar),
        isOnline: contact.isOnline,
        lastSeen: contact.lastSeen,
        publicKey: contact.publicKey || "",
      })),
    });
  } catch (error) {
    console.error("Get contacts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const uploadAvatar = async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: "Please select an image file" });

  try {
    const user = await User.findById((req as any).userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const forwardedProto = req.get("x-forwarded-proto");
    const protocol = forwardedProto
      ? forwardedProto.split(",")[0].trim()
      : (req.protocol === "http" && process.env.NODE_ENV === "production" ? "https" : req.protocol);
    const host = req.get("host");
    const url = `${protocol}://${host}/api/auth/avatar/${user._id}?v=${Date.now()}`;
    user.avatar = {
      url,
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      data: file.buffer,
    };
    await user.save();

    return res.json({ message: "Profile photo updated", avatar: avatarUrl(user.avatar) });
  } catch (error) {
    console.error("Upload avatar error:", error);
    return res.status(500).json({ error: "Unable to upload profile photo" });
  }
};

export const removeAvatar = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.avatar = {
      url: "",
      filename: "",
      mimeType: "",
      size: 0,
      data: undefined,
    };
    await user.save();

    return res.json({ message: "Profile photo removed", avatar: "" });
  } catch (error) {
    console.error("Remove avatar error:", error);
    return res.status(500).json({ error: "Unable to remove profile photo" });
  }
};

export const getAvatar = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId).select("avatar");
    const avatar = user?.avatar;
    if (!avatar?.data || !avatar.mimeType) return res.status(404).end();

    res.setHeader("Content-Type", avatar.mimeType);
    res.setHeader("Content-Length", avatar.data.length);
    res.setHeader("Cache-Control", "no-store");
    return res.send(avatar.data);
  } catch {
    return res.status(404).end();
  }
};

export const sendOtp = async (req: Request, res: Response) => {
  try {
    const rawEmail = (req.body.email || "").trim().toLowerCase();
    const rawNumber = (req.body.phonenumber || req.body.mobile || "").trim();

    let targetEmail = rawEmail || (rawNumber.includes("@") ? rawNumber.toLowerCase() : "");

    // If only a phone number or userId was given, check if user has an email in DB
    if (!targetEmail && rawNumber) {
      const user = await User.findOne({
        $or: [
          { mobile: rawNumber },
          { _id: mongoose.isValidObjectId(rawNumber) ? rawNumber : null },
        ],
      });
      if (user?.email) {
        targetEmail = user.email.toLowerCase();
      } else if (user?.mobile && user.mobile.includes("@")) {
        targetEmail = user.mobile.toLowerCase();
      }
    }

    if (!targetEmail) {
      return res.status(400).json({ error: "A valid email address is required to receive the OTP" });
    }

    const clientSmtpEmail =
      (req.headers["x-smtp-email"] as string) ||
      (req.body.smtpEmail as string) ||
      "";

    const clientSmtpPassword =
      (req.headers["x-smtp-password"] as string) ||
      (req.body.smtpPassword as string) ||
      "";

    // Generate a random 6-digit OTP
    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    console.log(`[sendOtp] Generating Email OTP for ${targetEmail}`);

    const currentTime = new Date();

    await otpModel.findOneAndUpdate(
      {
        $or: [
          { email: targetEmail },
          { phonenumber: targetEmail },
          { phonenumber: rawNumber || targetEmail },
        ],
      },
      {
        email: targetEmail,
        phonenumber: rawNumber || targetEmail,
        otp,
        createdAt: currentTime,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    // If request comes from Vercel Serverless dispatcher (where Port 465 is open):
    const isVercelDispatch =
      req.headers["x-vercel-dispatch"] === "true" ||
      Boolean(req.headers["x-dispatch-secret"]);
    if (isVercelDispatch) {
      return res.json({
        message: "OTP generated successfully",
        email: targetEmail,
        otp,
      });
    }

    // Send email via Gmail SMTP
    const emailResult = await sendOtpEmail(targetEmail, otp, {
      smtpEmail: clientSmtpEmail,
      smtpPassword: clientSmtpPassword,
    });

    if (!emailResult.success) {
      console.error(`[sendOtp] Delivery failed for ${targetEmail}:`, emailResult.error);
      return res.status(400).json({
        error: emailResult.error || "Failed to deliver verification code",
        email: targetEmail,
      });
    }

    res.json({
      message: "OTP sent successfully to your email",
      email: targetEmail,
      provider: emailResult.provider,
      id: emailResult.id,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const rawInput = (req.body.email || req.body.phonenumber || req.body.mobile || "").trim();
    const otp = (req.body.otp || "").toString().trim();

    if (!rawInput || !otp) {
      return res.status(400).json({ error: "Email/Phone number and OTP are required" });
    }

    const email = rawInput.toLowerCase();

    const record = await otpModel.findOne({
      $or: [
        { email },
        { phonenumber: rawInput },
        { phonenumber: email },
      ],
    });

    if (!record) {
      return res.status(400).json({ error: "OTP not found or expired" });
    }

    // Check expiry: 5 minutes
    const createdAt = record.createdAt ? new Date(record.createdAt) : null;
    if (!createdAt) {
      return res.status(400).json({ error: "Invalid OTP record" });
    }

    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    const fiveMinutesMs = 5 * 60 * 1000;
    if (diffMs > fiveMinutesMs) {
      await otpModel.deleteOne({ _id: record._id });
      return res.status(400).json({ error: "OTP expired. Please request a new one." });
    }

    if (record.otp !== String(otp)) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // OTP is valid - delete it
    await otpModel.deleteOne({ _id: record._id });

    // Find user by email or mobile
    const user = await User.findOne({
      $or: [
        { email },
        { mobile: rawInput },
        { mobile: email },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      message: "OTP verified",
      token,
      user: profilePayload(user),
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updatePublicKey = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { publicKey } = req.body;
    if (typeof publicKey !== "string" || !publicKey.trim()) {
      return res.status(400).json({ error: "Valid public key is required" });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { publicKey: publicKey.trim() },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ message: "Public key updated successfully", publicKey: user.publicKey });
  } catch (error) {
    console.error("Update public key error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getPublicKeyByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("publicKey");
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ publicKey: user.publicKey || "" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
