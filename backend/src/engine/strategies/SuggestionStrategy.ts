import { SuggestionCatalogItem } from "../../types/suggestionsCatalog.types.js";
import { UserContext } from "../engineTypes.js";

export interface SuggestionStrategy {
  apply(
    suggestions: SuggestionCatalogItem[],
    context: UserContext
  ): SuggestionCatalogItem[];
}