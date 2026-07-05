import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { SuggestionCatalogItem } from "../types/suggestionsCatalog.types.js";
import { Suggestion } from "../types/suggestions.types.js";

const catalogPath = resolve(process.cwd(), "data", "suggestionsCatalog.json");

function loadSuggestionsCatalog(): SuggestionCatalogItem[] {
  const rawCatalog = readFileSync(catalogPath, "utf8");

  return JSON.parse(rawCatalog) as SuggestionCatalogItem[];
}

const suggestionsCatalog = loadSuggestionsCatalog();

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

export function getSuggestionsCatalog(): SuggestionCatalogItem[] {
  return suggestionsCatalog.map(cloneCatalogItem);
}
