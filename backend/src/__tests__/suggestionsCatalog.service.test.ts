import { suggestionsCatalog } from "../data/suggestionsCatalog.js";
import {
  getOfflineCatalogSuggestions,
  getSuggestionCatalogItemById,
  getSuggestionsCatalog,
} from "../services/suggestionsCatalog.service.js";
import {
  CatalogLocationRequirement,
  CatalogScreenTimeRequirement,
  CatalogWeatherRequirement,
  WellbeingCategory,
} from "../types/suggestionsCatalog.types.js";

describe("suggestionsCatalog", () => {
  const requiredCategories: WellbeingCategory[] = [
    "exercise",
    "nutrition",
    "sleep",
    "mental_health",
    "digital_rest",
  ];
  const validWeather: CatalogWeatherRequirement[] = [
    "sunny",
    "cloudy",
    "rain",
    "unknown",
    "any",
  ];
  const validLocation: CatalogLocationRequirement[] = [
    "indoor",
    "outdoor",
    "any",
  ];
  const validScreenTime: CatalogScreenTimeRequirement[] = [
    "low",
    "medium",
    "high",
    "any",
  ];

  it("deve conter no minimo 30 sugestoes", () => {
    expect(suggestionsCatalog.length).toBeGreaterThanOrEqual(30);
  });

  it("deve ter ids unicos", () => {
    const ids = suggestionsCatalog.map((suggestion) => suggestion.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });

  it("deve cobrir as categorias obrigatorias de bem-estar", () => {
    const categories = new Set(
      suggestionsCatalog.map((suggestion) => suggestion.wellbeingCategory)
    );

    requiredCategories.forEach((category) => {
      expect(categories.has(category)).toBe(true);
    });
  });

  it("deve ter todos os campos obrigatorios e requisitos validos", () => {
    suggestionsCatalog.forEach((suggestion) => {
      expect(suggestion.id).toEqual(expect.any(String));
      expect(suggestion.title).toEqual(expect.any(String));
      expect(suggestion.shortDescription).toEqual(expect.any(String));
      expect(suggestion.category).toEqual(expect.any(String));
      expect(requiredCategories).toContain(suggestion.wellbeingCategory);
      expect(typeof suggestion.offlineAvailable).toBe("boolean");
      expect(Array.isArray(suggestion.contextRequirements.goals)).toBe(true);
      expect(suggestion.contextRequirements.goals.length).toBeGreaterThan(0);

      suggestion.contextRequirements.weather.forEach((weather) => {
        expect(validWeather).toContain(weather);
      });
      suggestion.contextRequirements.location.forEach((location) => {
        expect(validLocation).toContain(location);
      });
      suggestion.contextRequirements.screenTimeLevel.forEach((level) => {
        expect(validScreenTime).toContain(level);
      });
    });
  });

  it("deve retornar copias do catalogo", () => {
    const catalog = getSuggestionsCatalog();

    catalog[0].contextRequirements.goals.push("mutated");

    expect(suggestionsCatalog[0].contextRequirements.goals).not.toContain(
      "mutated"
    );
  });

  it("deve buscar sugestao por id", () => {
    const suggestion = getSuggestionCatalogItemById("walk-10-minutes");

    expect(suggestion).toEqual(
      expect.objectContaining({
        id: "walk-10-minutes",
        wellbeingCategory: "exercise",
      })
    );
  });

  it("deve retornar sugestoes offline no contrato da API", () => {
    const suggestions = getOfflineCatalogSuggestions(3);

    expect(suggestions).toHaveLength(3);
    suggestions.forEach((suggestion) => {
      expect(suggestion).toHaveProperty("id");
      expect(suggestion).toHaveProperty("title");
      expect(suggestion).toHaveProperty("description");
      expect(suggestion).toHaveProperty("category");
    });
  });
});
