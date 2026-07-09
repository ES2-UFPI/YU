import { Response } from "express";
import { getProgress } from "../controllers/progress.controller.js";
import { prisma } from "../lib/prisma.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { buildUserContextProfile } from "../services/contextProfile.service.js";
import { generateSuggestions } from "../services/suggestions.service.js";

jest.mock("../lib/prisma.js", () => ({
  prisma: {
    suggestionProgress: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock("../services/contextProfile.service.js", () => ({
  buildUserContextProfile: jest.fn(),
}));

jest.mock("../services/suggestions.service.js", () => ({
  generateSuggestions: jest.fn(),
}));

const prismaMock = prisma as unknown as {
  suggestionProgress: {
    findMany: jest.Mock;
  };
};
const buildUserContextProfileMock = buildUserContextProfile as jest.Mock;
const generateSuggestionsMock = generateSuggestions as jest.Mock;

function createResponse() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  return res as unknown as Response;
}

function createRequest(userId = "user-123") {
  return {
    userId,
  } as AuthenticatedRequest;
}

function createUnauthenticatedRequest() {
  return {} as AuthenticatedRequest;
}

describe("getProgress", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 6, 10, 12));
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("deve retornar os indicadores de progresso do usuario autenticado", async () => {
    const contextProfile = {
      userId: "user-123",
      generatedAt: "2026-07-10T12:00:00.000Z",
      goals: ["hydration"],
      location: {
        granted: false,
        latitude: null,
        longitude: null,
        capturedAt: null,
      },
      weather: {
        available: false,
        temperatureCelsius: null,
        condition: "unknown",
        observedAt: null,
      },
      screenTime: {
        source: "mock",
        totalMinutes: 0,
        apps: {
          instagramMinutes: 0,
          whatsappMinutes: 0,
          readingMinutes: 0,
        },
        byCategory: {},
      },
      timeOfDay: "afternoon",
    };

    buildUserContextProfileMock.mockResolvedValue(contextProfile);
    generateSuggestionsMock.mockResolvedValue({
      source: "engine",
      contextProfile,
      total: 4,
      suggestions: [
        { id: "drink-water" },
        { id: "read-pages" },
        { id: "study-focus" },
        { id: "hydrate-break" },
      ],
    });
    prismaMock.suggestionProgress.findMany.mockResolvedValue([
      { suggestionId: "drink-water", completedAt: new Date(2026, 6, 10) },
      { suggestionId: "read-pages", completedAt: new Date(2026, 6, 10) },
      { suggestionId: "study-focus", completedAt: new Date(2026, 6, 9) },
      { suggestionId: "hydrate-break", completedAt: new Date(2026, 6, 8) },
      { suggestionId: "screen-break", completedAt: new Date(2026, 6, 8) },
      { suggestionId: "short-walk", completedAt: new Date(2026, 6, 6) },
    ]);

    const req = createRequest();
    const res = createResponse();

    await getProgress(req, res);

    expect(buildUserContextProfileMock).toHaveBeenCalledWith(
      "user-123",
      new Date(2026, 6, 10, 12)
    );
    expect(generateSuggestionsMock).toHaveBeenCalledWith(
      "user-123",
      contextProfile
    );
    expect(prismaMock.suggestionProgress.findMany).toHaveBeenCalledWith({
      where: {
        userId: "user-123",
        completedAt: {
          lt: new Date(2026, 6, 11),
        },
      },
      select: {
        suggestionId: true,
        completedAt: true,
      },
      orderBy: {
        completedAt: "desc",
      },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      completedSuggestionsToday: 2,
      dailySuggestionTarget: 4,
      completionRateToday: 50,
      weeklyRate: 57.14,
      currentStreak: 3,
      weeklyHistory: [
        { day: 1, hasSuggestionDone: true },
        { day: 2, hasSuggestionDone: false },
        { day: 3, hasSuggestionDone: true },
        { day: 4, hasSuggestionDone: true },
        { day: 5, hasSuggestionDone: true },
        { day: 6, hasSuggestionDone: false },
        { day: 7, hasSuggestionDone: false },
      ],
    });
  });

  it("deve retornar indicadores zerados quando nao houver sugestoes disponiveis", async () => {
    const contextProfile = {
      userId: "user-123",
      generatedAt: "2026-07-10T12:00:00.000Z",
      goals: [],
    };
    buildUserContextProfileMock.mockResolvedValue(contextProfile);
    generateSuggestionsMock.mockResolvedValue({
      source: "cache",
      contextProfile,
      total: 0,
      suggestions: [],
    });
    prismaMock.suggestionProgress.findMany.mockResolvedValue([]);

    const req = createRequest();
    const res = createResponse();

    await getProgress(req, res);

    expect(prismaMock.suggestionProgress.findMany).toHaveBeenCalledWith({
      where: {
        userId: "user-123",
        completedAt: {
          lt: new Date(2026, 6, 11),
        },
      },
      select: {
        suggestionId: true,
        completedAt: true,
      },
      orderBy: {
        completedAt: "desc",
      },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      completedSuggestionsToday: 0,
      dailySuggestionTarget: 0,
      completionRateToday: 0,
      weeklyRate: 0,
      currentStreak: 0,
      weeklyHistory: [
        { day: 1, hasSuggestionDone: false },
        { day: 2, hasSuggestionDone: false },
        { day: 3, hasSuggestionDone: false },
        { day: 4, hasSuggestionDone: false },
        { day: 5, hasSuggestionDone: false },
        { day: 6, hasSuggestionDone: false },
        { day: 7, hasSuggestionDone: false },
      ],
    });
  });

  it("deve calcular streak a partir do historico real, mesmo com sugestoes diferentes das atuais", async () => {
    const contextProfile = {
      userId: "user-123",
      generatedAt: "2026-07-10T12:00:00.000Z",
      goals: ["hydration"],
    };
    buildUserContextProfileMock.mockResolvedValue(contextProfile);
    generateSuggestionsMock.mockResolvedValue({
      source: "engine",
      contextProfile,
      total: 2,
      suggestions: [{ id: "drink-water" }, { id: "read-pages" }],
    });
    prismaMock.suggestionProgress.findMany.mockResolvedValue([
      { suggestionId: "old-suggestion-today", completedAt: new Date(2026, 6, 10) },
      { suggestionId: "old-suggestion-yesterday", completedAt: new Date(2026, 6, 9) },
    ]);

    const req = createRequest();
    const res = createResponse();

    await getProgress(req, res);

    expect(prismaMock.suggestionProgress.findMany).toHaveBeenCalledWith({
      where: {
        userId: "user-123",
        completedAt: {
          lt: new Date(2026, 6, 11),
        },
      },
      select: {
        suggestionId: true,
        completedAt: true,
      },
      orderBy: {
        completedAt: "desc",
      },
    });
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        completedSuggestionsToday: 1,
        currentStreak: 2,
        weeklyHistory: expect.arrayContaining([
          { day: 4, hasSuggestionDone: true },
          { day: 5, hasSuggestionDone: true },
        ]),
      })
    );
  });

  it("deve retornar 401 quando nao houver usuario autenticado", async () => {
    const req = createUnauthenticatedRequest();
    const res = createResponse();

    await getProgress(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Usuario nao autenticado.",
    });
    expect(buildUserContextProfileMock).not.toHaveBeenCalled();
    expect(generateSuggestionsMock).not.toHaveBeenCalled();
    expect(prismaMock.suggestionProgress.findMany).not.toHaveBeenCalled();
  });
});
