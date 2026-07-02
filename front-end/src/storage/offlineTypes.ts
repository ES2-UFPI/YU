export type LocationCache = {
    latitude: number;
    longitude: number;
    timestamp: string;
};

export type WeatherCache = {
    temperature: number;
    condition: string;
    latitude: number;
    longitude: number;
    fetchedAt: string;
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
