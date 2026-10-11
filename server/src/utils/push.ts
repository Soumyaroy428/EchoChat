import webpush from "web-push";
import User from "../models/User";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT;

const isVapidConfigured = Boolean(
  VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY && VAPID_SUBJECT
);

if (isVapidConfigured) {
  webpush.setVapidDetails(
    VAPID_SUBJECT!,
    VAPID_PUBLIC_KEY!,
    VAPID_PRIVATE_KEY!
  );
} else {
  console.warn("VAPID keys not configured in environment. Web push notifications disabled.");
}

export const sendPushNotificationToUser = async (userId: string, payload: any) => {
  if (!isVapidConfigured) {
    return;
  }

  try {
    const user = await User.findById(userId).select("pushSubscriptions");
    if (!user || !user.pushSubscriptions || user.pushSubscriptions.length === 0) {
      return;
    }

    const payloadString = JSON.stringify(payload);
    const invalidEndpoints: string[] = [];

    const pushPromises = user.pushSubscriptions.map(async (sub: any) => {
      try {
        await webpush.sendNotification(sub, payloadString, { timeout: 10000 });
      } catch (error: any) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          // Subscription has expired or is no longer valid
          if (sub.endpoint) {
            invalidEndpoints.push(sub.endpoint);
          }
        } else {
          console.error("Error sending push notification:", error.message || error);
        }
      }
    });

    await Promise.all(pushPromises);

    // Targeted atomic database cleanup preserving concurrently added subscriptions
    if (invalidEndpoints.length > 0) {
      await User.findByIdAndUpdate(userId, {
        $pull: {
          pushSubscriptions: { endpoint: { $in: invalidEndpoints } },
        },
      });
    }
  } catch (error) {
    console.error("Push notification logic error:", error);
  }
};
