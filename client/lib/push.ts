export async function subscribeToPushNotifications(
  userInitiated = false,
  currentUserId?: string
) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return;
  }

  try {
    // If permission is "default", prompt only if explicitly triggered by a user action
    if (Notification.permission === "default") {
      if (!userInitiated) {
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        return;
      }
    } else if (Notification.permission !== "granted") {
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    // Check account change: if a different account is active, unsubscribe previous browser subscription
    const lastSubscribedUser = localStorage.getItem("push_subscribed_user_id");
    if (
      currentUserId &&
      lastSubscribedUser &&
      lastSubscribedUser !== currentUserId &&
      subscription
    ) {
      try {
        await subscription.unsubscribe();
        subscription = null;
      } catch (err) {
        console.warn("Failed to unsubscribe previous account subscription:", err);
      }
    }

    if (!subscription) {
      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicVapidKey) return;

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/notifications/subscribe`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subscription }),
      }
    );

    if (currentUserId) {
      localStorage.setItem("push_subscribed_user_id", currentUserId);
    }
  } catch (error) {
    console.error("Failed to subscribe to push notifications:", error);
  }
}

export async function unsubscribeFromPushNotifications() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/notifications/unsubscribe`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ endpoint: subscription.endpoint }),
          }
        ).catch(() => {});
      }

      await subscription.unsubscribe().catch(() => {});
    }

    localStorage.removeItem("push_subscribed_user_id");
  } catch (error) {
    console.error("Failed to unsubscribe from push notifications:", error);
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
