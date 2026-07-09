import { Response } from "express";
import { getSuggestions } from "../controllers/suggestions.controller.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

jest.mock("../lib/prisma.js", () => ({
  prisma: {
    userGoal: {
      findMany: jest.fn().mockResolvedValue([
        { goalId: "screen_time_balance" },
        { goalId: "read_more" },
      ]),
    },
    userLocation: {
      findFirst: jest.fn().mockResolvedValue(null),
    },
  },
}));

function createResponse() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  return res as unknown as Response;
}

describe("getSuggestions", () => {
  it("deve retornar 401 quando não houver usuário autenticado", async () => {
    const req = {
      body: {},
    } as AuthenticatedRequest;
    const res = createResponse();

    await getSuggestions(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Usuário não autenticado.",
    });
  });

  it("deve montar o perfil de contexto no ciclo de sugestão", async () => {
    const req = {
      userId: "user-123",
      body: {},
    } as AuthenticatedRequest;
    const res = createResponse();

    await getSuggestions(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        contextProfile: expect.objectContaining({
          userId: "user-123",
          goals: ["screen_time_balance", "read_more"],
          location: expect.objectContaining({
            granted: false,
            latitude: null,
            longitude: null,
          }),
          weather: expect.objectContaining({
            available: false,
            condition: "unknown",
          }),
          screenTime: expect.objectContaining({
            source: "mock",
            apps: expect.objectContaining({
              instagramMinutes: expect.any(Number),
              whatsappMinutes: expect.any(Number),
              readingMinutes: expect.any(Number),
            }),
          }),
        }),
      })
    );
  });
});
