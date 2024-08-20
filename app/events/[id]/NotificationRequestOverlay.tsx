"use client";

import { useEffect, useState } from "react";

const requestNotificationPermission = async () => {
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    // If no subscription exists, create one
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey:
          "BE3zcqJpGQ6kQsw1QYDmVfCeRR6pyN0r-KcBGzi_IcnWZbsKHFz3Qc3o935-054Apet84BDsUcjZVeFtBbq83uc",
      });
    } else {
      // Validate the existing subscription
      const isValid = await validateSubscription(subscription);
      if (!isValid) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey:
            "BE3zcqJpGQ6kQsw1QYDmVfCeRR6pyN0r-KcBGzi_IcnWZbsKHFz3Qc3o935-054Apet84BDsUcjZVeFtBbq83uc",
        });
      }
    }

    const subscriptionData = formatSubscription(subscription);
    await saveSubscription(subscriptionData);
  } else {
    console.error("Notification permission denied");
  }
};

const validateSubscription = async (subscription: PushSubscription) => {
  try {
    const response = await fetch("/api/trigger-notification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "Validation Check", subscription }),
    });

    if (response.ok) {
      return true;
    } else {
      console.error("Subscription is invalid or expired");
      return false;
    }
  } catch (error) {
    console.error("Error validating subscription:", error);
    return false;
  }
};

const formatSubscription = (subscription: PushSubscription) => {
  const arrayBufferToBase64 = (buffer: ArrayBuffer | null): string => {
    if (!buffer) return "";
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: arrayBufferToBase64(subscription.getKey("p256dh")),
      auth: arrayBufferToBase64(subscription.getKey("auth")),
    },
  };
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
    const hasRequestedNotification = localStorage.getItem(
      "soundclash-notification-requested"
    );
    if (!hasRequestedNotification) {
      setVisible(true);
    }
  }, []);

  const handleRequestNotification = async () => {
    await requestNotificationPermission();
    localStorage.setItem("soundclash-notification-requested", "true");
    setVisible(false);
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