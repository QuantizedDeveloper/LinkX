import { useEffect } from "react";

const URL_BASE = "https://linkx-backend-api-linkx-backend.hf.space";

export default function useAutoRefresh() {
  useEffect(() => {
    const refresh = async () => {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return console.log("No refresh token found");

      try {
        const res = await fetch(`${URL_BASE}/api/auth/refresh/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!res.ok) throw new Error("Refresh failed");

        const data = await res.json();
        localStorage.setItem("accessToken", data.access);
        console.log("Access token auto-refreshed");
      } catch (err) {
        console.log("Session expired or refresh failed:", err);
        localStorage.clear(); // optional: redirect to login
      }
    };

    refresh(); // run immediately
    const interval = setInterval(refresh, 1000 * 60 * 3.5); // every 3.5 min
    return () => clearInterval(interval);
  }, []);
}