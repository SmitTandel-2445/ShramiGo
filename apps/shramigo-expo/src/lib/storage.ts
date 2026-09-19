import * as SecureStore from 'expo-secure-store';

const KEYS = {
  TOKEN: 'shramigo_token',
  REFRESH_TOKEN: 'shramigo_refresh_token',
  USER: 'shramigo_user',
  LANGUAGE: 'shramigo_language',
  THEME: 'shramigo_theme',
} as const;

export const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // ignore
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // ignore
    }
  },
};

export { KEYS };
