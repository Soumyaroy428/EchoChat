import { Request, Response } from "express";
import User from "../models/User";

export const subscribeToNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: "Valid subscription object with endpoint is required" });
    }

    // Disassociate this endpoint from any other user to prevent cross-account push leaks
    await User.updateMany( 
      { _id: { $ne: userId } },
      { $pull: { pushSubscriptions: { endpoint: subscription.endpoint } } }
    );

    // Atomically add subscription to current user if not already present
    await User.findByIdAndUpdate(userId, {
      $addToSet: { pushSubscriptions: subscription },
    });

    res.status(200).json({ message: "Subscribed successfully" });
  } catch (error) {
    console.error("Subscribe to notifications error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const unsubscribeFromNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { endpoint } = req.body;

    if (endpoint) {
      await User.findByIdAndUpdate(userId, {
        $pull: { pushSubscriptions: { endpoint } },
      });
    }

    res.status(200).json({ message: "Unsubscribed successfully" });
  } catch (error) {
    console.error("Unsubscribe from notifications error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
