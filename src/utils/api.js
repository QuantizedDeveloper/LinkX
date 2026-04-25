/*const API_BASE = "https://linkx-backend-api-linkx-backend.hf.space";

export const fetchWithAuth = async (url, options = {}) => {
  let token = localStorage.getItem("accessToken");

  if (!token) {
    window.location.href = "/google-login";
    return;
  }

  let res = await fetch(API_BASE + url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    console.log("Token expired → refreshing");

    const refreshToken = localStorage.getItem("refreshToken");

    const refreshRes = await fetch(API_BASE + "/api/token/refresh/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!refreshRes.ok) {
      localStorage.clear();
      window.location.href = "/login";
      return;
    }

    const data = await refreshRes.json();
    localStorage.setItem("accessToken", data.access);

    res = await fetch(API_BASE + url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
        Authorization: `Bearer ${data.access}`,
      },
    });
  }

  return res;
};*/

const API_BASE = "https://linkx-backend-api-linkx-backend.hf.space";

let isRefreshing = false;
let refreshPromise = null;

export const fetchWithAuth = async (url, options = {}) => {
  let token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("No access token");
  }

  const isFormData = options.body instanceof FormData;

  const makeRequest = async (accessToken) => {
    return fetch(API_BASE + url, {
      ...options,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    });
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
          }

          const refreshRes = await fetch(API_BASE + "/api/token/refresh/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh: refreshToken }),
          });

          if (!refreshRes.ok) {
            throw new Error("Refresh failed");
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