import { SuggestionCategory } from "./suggestions.types.js";

export type WellbeingCategory =
  | "exercise"
  | "nutrition"
  | "sleep"
  | "mental_health"
  | "digital_rest";

export type CatalogWeatherRequirement =
  | "sunny"
  | "cloudy"
  | "rain"
  | "unknown"
  | "any";

export type CatalogLocationRequirement = "indoor" | "outdoor" | "any";

export type CatalogScreenTimeRequirement = "low" | "medium" | "high" | "any";

export interface SuggestionContextRequirements {
  goals: string[];
  weather: CatalogWeatherRequirement[];
  location: CatalogLocationRequirement[];
  screenTimeLevel: CatalogScreenTimeRequirement[];
}

export interface SuggestionCatalogItem {
  id: string;
  title: string;
  shortDescription: string;
  category: SuggestionCategory;
  wellbeingCategory: WellbeingCategory;
  contextRequirements: SuggestionContextRequirements;
  offlineAvailable: boolean;
}
