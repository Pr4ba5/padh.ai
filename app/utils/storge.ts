import AsyncStorage from "@react-native-async-storage/async-storage";

export const storage = {
  async set(key: string, value: any) {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  async get(key: string) {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },

  async remove(key: string) {
    await AsyncStorage.removeItem(key);
  },
};
