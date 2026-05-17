import { useEffect } from "react";
import { fetchWithAuth } from "../utils/api";

const ActivityTracker = () => {
  useEffect(() => {
    let interval;

    const fetchMe = async () => {
      const res = await fetchWithAuth("/freelancers/me/");

      if (!res.ok) {
        throw new Error("Not a freelancer");
      }

      return res.json();
    };

    const sendHeartbeat = async () => {
      try {
        await fetchWithAuth("/freelancers/ping/");
        
      } catch (error) {
        console.error("Heartbeat failed:", error);
      }
    };

    const startTracking = () => {
      // Send immediately
      sendHeartbeat();

      interval = setInterval(() => {
        if (!document.hidden) {
          sendHeartbeat();
        }
      }, 30000);
    };

    const stopTracking = () => {
      if (interval) {
        clearInterval(interval);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopTracking();
      } else {
        startTracking();
      }
    };

    const initializeTracking = async () => {
      try {
        // Check if user is freelancer
        await fetchMe();

        // Start heartbeat only for freelancers
        startTracking();

        document.addEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
      } catch (error) {
        // Not freelancer -> do nothing
      }
    };

    initializeTracking();

    return () => {
      stopTracking();

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

  return null;
};

export default ActivityTracker;