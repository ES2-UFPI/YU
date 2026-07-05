import {
  Suggestion,
  SuggestionsResponse,
  UserContextProfile,
} from "../types/suggestions.types.js";
import { SuggestionEngine } from "../engine/suggestionEngine.js";
import { UserContext } from "../engine/engineTypes.js";
import { SuggestionCatalogItem } from "../types/suggestionsCatalog.types.js";
import {
  getOfflineCatalogSuggestions,
  getSuggestionsCatalog,
} from "./suggestionsCatalog.service.js";

async function getSuggestionsFromDecisionEngine(
  _userId: string,
  context: UserContextProfile
): Promise<Suggestion[]> {

  if (!context.goals || context.goals.length === 0) {
    throw new Error("No goals available for suggestion engine.");
  }

  const engineContext: UserContext = {
    goals: context.goals,
    weather: normalizeWeather(context.weather.condition),
    location: context.location.granted ? "outdoor" : "unknown",
    screenTime: {
      totalMinutes: context.screenTime.totalMinutes,
      socialMinutes:
        context.screenTime.apps.instagramMinutes +
        context.screenTime.apps.whatsappMinutes,
      entertainmentMinutes: context.screenTime.byCategory.entertainment ?? 0,
    },
    isOffline: false,
  };

  const catalog = getSuggestionsCatalog();
  const engine = new SuggestionEngine();
  const engineResult = engine.run(
    catalog as SuggestionCatalogItem[],
    engineContext
  );

  if (engineResult.length === 0) {
    throw new Error("Engine returned no suggestions.");
  }

  return engineResult.map((suggestion) => ({
    id: suggestion.id,
    title: suggestion.title,
    description: suggestion.shortDescription,
    category: suggestion.category,
  }));
}

function getCachedSuggestions(): Suggestion[] {
  return getOfflineCatalogSuggestions(3);
}

function normalizeWeather(condition: string): string {
  const normalized = condition.toLowerCase();

  if (normalized.includes("chuva") || normalized.includes("rain")) {
    return "rain";
  }

  if (normalized.includes("nublado") || normalized.includes("cloud")) {
    return "cloudy";
  }

  if (
    normalized.includes("limpo") ||
    normalized.includes("clear") ||
    normalized.includes("sun")
  ) {
    return "sunny";
  }

  return "unknown";
}

export async function generateSuggestions(
  userId: string,
  context: UserContextProfile
): Promise<SuggestionsResponse> {
  try {
    const suggestions = await getSuggestionsFromDecisionEngine(userId, context);

    return {
      source: "engine",
      contextProfile: context,
      total: suggestions.length,
      suggestions: suggestions.slice(0, 5),
    };
  } catch {
    const suggestions = getCachedSuggestions();

    return {
      source: "cache",
      contextProfile: context,
      total: suggestions.length,
      suggestions,
    };
  }
}
