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
  const validCategories: WellbeingCategory[] = [
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
  const validGoalIds = [
    "hydration",
    "screen_time_balance",
    "physical_activity",
    "read_more",
    "study",
    "healthy_eating",
  ];

  it("deve conter no minimo 30 sugestoes", () => {
    const suggestionsCatalog = getSuggestionsCatalog();

    expect(suggestionsCatalog.length).toBeGreaterThanOrEqual(30);
  });

  it("deve ter ids unicos", () => {
    const suggestionsCatalog = getSuggestionsCatalog();
    const ids = suggestionsCatalog.map((suggestion) => suggestion.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });

  it("deve ter todos os campos obrigatorios e requisitos validos", () => {
    const suggestionsCatalog = getSuggestionsCatalog();

    suggestionsCatalog.forEach((suggestion) => {
      expect(suggestion.id).toEqual(expect.any(String));
      expect(suggestion.title).toEqual(expect.any(String));
      expect(suggestion.shortDescription).toEqual(expect.any(String));
      expect(suggestion.category).toEqual(expect.any(String));
      expect(validCategories).toContain(suggestion.wellbeingCategory);
      expect(typeof suggestion.offlineAvailable).toBe("boolean");
      expect(Array.isArray(suggestion.contextRequirements.goals)).toBe(true);
      expect(suggestion.contextRequirements.goals.length).toBeGreaterThan(0);
      suggestion.contextRequirements.goals.forEach((goalId) => {
        expect(validGoalIds).toContain(goalId);
      });

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

    expect(getSuggestionsCatalog()[0].contextRequirements.goals).not.toContain(
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
