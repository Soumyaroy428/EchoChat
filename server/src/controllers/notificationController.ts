import { Request, Response } from "express";
import User from "../models/User";

export const subscribeToNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { subscription } = req.body;

    if (!subscription) {
      return res.status(400).json({ error: "Subscription object is required" });
    }

    // Add subscription to user if it doesn't already exist
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const existingIndex = user.pushSubscriptions.findIndex(
      (sub: any) => sub.endpoint === subscription.endpoint
    );

    if (existingIndex === -1) {
      user.pushSubscriptions.push(subscription);
      await user.save();
    }

    res.status(200).json({ message: "Subscribed successfully" });
  } catch (error) {
    console.error("Subscribe to notifications error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
