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

export type UserContextProfile = {
    userId: string;
    generatedAt: string;
    goals: string[];
    location: {
        granted: boolean;
        latitude: number | null;
        longitude: number | null;
        capturedAt: string | null;
    };
    weather: {
        available: boolean;
        temperatureCelsius: number | null;
        condition: "sunny" | "cloudy" | "rain" | "unknown";
        observedAt: string | null;
    };
    screenTime: {
        source: "mock" | "native" | "unavailable";
        totalMinutes: number;
        apps: {
            instagramMinutes: number;
            whatsappMinutes: number;
            readingMinutes: number;
        };
        byCategory: Record<string, number>;
    };
    timeOfDay: "morning" | "afternoon" | "evening" | "night";
};
