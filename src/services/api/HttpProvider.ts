import axios from "axios";
import NetInfo from "@react-native-community/netinfo";
import { getCookie, storeCookie } from "../helper/helper";
import { BASE_API_URL } from "@env";
import { DeviceEventEmitter } from "react-native";

if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

const BASE_URL = BASE_API_URL;

const HTTPProvider = axios.create({
  baseURL: BASE_URL,
  timeout: 40000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const cleanCookieString = (
  cookieInput:
    | (string | string[] | undefined | null)[]
    | string
    | string[]
    | undefined
    | null,
): string => {
  if (!cookieInput) return "";

  let rawList: string[] = [];
  if (Array.isArray(cookieInput)) {
    for (const item of cookieInput) {
      if (!item) continue;
      if (Array.isArray(item)) {
        rawList.push(...item.filter((x): x is string => typeof x === "string"));
      } else if (typeof item === "string") {
        rawList.push(...item.split(/,\s*(?=[a-zA-Z0-9_\-]+=)/));
      }
    }
  } else if (typeof cookieInput === "string") {
    rawList = cookieInput.split(/,\s*(?=[a-zA-Z0-9_\-]+=)/);
  }

  const ignoredDirectives = new Set([
    "path",
    "expires",
    "max-age",
    "domain",
    "samesite",
    "httponly",
    "secure",
    "priority",
  ]);

  const cookieMap = new Map<string, string>();

  for (const item of rawList) {
    if (!item) continue;
    const parts = item.split(";");
    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.substring(0, eqIdx).trim();
        const value = trimmed.substring(eqIdx + 1).trim();
        if (key && !ignoredDirectives.has(key.toLowerCase())) {
          cookieMap.set(key, value);
        }
      }
    }
  }

  return Array.from(cookieMap.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
};

export const getRefreshTokenCookie = (
  cookieInput: string | string[] | undefined | null,
): string => {
  if (!cookieInput) return "";
  const cleaned = cleanCookieString(cookieInput);
  const match = cleaned.match(/refreshToken=([^;]+)/);
  if (match && match[1]) {
    return `refreshToken=${match[1].trim()}`;
  }
  return "";
};

HTTPProvider.interceptors.request.use(
  async (config) => {
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      throw new axios.Cancel("NO_INTERNET");
    }

    try {
      const savedCookie = await getCookie();
      if (savedCookie) {
        let cleaned = cleanCookieString(savedCookie);
        if (config.url?.includes("/api/auth/refresh")) {
          const rfCookie = getRefreshTokenCookie(savedCookie);
          if (rfCookie) cleaned = rfCookie;
        }
        config.headers.Cookie = cleaned;
      }
    } catch (err) {
      console.log("Request interceptor error:", err);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

HTTPProvider.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthEndpoint =
      originalRequest?.url?.includes("/api/auth/login") ||
      originalRequest?.url?.includes("/api/auth/signup") ||
      originalRequest?.url?.includes("/api/auth/register") ||
      originalRequest?.url?.includes("/api/auth/refresh");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      const savedCookie = await getCookie();
      if (savedCookie) {
        originalRequest._retry = true;
        try {
          const rfCookie = getRefreshTokenCookie(savedCookie);
          const rfTokenMatch = rfCookie.match(/refreshToken=([^;]+)/);
          const rfTokenVal = rfTokenMatch ? rfTokenMatch[1].trim() : "";

          if (rfCookie) {
            const refreshRes = await axios.post(
              `${BASE_URL.replace(/\/$/, "")}/api/auth/refresh`,
              { refreshToken: rfTokenVal },
              {
                withCredentials: false,
                headers: { Cookie: rfCookie },
              },
            );
            if (refreshRes.status === 200) {
              const rawCookie =
                refreshRes.headers["set-cookie"] ||
                refreshRes.headers["Set-Cookie"];
              const combinedCookie = rawCookie
                ? cleanCookieString([savedCookie, rawCookie])
                : cleanCookieString(savedCookie);
              await storeCookie(combinedCookie);

              (originalRequest.headers as any).Cookie = combinedCookie;
              return axios(originalRequest);
            }
          }
        } catch (refreshErr: any) {
          console.log(
            "Refresh failed:",
            refreshErr?.response?.data || refreshErr?.message,
          );
          DeviceEventEmitter.emit("FORCE_LOGOUT");
        }
      }
    }

    if (error.response?.status === 401 && !isAuthEndpoint) {
      const errorMsg = error.response?.data?.message?.toLowerCase() || "";
      if (errorMsg.includes("expired") || errorMsg.includes("invalid")) {
        DeviceEventEmitter.emit("FORCE_LOGOUT");
      }
    }

    return Promise.reject(error);
  },
);

export default HTTPProvider;