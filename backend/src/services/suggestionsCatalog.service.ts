import { suggestionsCatalog } from "../data/suggestionsCatalog.js";
import { SuggestionCatalogItem } from "../types/suggestionsCatalog.types.js";
import { Suggestion } from "../types/suggestions.types.js";

function cloneCatalogItem(item: SuggestionCatalogItem): SuggestionCatalogItem {
  return {
    ...item,
    contextRequirements: {
      goals: [...item.contextRequirements.goals],
      weather: [...item.contextRequirements.weather],
      location: [...item.contextRequirements.location],
      screenTimeLevel: [...item.contextRequirements.screenTimeLevel],
    },
  };
}

export function getSuggestionsCatalog(): SuggestionCatalogItem[] {
  return suggestionsCatalog.map(cloneCatalogItem);
}

export function getSuggestionCatalogItemById(
  id: string
): SuggestionCatalogItem | null {
  const item = suggestionsCatalog.find((suggestion) => suggestion.id === id);

  return item ? cloneCatalogItem(item) : null;
}

export function getOfflineCatalogSuggestions(limit = 3): Suggestion[] {
  return suggestionsCatalog
    .filter((suggestion) => suggestion.offlineAvailable)
    .slice(0, limit)
    .map((suggestion) => ({
      id: suggestion.id,
      title: suggestion.title,
      description: suggestion.shortDescription,
      category: suggestion.category,
    }));
}
