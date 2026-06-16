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
    //  alert("Service Worker not supported");
      return;
    }

 //   alert("Requesting notification permission...");

    const permission =
      await Notification.requestPermission();

  //  alert("Permission: " + permission);

    if (permission !== "granted") {
   //   alert("Notification permission not granted");
      return;
    }

    const registration =
      await navigator.serviceWorker.ready;

   // alert("Service Worker ready");

    const keyRes = await fetchWithAuth(
      "/api/messaging/push/public-key/"
    );

    if (!keyRes.ok) {
  //    alert("Failed to fetch public key");
      return;
    }

    const data = await keyRes.json();

  //  alert("Public key received");

    let subscription =
      await registration.pushManager.getSubscription();

    if (subscription) {
    //  alert("Existing subscription found");
    } else {
    //  alert("No subscription found. Creating one...");

      subscription =
        await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey:
            urlBase64ToUint8Array(
              data.publicKey
            ),
        });

      //alert("Subscription created");
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

   // alert(
     // "Subscribe API status: " +
     //   subscribeRes.status
    //);

    const responseData =
      await subscribeRes.text();

   // alert(
      //"Server response:\n" +
        //responseData
    //);

   // alert("Push setup completed!");
  } catch (e) {
    //alert(
     // "ERROR:\n" +
      //  (e && e.message
      //    ? e.message
       //   : String(e))
   // );
  }
}