import webpush from "web-push";
import User from "../models/User";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "BDp1i3Pue1pbyOjxkIAcDwBBtqJKStYhdlKyDCM-PQii0lo0Q5n3ZkjoA09BvVPT8ZlnpSsd5tzwCtyCpJF7hcQ";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "uUTni7clXm86rxLZdPqi2Bs67yK1A8RUlN4dFmKVDzY";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:soumyaroy2022@gmail.com";

webpush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export const sendPushNotificationToUser = async (userId: string, payload: any) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.pushSubscriptions || user.pushSubscriptions.length === 0) {
      return;
    }

    const payloadString = JSON.stringify(payload);
    
    const invalidSubscriptions: any[] = [];
    
    const pushPromises = user.pushSubscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(sub, payloadString);
      } catch (error: any) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          // Subscription has expired or is no longer valid
          invalidSubscriptions.push(sub);
        } else {
          console.error("Error sending push notification:", error);
        }
      }
    });

    await Promise.all(pushPromises);

    // Clean up invalid subscriptions
    if (invalidSubscriptions.length > 0) {
      user.pushSubscriptions = user.pushSubscriptions.filter(
        sub => !invalidSubscriptions.includes(sub)
      );
      await user.save();
    }
  } catch (error) {
    console.error("Push notification logic error:", error);
  }
};

