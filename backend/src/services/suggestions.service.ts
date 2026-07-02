import {
  Suggestion,
  SuggestionsResponse,
  UserContextProfile,
} from "../types/suggestions.types.js";
import { getOfflineCatalogSuggestions } from "./suggestionsCatalog.service.js";

async function getSuggestionsFromDecisionEngine(
  _userId: string,
  _context: UserContextProfile
): Promise<Suggestion[]> {
  throw new Error("Decision engine is not available yet.");
}

function getCachedSuggestions(): Suggestion[] {
  return getOfflineCatalogSuggestions(3);
}

export async function generateSuggestions(
  userId: string,
  context: UserContextProfile
): Promise<SuggestionsResponse> {
  try {
    const suggestions = await getSuggestionsFromDecisionEngine(userId, context);

    return {
      source: "engine",
      total: suggestions.length,
      suggestions: suggestions.slice(0, 5),
    };
  } catch {
    const suggestions = getCachedSuggestions();

    return {
      source: "cache",
      total: suggestions.length,
      suggestions,
    };
  }
}
