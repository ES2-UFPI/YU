import {
  deriveScreenTimeLevel,
  filterByGoals,
  filterByWeather,
  filterByLocation,
  filterByOffline,
  rankByScreenTime,
  selectSuggestions,
} from "../engine/suggestionEngine.js";
import { SuggestionCatalogItem } from "../types/suggestionsCatalog.types.js";
import { UserContext } from "../engine/engineTypes.js";

const mockCatalog: SuggestionCatalogItem[] = [
  {
    id: "walk-sunny",
    title: "Caminhe ao sol",
    shortDescription: "Caminhada ao ar livre.",
    category: "physical_activity",
    wellbeingCategory: "exercise",
    contextRequirements: {
      goals: ["physical_activity"],
      weather: ["sunny"],
      location: ["outdoor"],
      screenTimeLevel: ["any"],
    },
    offlineAvailable: false,
  },
  {
    id: "drink-water",
    title: "Beba água",
    shortDescription: "Hidrate-se.",
    category: "wellbeing",
    wellbeingCategory: "nutrition",
    contextRequirements: {
      goals: ["hydration"],
      weather: ["any"],
      location: ["any"],
      screenTimeLevel: ["any"],
    },
    offlineAvailable: true,
  },
  {
    id: "screen-break",
    title: "Pausa de tela",
    shortDescription: "Descanse dos apps.",
    category: "digital_balance",
    wellbeingCategory: "digital_rest",
    contextRequirements: {
      goals: ["screen_time_balance"],
      weather: ["any"],
      location: ["any"],
      screenTimeLevel: ["medium", "high"],
    },
    offlineAvailable: true,
  },
  {
    id: "indoor-exercise",
    title: "Exercite-se em casa",
    shortDescription: "Série rápida indoor.",
    category: "physical_activity",
    wellbeingCategory: "exercise",
    contextRequirements: {
      goals: ["physical_activity"],
      weather: ["rain", "any"],
      location: ["indoor"],
      screenTimeLevel: ["any"],
    },
    offlineAvailable: true,
  },
];

describe("deriveScreenTimeLevel", () => {
  it("deve retornar low quando social < 60 min", () => {
    expect(deriveScreenTimeLevel(30)).toBe("low");
  });

  it("deve retornar medium quando social entre 60 e 120 min", () => {
    expect(deriveScreenTimeLevel(90)).toBe("medium");
  });

  it("deve retornar high quando social > 120 min", () => {
    expect(deriveScreenTimeLevel(150)).toBe("high");
  });

  it("deve retornar low quando social = 0", () => {
    expect(deriveScreenTimeLevel(0)).toBe("low");
  });
});

describe("filterByGoals", () => {
  it("deve manter sugestões compatíveis com os objetivos", () => {
    const result = filterByGoals(mockCatalog, ["hydration"]);
    expect(result.map((s) => s.id)).toContain("drink-water");
  });

  it("deve remover sugestões incompatíveis com os objetivos", () => {
    const result = filterByGoals(mockCatalog, ["hydration"]);
    expect(result.map((s) => s.id)).not.toContain("walk-sunny");
  });
});

describe("filterByWeather", () => {
  it("deve manter sugestões compatíveis com o clima", () => {
    const result = filterByWeather(mockCatalog, "sunny");
    expect(result.map((s) => s.id)).toContain("walk-sunny");
  });

  it("deve remover sugestões incompatíveis com o clima", () => {
    const result = filterByWeather(mockCatalog, "rain");
    expect(result.map((s) => s.id)).not.toContain("walk-sunny");
  });

  it("deve manter sugestões com weather any em qualquer clima", () => {
    const result = filterByWeather(mockCatalog, "rain");
    expect(result.map((s) => s.id)).toContain("drink-water");
  });
});

describe("filterByLocation", () => {
  it("deve manter sugestões compatíveis com a localização", () => {
    const result = filterByLocation(mockCatalog, "outdoor");
    expect(result.map((s) => s.id)).toContain("walk-sunny");
  });

  it("deve remover sugestões incompatíveis com a localização", () => {
    const result = filterByLocation(mockCatalog, "outdoor");
    expect(result.map((s) => s.id)).not.toContain("indoor-exercise");
  });

  it("deve manter todas quando localização é unknown", () => {
    const result = filterByLocation(mockCatalog, "unknown");
    expect(result.length).toBe(mockCatalog.length);
  });
});

describe("filterByOffline", () => {
  it("deve manter apenas offlineAvailable quando offline", () => {
    const result = filterByOffline(mockCatalog, true);
    expect(result.every((s) => s.offlineAvailable)).toBe(true);
  });

  it("deve manter todas as sugestões quando online", () => {
    const result = filterByOffline(mockCatalog, false);
    expect(result.length).toBe(mockCatalog.length);
  });
});

describe("rankByScreenTime", () => {
  it("deve dar score maior para digital_rest quando screenTime é high", () => {
    const ranked = rankByScreenTime(mockCatalog, "high");
    const screenBreak = ranked.find((s) => s.id === "screen-break")!;
    const drinkWater = ranked.find((s) => s.id === "drink-water")!;
    expect(screenBreak.score).toBeGreaterThanOrEqual(drinkWater.score);
  });
});

describe("selectSuggestions", () => {
  const context: UserContext = {
    goals: ["physical_activity", "hydration", "screen_time_balance"],
    weather: "sunny",
    location: "outdoor",
    screenTime: {
      totalMinutes: 300,
      socialMinutes: 150,
      entertainmentMinutes: 100,
    },
    isOffline: false,
  };

  it("deve retornar no máximo 5 sugestões", () => {
    const result = selectSuggestions(mockCatalog, context);
    expect(result.length).toBeLessThanOrEqual(5);
  });

  it("deve retornar sugestões com score definido", () => {
    const result = selectSuggestions(mockCatalog, context);
    result.forEach((s) => expect(s.score).toBeDefined());
  });

  it("deve funcionar offline retornando só offlineAvailable", () => {
    const offlineContext: UserContext = { ...context, isOffline: true };
    const result = selectSuggestions(mockCatalog, offlineContext);
    result.forEach((s) => expect(s.offlineAvailable).toBe(true));
  });

  it("deve priorizar digital_rest quando uso social é alto", () => {
    const highScreenContext: UserContext = {
      ...context,
      goals: ["screen_time_balance"],
      screenTime: {
        totalMinutes: 400,
        socialMinutes: 200,
        entertainmentMinutes: 150,
      },
    };
    const result = selectSuggestions(mockCatalog, highScreenContext);
    const hasDigitalRest = result.some(
      (s) => s.wellbeingCategory === "digital_rest"
    );
    expect(hasDigitalRest).toBe(true);
  });
});