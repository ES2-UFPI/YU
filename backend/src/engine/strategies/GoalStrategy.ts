import { SuggestionStrategy } from "./SuggestionStrategy.js";
import { SuggestionCatalogItem } from "../../types/suggestionsCatalog.types.js";
import { UserContext } from "../engineTypes.js";

export class GoalStrategy implements SuggestionStrategy {
  apply(suggestions: SuggestionCatalogItem[], context: UserContext): SuggestionCatalogItem[] {
    return suggestions.filter((s) => {
      const required = s.contextRequirements.goals;
      if (required.includes("any")) return true;
      return required.some((g) => context.goals.includes(g));
    });
  }
}