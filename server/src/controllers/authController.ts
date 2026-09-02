import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";
import otpModel from "../models/otp";
import otpGenerator from "otp-generator";
import twilio, { RestException } from "twilio";
import { spec } from "node:test/reporters";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const avatarUrl = (avatar?: { url?: string }) => avatar?.url || "";

const profilePayload = (user: any) => ({
  id: user._id,
  mobile: user.mobile,
  name: user.name,
  avatar: avatarUrl(user.avatar),
  isOnline: user.isOnline,
  lastSeen: user.lastSeen,
  about: user.about || "",
  aboutVisibility: user.aboutVisibility || "everyone",
  aboutExpiresAt: user.aboutExpiresAt || null,
});

export const register = async (req: Request, res: Response) => {
  try {
    console.log("📝 Registration attempt:", { mobile: req.body.mobile });
    const { mobile, password, name } = req.body;

    if (!mobile || !password) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ error: "Mobile number and password are required" });
    }

    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      console.log("❌ User already exists:", mobile);
      return res.status(400).json({ error: "User already exists with this mobile number" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("✅ Password hashed successfully");

    const user = new User({
      mobile,
      password: hashedPassword,
      name: name || "",
    });

    await user.save();
    console.log("✅ User saved to database:", user._id);

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
    console.log("✅ JWT token generated");

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
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
    console.log("🔐 Login attempt:", { mobile: req.body.mobile });
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ error: "Mobile number and password are required" });
    }

    const user = await User.findOne({ mobile });
    if (!user) {
      console.log("❌ User not found:", mobile);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("❌ Invalid password for:", mobile);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();
    console.log("✅ User updated as online:", user._id);

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
    console.log("✅ JWT token generated");

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
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
    const users = await User.find({ _id: { $ne: userId } }).select("name mobile avatar isOnline lastSeen");

    res.json({
      contacts: users.map((contact) => ({
        id: contact._id,
        name: contact.name || contact.mobile,
        mobile: contact.mobile,
        avatar: avatarUrl(contact.avatar),
        isOnline: contact.isOnline,
        lastSeen: contact.lastSeen,
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

    const url = `${req.protocol}://${req.get("host")}/api/auth/avatar/${user._id}?v=${Date.now()}`;
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
    const { phonenumber } = req.body;

    if (!phonenumber || typeof phonenumber !== "string") {
      return res.status(400).json({ error: "Mobile number is required" });
    }

    function toE164(number, defaultCountry = "+91") {
      if (!number) throw new Error("No phone number provided");
      const digits = String(number).replace(/\D/g, "");
      if (String(number).trim().startsWith("+")) {
        return number.replace(/\s+/g, "");
      }
      // handle common local 10-digit Indian numbers
      if (digits.length === 10) {
        return `${defaultCountry}${digits}`;
      }
      // fallback: prepend + if not present
      return `+${digits}`;
    }

    // Generate a random 6-digit OTP
    const otp = otpGenerator.generate(6, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false,specialChars: false });

    // Here you would typically send the OTP via SMS using a service like Twilio
    console.log(`Sending OTP ${otp} to mobile number ${phonenumber}`);

    const currentTime = new Date();

    await otpModel.findOneAndUpdate(
      { phonenumber: phonenumber },
      { otp, createdAt: new Date(currentTime.getTime()) },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );


    try {
      const to = toE164(phonenumber, '+91'); // use +91 as default
      const from = process.env.TWILIO_PHONE_NUMBER;
      if (!from || !from.startsWith('+')) {
        console.warn('TWILIO_PHONE_NUMBER should be in E.164 format, e.g. +1234567890');
      }
      const message = await twilioClient.messages
        .create({
          body:
            `Hello from EchoChat! Your OTP is: ${otp}. It is valid for 5 minutes. Do not share this OTP with anyone.`,
          to: phonenumber,
          from: process.env.TWILIO_PHONE_NUMBER,
        })
        .then((message) => console.log(message.sid));
      console.log(message);
    } catch (error) {
      if (error instanceof RestException) {
        console.log(`Twilio Error ${error.code}: ${error.message}`);
        console.log(`Status: ${error.status}`);
        console.log(`More info: ${error.moreInfo}`);
      } else {
        console.error("Other error:", error);
      }
    }

    // For demonstration purposes, we'll just return the OTP in the response
    res.json({
      message: "OTP sent successfully",
      otp, // In a real application, you would not send the OTP back in the response
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { phonenumber, otp } = req.body;

    if (!phonenumber || !otp) {
      return res.status(400).json({ error: 'Phone number and OTP are required' });
    }

    const record = await otpModel.findOne({ phonenumber });
    if (!record) {
      return res.status(400).json({ error: 'OTP not found or expired' });
    }

    // Check expiry: treat createdAt + 5 minutes as expiry
    const createdAt = record.createdAt ? new Date(record.createdAt) : null;
    if (!createdAt) {
      return res.status(400).json({ error: 'Invalid OTP record' });
    }

    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    const fiveMinutesMs = 5 * 60 * 1000;
    if (diffMs > fiveMinutesMs) {
      // remove expired OTP
      await otpModel.deleteOne({ phonenumber });
      return res.status(400).json({ error: 'OTP expired' });
    }

    if (record.otp !== String(otp)) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // OTP is valid - delete it
    await otpModel.deleteOne({ phonenumber });

    // Find the user and sign a token
    const user = await User.findOne({ mobile: phonenumber });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'OTP verified',
      token,
      user: {
        id: user._id,
        mobile: user.mobile,
        name: user.name,
        avatar: avatarUrl(user.avatar),
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
