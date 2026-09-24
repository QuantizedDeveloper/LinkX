import { fetchWithAuth } from "../utils/api";

export function urlBase64ToUint8Array(base64String) {
  const padding =
    "=".repeat((4 - base64String.length % 4) % 4);

  const base64 =
    (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from(
    [...rawData].map((char) =>
      char.charCodeAt(0)
    )
  );
}
export async function enablePushNotifications() {
  try {
    if (!("serviceWorker" in navigator)) {
    
      return;
    }
    const permission =
      await Notification.requestPermission();

    if (permission !== "granted") {
      return;
    }

    const registration =
      await navigator.serviceWorker.ready;

    const keyRes = await fetchWithAuth(
      "/api/messaging/push/public-key/"
    );

    if (!keyRes.ok) {

      return;
    }

    const data = await keyRes.json();

    let subscription =
      await registration.pushManager.getSubscription();

    if (subscription) {
    } else {

      subscription =
        await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey:
            urlBase64ToUint8Array(
              data.publicKey
            ),
        });
    }
    const subscribeRes = await fetchWithAuth(
  "/api/messaging/push/subscribe/",
  {
    method: "POST",
    body: JSON.stringify(
      subscription.toJSON()
    ),
  }
);
    const responseData =
      await subscribeRes.text();
    
  } catch (e) {
  }
}