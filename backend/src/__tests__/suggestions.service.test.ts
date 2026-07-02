import { generateSuggestions } from "../services/suggestions.service.js";
import { UserContextProfile } from "../types/suggestions.types.js";

describe("generateSuggestions", () => {
  const context: UserContextProfile = {
    location: {
      latitude: -3.7319,
      longitude: -38.5267,
    },
    screenTime: {
      totalMinutes: 320,
      byCategory: {
        social: 140,
        entertainment: 90,
      },
    },
    goals: ["reduce_screen_time", "sleep_better"],
  };

  it("deve retornar sugestões do cache enquanto o motor não estiver disponível", async () => {
    const response = await generateSuggestions("user-123", context);

    expect(response.source).toBe("cache");
  });

  it("deve retornar entre 3 e 5 sugestões", async () => {
    const response = await generateSuggestions("user-123", context);

    expect(response.suggestions.length).toBeGreaterThanOrEqual(3);
    expect(response.suggestions.length).toBeLessThanOrEqual(5);
    expect(response.total).toBe(response.suggestions.length);
  });

  it("deve retornar sugestões com os campos obrigatórios do contrato", async () => {
    const response = await generateSuggestions("user-123", context);

    response.suggestions.forEach((suggestion) => {
      expect(suggestion).toHaveProperty("id");
      expect(suggestion).toHaveProperty("title");
      expect(suggestion).toHaveProperty("description");
      expect(suggestion).toHaveProperty("category");
    });
  });
});
