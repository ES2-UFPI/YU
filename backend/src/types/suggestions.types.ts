export type SuggestionCategory =
  | "digital_balance"
  | "physical_activity"
  | "rest"
  | "focus"
  | "wellbeing";

export type SuggestionsSource = "engine" | "cache";
export type WeatherCondition = "sunny" | "cloudy" | "rain" | "unknown";
export type ScreenTimeSource = "mock" | "native" | "unavailable";
export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export interface UserLocationContext {
  granted: boolean;
  latitude: number | null;
  longitude: number | null;
  capturedAt: string | null;
}

export interface ScreenTimeContext {
  source: ScreenTimeSource;
  totalMinutes: number;
  apps: {
    instagramMinutes: number;
    whatsappMinutes: number;
    readingMinutes: number;
  };
  byCategory: Record<string, number>;
}

export interface WeatherContext {
  available: boolean;
  temperatureCelsius: number | null;
  condition: WeatherCondition;
  observedAt: string | null;
}

export interface UserContextProfile {
  userId: string;
  generatedAt: string;
  goals: string[];
  location: UserLocationContext;
  weather: WeatherContext;
  screenTime: ScreenTimeContext;
  timeOfDay: TimeOfDay;
}

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: SuggestionCategory;
}

export interface SuggestionsResponse {
  source: SuggestionsSource;
  contextProfile: UserContextProfile;
  total: number;
  suggestions: Suggestion[];
}
