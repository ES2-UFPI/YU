import { SuggestionStrategy } from "./SuggestionStrategy.js";
import { SuggestionCatalogItem } from "../../types/suggestionsCatalog.types.js";
import { UserContext } from "../engineTypes.js";

export class OfflineStrategy implements SuggestionStrategy {
  apply(suggestions: SuggestionCatalogItem[], context: UserContext): SuggestionCatalogItem[] {
    if (!context.isOffline) return suggestions;
    return suggestions.filter((s) => s.offlineAvailable);
  }
}