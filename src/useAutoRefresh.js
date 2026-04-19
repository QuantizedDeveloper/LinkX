import { useEffect, useState } from "react";

const URL_BASE = "https://linkx-backend-api-linkx-backend.hf.space";

export default function useAutoRefresh() {
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let retryTimeout;

    const refresh = async () => {
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        console.log("No refresh token → logout");
        setAuthLoading(false);
        return;
      }

      try {
        const res = await fetch(`${URL_BASE}/api/auth/refresh/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        // 🔥 REAL logout condition
        if (res.status === 401) {
          console.log("Refresh expired → logout");
          localStorage.clear();
          setAuthLoading(false);
          return;
        }

        if (!res.ok) throw new Error("Temporary failure");

        const data = await res.json();
        localStorage.setItem("accessToken", data.access);

        console.log("Access token refreshed ✅");
        setAuthLoading(false);

      } catch (err) {
        console.log("Refresh failed → retrying...");

        // 🔥 retry after delay
        retryTimeout = setTimeout(refresh, 2000);
      }
    };

    refresh();

    const interval = setInterval(refresh, 1000 * 60 * 3.5);

    return () => {
      clearInterval(interval);
      clearTimeout(retryTimeout);
    };
  }, []);

  return authLoading;
}