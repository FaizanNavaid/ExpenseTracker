import { createMMKV } from "react-native-mmkv";

// Deliberately has ZERO other app-level imports (no i18n, no helper.ts).
// i18n.ts needs raw MMKV access for its language detector, and helper.ts
// needs it too (plus i18n, for its own t() calls) — routing both through
// this leaf module keeps i18n.ts <-> helper.ts from ever forming a
// circular import again, which previously caused getStorage to be
// undefined depending on which file happened to load first.
let mmkvInstance: ReturnType<typeof createMMKV> | null = null;

export const getStorage = () => {
  if (!mmkvInstance) {
    try {
      mmkvInstance = createMMKV();
    } catch (e) {
      console.error("MMKV could not be initialized:", e);
      return null;
    }
  }
  return mmkvInstance;
};
