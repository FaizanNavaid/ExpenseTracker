import { Alert, Linking, Platform } from "react-native";
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";
import i18n from "../../config/localization/i18n";
import DeviceInfo from "react-native-device-info";
import * as Keychain from "react-native-keychain";
import { NetworkInfo } from "react-native-network-info";
import { getStorage } from "../storage/mmkv";



const t = (key: string) => i18n.t(key);

// ============================
// MMKV STORAGE
// ============================
// Re-exported from the dependency-free storage module (see comment there)
// so every existing `import { getStorage } from ".../helper/helper"` in
// the app keeps working unchanged.
export { getStorage };

export const storeData = async (key: string, value: string) => {
  const storage = getStorage();
  if (storage) storage.set(key, value);
};

export const getData = async (key: string): Promise<string | null> => {
  const storage = getStorage();
  if (!storage) return null;
  try {
    return storage.getString(key) || null;
  } catch (error) {
    return null;
  }
};

export const removeData = async (key: string) => {
  const storage = getStorage();
  if (storage) storage.remove(key);
};

export const clearApp = async () => {
  const storage = getStorage();
  if (storage) storage.clearAll();
};

// ============================
// SECURE STORAGE (react-native-keychain)
// Auth session cookie + any additional sensitive data.
// Never use MMKV for these — MMKV is unencrypted on disk.
// ============================
const AUTH_COOKIE_SERVICE = "expensetracker.auth.cookie";
const SECURE_DATA_SERVICE_PREFIX = "expensetracker.secure.";

// --- Auth session cookie ---
export const storeCookie = async (cookie: string): Promise<void> => {
  try {
    await Keychain.setGenericPassword("session", cookie, {
      service: AUTH_COOKIE_SERVICE,
    });
  } catch (error) {
    console.error("storeCookie error:", error);
  }
};

export const getCookie = async (): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: AUTH_COOKIE_SERVICE,
    });
    return credentials ? credentials.password : null;
  } catch (error) {
    console.error("getCookie error:", error);
    return null;
  }
};

export const removeCookie = async (): Promise<void> => {
  try {
    await Keychain.resetGenericPassword({ service: AUTH_COOKIE_SERVICE });
  } catch (error) {
    console.error("removeCookie error:", error);
  }
};

// --- Additional secure key/value data (user info, ids, etc.) ---
export const storeSecureData = async (key: string, value: string): Promise<void> => {
  try {
    await Keychain.setGenericPassword(key, value, {
      service: `${SECURE_DATA_SERVICE_PREFIX}${key}`,
    });
  } catch (error) {
    console.error("storeSecureData error:", error);
  }
};

export const getSecureData = async (key: string): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: `${SECURE_DATA_SERVICE_PREFIX}${key}`,
    });
    return credentials ? credentials.password : null;
  } catch (error) {
    console.error("getSecureData error:", error);
    return null;
  }
};

export const removeSecureData = async (key: string): Promise<void> => {
  try {
    await Keychain.resetGenericPassword({
      service: `${SECURE_DATA_SERVICE_PREFIX}${key}`,
    });
  } catch (error) {
    console.error("removeSecureData error:", error);
  }
};

// ============================
// PERMISSIONS
// ============================

export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const permission =
      Platform.OS === "ios" ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
    const status = await check(permission);

    if (status === RESULTS.GRANTED) return true;

    const result = await request(permission);
    if (result === RESULTS.GRANTED) return true;

    if (result === RESULTS.BLOCKED) {
      Alert.alert(
        t("permissions.cameraTitle"),
        t("permissions.cameraMessage"),
        [
          { text: t("common.cancel"), style: "cancel" },
          { text: t("permissions.openSettings"), onPress: () => Linking.openSettings() },
        ],
      );
    }
    return false;
  } catch (error) {
    console.log("Camera permission error:", error);
    return false;
  }
};

export const requestGalleryPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === "ios") {
      const permission = PERMISSIONS.IOS.PHOTO_LIBRARY;
      const status = await check(permission);
      if (status === RESULTS.GRANTED) return true;

      const result = await request(permission);
      if (result === RESULTS.GRANTED) return true;

      if (result === RESULTS.BLOCKED) {
        Alert.alert(
          t("permissions.galleryTitle"),
          t("permissions.galleryMessage"),
          [
            { text: t("common.cancel"), style: "cancel" },
            { text: t("permissions.openSettings"), onPress: () => Linking.openSettings() },
          ],
        );
      }
      return false;
    }

    if (Number(Platform.Version) >= 33) return true;

    const permission = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
    const status = await check(permission);
    if (status === RESULTS.GRANTED) return true;

    const result = await request(permission);
    if (result === RESULTS.GRANTED) return true;

    if (result === RESULTS.BLOCKED) {
      Alert.alert(
        t("permissions.galleryTitle"),
        t("permissions.galleryMessage"),
        [
          { text: t("common.cancel"), style: "cancel" },
          { text: t("permissions.openSettings"), onPress: () => Linking.openSettings() },
        ],
      );
    }

    if (result === RESULTS.DENIED) {
      Alert.alert(t("permissions.permissionDenied"), t("permissions.galleryRequired"));
    }

    return false;
  } catch (error) {
    console.log("Gallery permission error:", error);
    return false;
  }
};

const fetchPublicIP = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);
  const sources = [
    "https://api64.ipify.org?format=json",
    "https://api.ipify.org?format=json",
    "https://icanhazip.com",
  ];

  try {
    const response = await Promise.race(
      sources.map((url) =>
        fetch(url, { signal: controller.signal }).then(async (res) => {
          if (!res.ok) throw new Error();
          const text = await res.text();
          try {
            return JSON.parse(text).ip;
          } catch {
            return text.trim();
          }
        }),
      ),
    );
    clearTimeout(timeoutId);
    return response;
  } catch (e) {
    clearTimeout(timeoutId);
    return null;
  }
};

export async function getMachineDetail() {
  let ipv4 = "127.0.0.1";
  try {
    const [publicIp, localIp] = await Promise.all([
      fetchPublicIP(),
      NetworkInfo.getIPAddress().catch(() => null),
    ]);
    if (publicIp && publicIp !== "0.0.0.0" && publicIp !== "unknown")
      ipv4 = publicIp;
    else if (localIp && localIp !== "0.0.0.0" && localIp !== "unknown")
      ipv4 = localIp;

    const [brand, modelName, uniqueId, deviceId, systemVersion, appVersion] =
      await Promise.all([
        Promise.resolve(DeviceInfo.getBrand()).catch(() => "unknown"),
        Promise.resolve(DeviceInfo.getModel()).catch(() => "unknown"),
        Promise.resolve(DeviceInfo.getUniqueId()).catch(() => "unknown"),
        Promise.resolve(DeviceInfo.getDeviceId()).catch(() => "unknown"),
        Promise.resolve(DeviceInfo.getSystemVersion()).catch(() => "unknown"),
        Promise.resolve(DeviceInfo.getVersion()).catch(() => "1.0.0"),
      ]);

    return {
      ip_address: ipv4,
      device_id: String(deviceId || uniqueId || "unknown_id"),
      unique_id: String(uniqueId || deviceId || "unknown_unique"),
      platform: Platform.OS,
      model: `${brand} ${modelName}`.trim() || "unknown_model",
      system_version: String(systemVersion || "unknown"),
      app_version: String(appVersion || "1.0.0"),
    };
  } catch (error) {
    return {
      ip_address: "127.0.0.1",
      device_id: "fallback_device",
      unique_id: "fallback_unique",
      platform: Platform.OS,
      model: "unknown",
      system_version: "unknown",
      app_version: "1.0.0",
    };
  }
}


// ============================
// VALIDATIONS
// ============================
export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const isValidPassword = (password: string): boolean => password.length >= 6;

export const isValidAmount = (amount: string): boolean => {
  if (!amount.trim()) return false;
  const regex = /^\d+(\.\d{1,2})?$/;
  return regex.test(amount.trim()) && parseFloat(amount) > 0;
};

export const formatDateISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const capitalizeFirst = (text: string): string => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const showAlert = (title: string, message: string) => {
  Alert.alert(title, message, [{ text: t("common.ok") }]);
};

export const logInfo = (label: string, data: any) => {
  if (__DEV__) console.log(`🔹 ${label}:`, data);
};