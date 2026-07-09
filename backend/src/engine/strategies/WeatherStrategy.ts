import { SuggestionStrategy } from "./SuggestionStrategy.js";
import { SuggestionCatalogItem, CatalogWeatherRequirement } from "../../types/suggestionsCatalog.types.js";
import { UserContext } from "../engineTypes.js";

export class WeatherStrategy implements SuggestionStrategy {
  apply(suggestions: SuggestionCatalogItem[], context: UserContext): SuggestionCatalogItem[] {
    return suggestions.filter((s) => {
      const required = s.contextRequirements.weather;
      if (required.includes("any")) return true;
      return required.includes(context.weather as CatalogWeatherRequirement);
    });
  }
}