import { fetchWithAuth } from "./api";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat(
    (4 - (base64String.length % 4)) % 4
  );

  const base64 = (
    base64String + padding
  )
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from(
    [...rawData].map((char) => char.charCodeAt(0))
  );
}

export async function enablePushNotifications() {
  if (
    !("serviceWorker" in navigator) ||
    !("PushManager" in window) ||
    !("Notification" in window)
  ) {
    throw new Error("Push notifications are not supported");
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("Notification permission was not granted");
  }

  const registration =
    await navigator.serviceWorker.register(
      process.env.PUBLIC_URL + "/service-worker.js"
    );
  await navigator.serviceWorker.ready;

  const keyRes = await fetchWithAuth(
    "/api/messaging/push/public-key/"
  );

  if (!keyRes.ok) {
    throw new Error("Failed to get VAPID public key");
  }

  const data = await keyRes.json();

  if (!data.publicKey) {
    throw new Error("VAPID public key is missing");
  }

  let subscription =
    await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription =
      await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey:
          urlBase64ToUint8Array(data.publicKey),
      });
  }

  const subscribeRes = await fetchWithAuth(
    "/api/messaging/push/subscribe/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        subscription.toJSON()
      ),
    }
  );

  if (!subscribeRes.ok) {
    throw new Error("Failed to save push subscription");
  }

  return true;
}

export async function disablePushNotifications() {
  if (!("serviceWorker" in navigator)) {
    return false;
  }
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    return false;
  }
  const response = await fetchWithAuth(
    "/api/messaging/push/subscribe/",
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        subscription.toJSON()
      ),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to disable notifications on server");
  }
  await subscription.unsubscribe();

  return true;
}
export async function arePushNotificationsEnabled() {
  if (
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  ) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    return !!subscription;
  } catch (error) {
    return false;
  }
}