import { SuggestionStrategy } from "./SuggestionStrategy.js";
import { SuggestionCatalogItem, CatalogLocationRequirement } from "../../types/suggestionsCatalog.types.js";
import { UserContext } from "../engineTypes.js";
import { CatalogScreenTimeRequirement } from "../../types/suggestionsCatalog.types.js";

export class LocationStrategy implements SuggestionStrategy {
  apply(suggestions: SuggestionCatalogItem[], context: UserContext): SuggestionCatalogItem[] {
    return suggestions.filter((s) => {
      const required = s.contextRequirements.location;
      if (required.includes("any")) return true;
      if (context.location === "unknown") return true;
      return required.includes(context.location as CatalogLocationRequirement);
    });
  }
}