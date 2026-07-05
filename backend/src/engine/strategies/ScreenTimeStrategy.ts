import { SuggestionStrategy } from "./SuggestionStrategy.js";
import { SuggestionCatalogItem } from "../../types/suggestionsCatalog.types.js";
import { UserContext } from "../engineTypes.js";
import { CatalogScreenTimeRequirement } from "../../types/suggestionsCatalog.types.js";

function deriveLevel(socialMinutes: number): "low" | "medium" | "high" {
  if (socialMinutes > 120) return "high";
  if (socialMinutes >= 60) return "medium";
  return "low";
}

export class ScreenTimeStrategy implements SuggestionStrategy {
  apply(suggestions: SuggestionCatalogItem[], context: UserContext): SuggestionCatalogItem[] {
    const level = deriveLevel(context.screenTime.socialMinutes);

    const scored = suggestions.map((s) => {
      let score = 0;

      const levels = s.contextRequirements.screenTimeLevel;
      if (levels.includes("any") || levels.includes(level as CatalogScreenTimeRequirement)) {
        score += 1;
      }

      if (level === "high") {
        if (
          s.wellbeingCategory === "digital_rest" ||
          s.category === "rest"
        ) {
          score += 2;
        }
      }

      if (level === "medium") {
        if (s.wellbeingCategory === "digital_rest") score += 1;
      }

      return { ...s, _score: score };
    });

    return scored
      .sort((a, b) => b._score - a._score)
      .map(({ _score, ...s }) => s);
  }
}