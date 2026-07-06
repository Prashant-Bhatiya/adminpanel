const BASE_URL = "http://3.111.150.26:5000/api/v1";

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  toast?: boolean;
  responseType?: "success" | "error";
}

// Generate or retrieve a persistent device ID for the admin panel session
export function getDeviceId(): string {
  let deviceId = localStorage.getItem("admin_device_id");
  if (!deviceId) {
    deviceId = "web-" + Math.random().toString(36).substring(2, 11) + "-" + Date.now();
    localStorage.setItem("admin_device_id", deviceId);
  }
  return deviceId;
}

export function getTokens() {
  return {
    accessToken: localStorage.getItem("admin_access_token"),
    refreshToken: localStorage.getItem("admin_refresh_token"),
  };
}

export function setTokens(accessToken: string, refreshToken?: string) {
  localStorage.setItem("admin_access_token", accessToken);
  if (refreshToken) {
    localStorage.setItem("admin_refresh_token", refreshToken);
  }
}

export function clearTokens() {
  localStorage.removeItem("admin_access_token");
  localStorage.removeItem("admin_refresh_token");
  localStorage.removeItem("admin_panel_auth_user");
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
}

async function performRefresh(): Promise<string | null> {
  const { refreshToken } = getTokens();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE_URL}/admin/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken,
        deviceId: getDeviceId(),
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await res.json();
    // Handle both direct and standard wrapper responses
    const newAccessToken = data?.accessToken || data?.data?.accessToken;
    if (newAccessToken) {
      setTokens(newAccessToken);
      return newAccessToken;
    }
    return null;
  } catch (error) {
    console.error("Token refresh error:", error);
    clearTokens();
    window.dispatchEvent(new CustomEvent("auth-logout"));
    return null;
  }
}

interface CustomRequestInit extends RequestInit {
  skipAuth?: boolean;
}

export async function apiFetch<T = any>(
  path: string,
  options: CustomRequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${path}`;
  const headers = new Headers(options.headers || {});

  if (!options.skipAuth) {
    const { accessToken } = getTokens();
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, fetchOptions);

    // If unauthorized, attempt token refresh (except for auth endpoints themselves)
    if (response.status === 401 && !options.skipAuth && !path.includes("/admin/login") && !path.includes("/admin/refresh-token")) {
      if (!isRefreshing) {
        isRefreshing = true;
        performRefresh().then((newToken) => {
          isRefreshing = false;
          if (newToken) {
            onRefreshed(newToken);
          }
        });
      }

      const retryOriginalRequest = new Promise<ApiResponse<T>>((resolve, reject) => {
        subscribeTokenRefresh((token) => {
          headers.set("Authorization", `Bearer ${token}`);
          fetch(url, fetchOptions)
            .then(async (res) => {
              if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                reject(new Error(errData.message || `Request failed with status ${res.status}`));
              } else {
                resolve(await res.json());
              }
            })
            .catch(reject);
        });
      });

      return retryOriginalRequest;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data as ApiResponse<T>;
  } catch (error: any) {
    console.error(`API Fetch error for ${path}:`, error);
    throw error;
  }
}
