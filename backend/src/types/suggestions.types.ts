export type SuggestionCategory =
  | "digital_balance"
  | "physical_activity"
  | "rest"
  | "focus"
  | "wellbeing";

export type SuggestionsSource = "engine" | "cache";

export interface UserLocationContext {
  latitude: number;
  longitude: number;
}

export interface ScreenTimeContext {
  totalMinutes?: number;
  byCategory?: Record<string, number>;
}

export interface UserContextProfile {
  location?: UserLocationContext;
  screenTime?: ScreenTimeContext;
  goals?: string[];
  extras?: Record<string, unknown>;
}

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: SuggestionCategory;
}

export interface SuggestionsRequestBody {
  context: UserContextProfile;
}

export interface SuggestionsResponse {
  source: SuggestionsSource;
  total: number;
  suggestions: Suggestion[];
}
