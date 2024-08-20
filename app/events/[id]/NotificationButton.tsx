"use client";

import { useEffect, useState } from "react";

const NotificationRequestOverlay = () => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Check if the notification button has already been shown
    const hasShownButton = localStorage.getItem("notificationButtonShown");

    if (!hasShownButton) {
      setShowButton(true);
    }
  }, []);

  const handleRequestPermission = () => {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        // Handle granted permission (e.g., subscribe to push notifications)
      }

      // Hide the button and set localStorage to prevent it from showing again
      setShowButton(false);
      localStorage.setItem("notificationButtonShown", "true");
    });
  };

  if (!showButton) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 shadow-lg text-center">
        <p className="mb-4">
          Be notified while games are ongoing when it's time to vote!
        </p>
        <button
          onClick={handleRequestPermission}
          className="bg-blue-500 text-white px-4 py-2 hover:bg-blue-600"
        >
          Enable Notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationRequestOverlay;
