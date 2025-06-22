import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveSession = async (key: string, value: object | string) => {
    try {
        const storedValue = typeof value === 'string' ? JSON.stringify({ data: value }) : JSON.stringify(value);
        await AsyncStorage.setItem(key, storedValue);
    } catch (error) {
        console.error(`Failed to save data for key "${key}":`, error);
    }
};

export const getSession = async (key: string) => {
    try {
        const storedValue = await AsyncStorage.getItem(key);
        if (storedValue) {
            try {
                return JSON.parse(storedValue);
            } catch (error) {
                console.warn(`Data under key "${key}" is not valid JSON:`, storedValue);
                return storedValue; // Return raw string if not JSON
            }
        }
        return null;
    } catch (error) {
        console.error(`Failed to retrieve data for key "${key}":`, error);
        return null;
    }
};

export const removeSession = async (key: string) => {
    try {
        await AsyncStorage.removeItem(key);
    } catch (error) {
        console.error(`Failed to remove data for key "${key}":`, error);
    }
};