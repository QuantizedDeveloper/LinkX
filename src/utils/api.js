const API_BASE = "https://linkx-backend-api-linkx-backend.hf.space";

export const fetchWithAuth = async (url, options = {}) => {
  let token = localStorage.getItem("accessToken");

  let res = await fetch(API_BASE + url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  // 🔥 If token expired
  if (res.status === 401) {
    console.log("Token expired → refreshing");

    const refreshToken = localStorage.getItem("refreshToken");

    const refreshRes = await fetch(API_BASE + "/api/auth/refresh/", {
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

    // 🔁 retry original request
    res = await fetch(API_BASE + url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${data.access}`,
      },
    });
  }

  return res;
};