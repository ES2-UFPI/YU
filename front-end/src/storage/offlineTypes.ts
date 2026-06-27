export type LocationCache = {
    latitude: number;
    longitude: number;
    timestamp: string;
};

export type WeatherCache = {
    temperature: number;
    condition: "sunny" | "cloudy" | "rain" | "unknown";
    timestamp: string;
};

export type Suggestion = {
    id: string;
    title: string;
    description: string;
    category: string;
    offlineAvailable?: boolean;
};

export type ScreenTimeEntry = {
    appName: string;
    minutes: number;
};

export type ScreenTimeDay = {
    date: string;
    entries: ScreenTimeEntry[];
};
