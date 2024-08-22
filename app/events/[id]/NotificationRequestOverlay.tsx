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
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
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

    const p256dhKey = subscription.getKey("p256dh");
    const authKey = subscription.getKey("auth");

    const subscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(p256dhKey),
        auth: arrayBufferToBase64(authKey),
      },
    };

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
  } catch (error) {
    console.error("Error:", error);
  }
};

export default function NotificationRequestOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const button = document.getElementById("notification-button");

    const handleRequestNotification = async () => {
      try {
        await requestNotificationPermission();
        localStorage.setItem("soundclash-notification-requested", "true");
        setTimeout(() => setVisible(false), 100); // Delay to ensure state update
      } catch (error) {
        console.error("Error requesting notification permission:", error);
      }
    };

    // Handle multiple event types to ensure the button works on iOS and other devices
    const handleInteraction = () => handleRequestNotification();

    if (button) {
      button.addEventListener("click", handleInteraction); // Standard click event
      button.addEventListener("touchstart", handleInteraction); // Touch event for iOS
      button.addEventListener("pointerdown", handleInteraction); // Pointer event fallback
      button.addEventListener("focus", handleInteraction); // Focus event for accessibility
    }

    // Cleanup event listeners on component unmount
    return () => {
      if (button) {
        button.removeEventListener("click", handleInteraction);
        button.removeEventListener("touchstart", handleInteraction);
        button.removeEventListener("pointerdown", handleInteraction);
        button.removeEventListener("focus", handleInteraction);
      }
    };
  }, []);

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
          id="notification-button"
          className="bg-blue-500 text-white px-4 py-2 hover:bg-blue-600"
          tabIndex={0} // Ensure button is focusable
        >
          Enable Notifications
        </button>
      </div>
    </div>
  );
}
