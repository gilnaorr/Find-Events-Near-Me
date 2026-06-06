// db.js — "Database" layer. Wraps AsyncStorage; in the real iOS app this is
// Core Data with two stores: `bookmarks` (durable user data) and
// `events_cache` (TTL-bound, safe to evict).
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "find-events:v1";

export const DB = {
  async load() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  async save(state) {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          bookmarks: [...state.bookmarks],
          cache: state.cache,
          prefs: state.prefs,
        })
      );
    } catch {}
  },
  async clearCache() {
    const s = (await DB.load()) || {};
    s.cache = null;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  },
  async clearAll() {
    await AsyncStorage.removeItem(STORAGE_KEY);
  },
};

export { STORAGE_KEY };
