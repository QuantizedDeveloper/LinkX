import { showToast } from "../utils/toast";
const API_BASE = "https://linkx-backend-api-linkx-backend.hf.space";

let isRefreshing = false;
let refreshPromise = null;

export const fetchWithAuth = async (url, options = {}) => {
  let token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("No access token");
    showToast("No access token")
  }

  const isFormData = options.body instanceof FormData;

  const makeRequest = async (accessToken) => {
  const start = performance.now();

  const response = await fetch(API_BASE + url, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const elapsed = performance.now() - start;

  console.log(
    `[API] ${url} → ${response.status} → ${elapsed.toFixed(0)}ms`
  );

  return response;
};

  let res = await makeRequest(token);

  // 🔁 HANDLE 401 (TOKEN EXPIRED)
  if (res.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;

      refreshPromise = (async () => {
        try {
          const refreshToken = localStorage.getItem("refreshToken");

          if (!refreshToken) {
            throw new Error("No refresh token");
            showToast("No refresh token")
          }

          const refreshRes = await fetch(API_BASE + "/api/auth/refresh/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh: refreshToken }),
          });

          if (!refreshRes.ok) {
            throw new Error("Refresh failed");
            showToast("Refresh failed")
            
          }

          const data = await refreshRes.json();

          localStorage.setItem("accessToken", data.access);
          
          // optional (only if backend returns it)
          if (data.refresh) {
            localStorage.setItem("refreshToken", data.refresh);
          }
          

          return data.access;
        } catch (err) {
          console.error("Refresh error:", err);
          showToast("Refresh Error")
          localStorage.clear();
          window.location.href = "/login";
          throw err;
        } finally {
          isRefreshing = false;
        }
      })();
    }

    const newToken = await refreshPromise;
    res = await makeRequest(newToken);
    
  }

  return res;
};