export type { SuggestionCatalogItem } from "../types/suggestionsCatalog.types.js";

export interface UserContext {
  goals: string[];
  weather: string;
  location: string;
  screenTime: {
    totalMinutes: number;
    socialMinutes: number;
    entertainmentMinutes: number;
  };
  isOffline: boolean;
}

export type ScreenTimeLevel = "low" | "medium" | "high";

import { SuggestionCatalogItem } from "../types/suggestionsCatalog.types.js";
export interface RankedSuggestion extends SuggestionCatalogItem {
  score: number;
}