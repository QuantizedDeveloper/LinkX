import { showToast } from "../utils/toast";
import { fetchWithAuth } from "./api";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat(
    (4 - (base64String.length % 4)) % 4
  );

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from(
    [...rawData].map((char) => char.charCodeAt(0))
  );
}

async function getErrorMessage(response) {
  const text = await response.text();

  if (!text) return `HTTP ${response.status}`;

  try {
    const data = JSON.parse(text);
    return (
      data.detail ||
      data.error ||
      data.message ||
      JSON.stringify(data)
    );
  } catch {
    return text.slice(0, 300);
  }
}

export async function enablePushNotifications() {
  try {
    if (
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      showToast("Push notifications are not supported by this browser.");
      return false;
    }

    if (!window.isSecureContext) {
      showToast("Push notifications require HTTPS.");
      return false;
    }

    if (Notification.permission === "denied") {
      showToast(
        "Notifications are blocked. Enable them in your browser settings."
      );
      return false;
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      alert("Notification permission was not granted.");
      return false;
    }

    let registration;

    try {
      registration = await navigator.serviceWorker.register(
        `${process.env.PUBLIC_URL || ""}/service-worker.js`
      );

      await navigator.serviceWorker.ready;
    } catch (error) {
      showToast(`Service worker registration failed: ${error.message}`);
      return false;
    }

    let keyRes;

    try {
      keyRes = await fetchWithAuth(
        "/api/messaging/push/public-key/"
      );
    } catch (error) {
      alert(`Could not reach push public-key API: ${error.message}`);
      return false;
    }

    if (!keyRes.ok) {
      showToast(
        `Push public-key API failed (${keyRes.status}): ${
          await getErrorMessage(keyRes)
        }`
      );
      return false;
    }

    const data = await keyRes.json();

    if (
      typeof data.publicKey !== "string" ||
      !data.publicKey.trim()
    ) {
      showToast("VAPID public key is missing or invalid.");
      return false;
    }

    const applicationServerKey =
      urlBase64ToUint8Array(data.publicKey.trim());

    let subscription =
      await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription =
        await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
    }

    let subscribeRes;

    try {
      subscribeRes = await fetchWithAuth(
        "/api/messaging/push/subscribe/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(subscription.toJSON()),
        }
      );
    } catch (error) {
      showToast(`Could not reach push subscription API: ${error.message}`);
      return false;
    }

    if (!subscribeRes.ok) {
      showToast(
        `Push subscription API failed (${subscribeRes.status}): ${
          await getErrorMessage(subscribeRes)
        }`
      );
      return false;
    }

    showToast("Push notifications enabled successfully!");
    return true;
  } catch (error) {
    alert(`Push notification setup failed: ${error.message}`);
    return false;
  }
}


export async function arePushNotificationsEnabled() {
  try {
    if (
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window) ||
      Notification.permission !== "granted"
    ) {
      return false;
    }

    const registration =
      await navigator.serviceWorker.getRegistration();

    if (!registration) {
      return false;
    }

    const subscription =
      await registration.pushManager.getSubscription();

    return Boolean(subscription);
  } catch (error) {
    console.error(
      "Failed to check push notification status:",
      error
    );
    return false;
  }
}




export async function disablePushNotifications() {
  try {
    if (!("serviceWorker" in navigator)) {
      showToast("Service workers are not supported.");
      return false;
    }

    const registration =
      await navigator.serviceWorker.getRegistration();

    if (!registration) {
      showToast("No service worker registration was found.");
      return false;
    }

    const subscription =
      await registration.pushManager.getSubscription();

    if (!subscription) {
      return true;
    }

    const success = await subscription.unsubscribe();

    if (!success) {
      showToast("Could not disable push notifications.");
      return false;
    }

    showToast("Push notifications disabled on this browser.");
    return true;
  } catch (error) {
    showToast(
      `Could not disable notifications: ${error.message}`
    );
    return false;
  }
}