import { I18nManager } from "react-native";
import RNRestart from "react-native-restart";
// From the dependency-free leaf module, not helper.ts — this file is
// imported by i18n.ts, and helper.ts imports i18n.ts, so going through
// helper.ts here would recreate the same circular-import bug this module
// exists to avoid (see the comment in i18n.ts).
import { getStorage } from "../../storage/mmkv";

// Must match the key i18n's own MMKV language detector reads/writes
// (src/config/localization/i18n.ts) — kept in sync manually below because
// that detector's cacheUserLanguage() is async and is not guaranteed to
// finish writing before we restart the app a few lines down.
const LANGUAGE_STORAGE_KEY = "appLanguage";

// Only Urdu is RTL among the languages this app supports.
const RTL_LANGUAGES = ["ur"];

const isRTLLanguage = (language: string): boolean =>
  RTL_LANGUAGES.includes(language);

/**
 * Keeps React Native's native layout direction (I18nManager) in sync with
 * the currently selected app language.
 *
 * Why this is needed: RN's Yoga layout engine reads the RTL flag once at
 * native init. Calling I18nManager.forceRTL() at runtime flips the flag,
 * but already-mounted native views don't re-layout correctly until the app
 * is fully restarted — this is a hard RN platform limitation, not something
 * fixable with JS-side styling. Restarting on change is the standard,
 * only-reliable way every production RN app (WhatsApp, Instagram, etc.)
 * handles RTL language switching.
 *
 * This function is a no-op when direction is already correct, so it is
 * safe to call on every app start and on every language change.
 */
export const syncAppDirection = (language: string): void => {
  const shouldBeRTL = isRTLLanguage(language);

  if (I18nManager.isRTL === shouldBeRTL) return;

  I18nManager.allowRTL(shouldBeRTL);
  I18nManager.forceRTL(shouldBeRTL);

  // Persist the language synchronously (MMKV, not the async detector)
  // BEFORE restarting, so the app doesn't reload before that write lands
  // and fall back to the previous language.
  try {
    getStorage()?.set(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.error("syncAppDirection: failed to persist language", error);
  }

  // Restarting in the very same tick can race with the native bridge still
  // processing the allowRTL/forceRTL calls above (and, on some devices,
  // with the MMKV write reaching disk). A short delay is the standard,
  // defensive way this is handled in production RN apps — it guarantees
  // everything above has actually settled before the JS context is torn
  // down and rebuilt.
  setTimeout(() => {
    RNRestart.restart();
  }, 300);
};
