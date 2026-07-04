import {
  UserContext,
  SuggestionCatalogItem,
  RankedSuggestion,
  ScreenTimeLevel,
} from "./engineTypes.js";
import { SuggestionStrategy } from "./strategies/SuggestionStrategy.js";
import { GoalStrategy } from "./strategies/GoalStrategy.js";
import { WeatherStrategy } from "./strategies/WeatherStrategy.js";
import { LocationStrategy } from "./strategies/LocationStrategy.js";
import { ScreenTimeStrategy } from "./strategies/ScreenTimeStrategy.js";
import { OfflineStrategy } from "./strategies/OfflineStrategy.js";

export function deriveScreenTimeLevel(socialMinutes: number): ScreenTimeLevel {
  if (socialMinutes > 120) return "high";
  if (socialMinutes >= 60) return "medium";
  return "low";
}

export class SuggestionEngine {
  private strategies: SuggestionStrategy[];

  constructor(strategies?: SuggestionStrategy[]) {
    this.strategies = strategies ?? [
      new OfflineStrategy(),     
      new GoalStrategy(),        
      new WeatherStrategy(),   
      new LocationStrategy(),    
      new ScreenTimeStrategy(),
    ];
  }

  run(
    catalog: SuggestionCatalogItem[],
    context: UserContext,
    min = 3,
    max = 5
  ): SuggestionCatalogItem[] {
    let suggestions = [...catalog];

    for (const strategy of this.strategies) {
      suggestions = strategy.apply(suggestions, context);
    }

    // Fallback — relaxa filtro de localização se ficou abaixo do mínimo
    if (suggestions.length < min) {
      const relaxedStrategies = [
        new OfflineStrategy(),
        new GoalStrategy(),
        new WeatherStrategy(),
        new ScreenTimeStrategy(),
      ];

      let relaxed = [...catalog];
      for (const strategy of relaxedStrategies) {
        relaxed = strategy.apply(relaxed, context);
      }

      return relaxed.slice(0, max);
    }

    return suggestions.slice(0, max);
  }
}

export function filterByGoals(
  suggestions: SuggestionCatalogItem[],
  userGoals: string[]
): SuggestionCatalogItem[] {
  return new GoalStrategy().apply(suggestions, {
    goals: userGoals,
    weather: "any",
    location: "any",
    screenTime: { totalMinutes: 0, socialMinutes: 0, entertainmentMinutes: 0 },
    isOffline: false,
  });
}

export function filterByWeather(
  suggestions: SuggestionCatalogItem[],
  weather: string
): SuggestionCatalogItem[] {
  return new WeatherStrategy().apply(suggestions, {
    goals: [],
    weather,
    location: "any",
    screenTime: { totalMinutes: 0, socialMinutes: 0, entertainmentMinutes: 0 },
    isOffline: false,
  });
}

export function filterByLocation(
  suggestions: SuggestionCatalogItem[],
  location: string
): SuggestionCatalogItem[] {
  return new LocationStrategy().apply(suggestions, {
    goals: [],
    weather: "any",
    location,
    screenTime: { totalMinutes: 0, socialMinutes: 0, entertainmentMinutes: 0 },
    isOffline: false,
  });
}

export function filterByOffline(
  suggestions: SuggestionCatalogItem[],
  isOffline: boolean
): SuggestionCatalogItem[] {
  return new OfflineStrategy().apply(suggestions, {
    goals: [],
    weather: "any",
    location: "any",
    screenTime: { totalMinutes: 0, socialMinutes: 0, entertainmentMinutes: 0 },
    isOffline,
  });
}

export function rankByScreenTime(
  suggestions: SuggestionCatalogItem[],
  screenTimeLevel: ScreenTimeLevel
): RankedSuggestion[] {
  const socialMinutes =
    screenTimeLevel === "high" ? 150
    : screenTimeLevel === "medium" ? 90
    : 30;

  const result = new ScreenTimeStrategy().apply(suggestions, {
    goals: [],
    weather: "any",
    location: "any",
    screenTime: { totalMinutes: 0, socialMinutes, entertainmentMinutes: 0 },
    isOffline: false,
  });

  return result.map((s) => ({ ...s, score: 0 }));
}

export function selectSuggestions(
  catalog: SuggestionCatalogItem[],
  context: UserContext,
  min = 3,
  max = 5
): RankedSuggestion[] {
  const engine = new SuggestionEngine();
  const result = engine.run(catalog, context, min, max);
  return result.map((s) => ({ ...s, score: 0 }));
}