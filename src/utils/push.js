
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
      alert("Push notifications are not supported by this browser.");
      return false;
    }

    if (!window.isSecureContext) {
      alert("Push notifications require HTTPS.");
      return false;
    }

    if (Notification.permission === "denied") {
      alert(
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
      alert(`Service worker registration failed: ${error.message}`);
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
      alert(
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
      alert("VAPID public key is missing or invalid.");
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
      alert(`Could not reach push subscription API: ${error.message}`);
      return false;
    }

    if (!subscribeRes.ok) {
      alert(
        `Push subscription API failed (${subscribeRes.status}): ${
          await getErrorMessage(subscribeRes)
        }`
      );
      return false;
    }

    alert("Push notifications enabled successfully!");
    return true;
  } catch (error) {
    alert(`Push notification setup failed: ${error.message}`);
    return false;
  }
}