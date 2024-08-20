"use client";

import { useEffect, useState } from "react";

const checkSubscriptionOnServer = async (endpoint: string) => {
  const response = await fetch("/api/check-subscription", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ endpoint }),
  });

  const data = await response.json();
  return data.exists;
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4); // pad with '=' to make the base64 string length a multiple of 4
  const base64 = (base64String + padding)
    .replace(/-/g, "+") // 62nd char of encoding
    .replace(/_/g, "/"); // 63rd char of encoding

  const rawData = window.atob(base64); // decode base64 string to binary data
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return "";
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

const requestNotificationPermission = async () => {
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    const registration = await navigator.serviceWorker.ready;
    const applicationServerKey = urlBase64ToUint8Array(
      "BE3zcqJpGQ6kQsw1QYDmVfCeRR6pyN0r-KcBGzi_IcnWZbsKHFz3Qc3o935-054Apet84BDsUcjZVeFtBbq83uc"
    );
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    // Correctly convert the keys to Base64 strings
    const p256dhKey = subscription.getKey("p256dh");
    const authKey = subscription.getKey("auth");

    const subscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(p256dhKey),
        auth: arrayBufferToBase64(authKey),
      },
    };

    // Call the function to save the subscription data
    await saveSubscription(subscriptionData);
  } else {
    console.error("Notification permission denied");
  }
};

const saveSubscription = async (subscription: any) => {
  try {
    const response = await fetch("/api/save-subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscription),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to save subscription");
    }
    console.log(data.message);
  } catch (error) {
    console.error("Error:", error);
  }
};

export default function NotificationRequestOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const checkSubscription = async () => {
      const hasRequestedNotification = localStorage.getItem(
        "soundclash-notification-requested"
      );

      if (hasRequestedNotification) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
          const subscriptionExists = await checkSubscriptionOnServer(
            subscription.endpoint
          );

          if (!subscriptionExists) {
            // Remove the localStorage flag if the subscription is missing
            localStorage.removeItem("soundclash-notification-requested");
            setVisible(true);
          }
        } else {
          // Subscription not found, show overlay
          setVisible(true);
        }
      } else {
        // Local storage flag not set, show overlay
        setVisible(true);
      }
    };

    checkSubscription();
  }, []);

  const handleRequestNotification = async () => {
    await requestNotificationPermission();
    localStorage.setItem("soundclash-notification-requested", "true"); // Mark as shown
    setVisible(false); // Hide the overlay
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 shadow-lg text-center">
        <p className="mb-4">
          Be notified while games are ongoing when it's time to vote!
        </p>
        <button
          onClick={handleRequestNotification}
          className="bg-blue-500 text-white px-4 py-2 hover:bg-blue-600"
        >
          Enable Notifications
        </button>
      </div>
    </div>
  );
}
