import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
    LocationCache,
    ScreenTimeDay,
    Suggestion,
    WeatherCache,
} from "./offlineTypes";

const STORAGE_KEYS = {
    goals: "@yu:offline:goals",
    location: "@yu:offline:location",
    weather: "@yu:offline:weather",
    suggestionsCatalog: "@yu:offline:suggestions_catalog",
    lastSuggestions: "@yu:offline:last_suggestions",
    screenTimeHistory: "@yu:offline:screen_time_history",
} as const;

const SCREEN_TIME_HISTORY_LIMIT = 7;

async function saveJson<T>(key: string, value: T): Promise<void> {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn("Nao foi possivel salvar dados offline.", error);
    }
}

async function getJson<T>(key: string, fallback: T): Promise<T> {
    try {
        const storedValue = await AsyncStorage.getItem(key);

        if (!storedValue) {
            return fallback;
        }

        return JSON.parse(storedValue) as T;
    } catch (error) {
        console.warn("Nao foi possivel ler dados offline.", error);
        return fallback;
    }
}

function limitScreenTimeHistory(history: ScreenTimeDay[]): ScreenTimeDay[] {
    return [...history]
        .sort((first, second) => second.date.localeCompare(first.date))
        .slice(0, SCREEN_TIME_HISTORY_LIMIT)
        .reverse();
}

export async function saveGoalsCache(goalIds: string[]): Promise<void> {
    await saveJson(STORAGE_KEYS.goals, goalIds);
}

export async function getGoalsCache(): Promise<string[]> {
    return getJson<string[]>(STORAGE_KEYS.goals, []);
}

export async function saveLocationCache(location: LocationCache): Promise<void> {
    await saveJson(STORAGE_KEYS.location, location);
}

export async function getLocationCache(): Promise<LocationCache | null> {
    return getJson<LocationCache | null>(STORAGE_KEYS.location, null);
}

export async function saveWeatherCache(weather: WeatherCache): Promise<void> {
    await saveJson(STORAGE_KEYS.weather, weather);
}

export async function getWeatherCache(): Promise<WeatherCache | null> {
    return getJson<WeatherCache | null>(STORAGE_KEYS.weather, null);
}

export async function saveSuggestionsCatalogCache(
    suggestions: Suggestion[]
): Promise<void> {
    await saveJson(STORAGE_KEYS.suggestionsCatalog, suggestions);
}

export async function getSuggestionsCatalogCache(): Promise<Suggestion[]> {
    return getJson<Suggestion[]>(STORAGE_KEYS.suggestionsCatalog, []);
}

export async function saveLastSuggestionsCache(
    suggestions: Suggestion[]
): Promise<void> {
    await saveJson(STORAGE_KEYS.lastSuggestions, suggestions);
}

export async function getLastSuggestionsCache(): Promise<Suggestion[]> {
    return getJson<Suggestion[]>(STORAGE_KEYS.lastSuggestions, []);
}

export async function saveScreenTimeHistory(
    history: ScreenTimeDay[]
): Promise<void> {
    await saveJson(STORAGE_KEYS.screenTimeHistory, limitScreenTimeHistory(history));
}

export async function getScreenTimeHistory(): Promise<ScreenTimeDay[]> {
    const history = await getJson<ScreenTimeDay[]>(STORAGE_KEYS.screenTimeHistory, []);

    return limitScreenTimeHistory(history);
}

export type { LocationCache, ScreenTimeDay, Suggestion, WeatherCache };
