import { Response } from "express";
import { getProgress } from "../controllers/progress.controller.js";
import { prisma } from "../lib/prisma.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

jest.mock("../lib/prisma.js", () => ({
  prisma: {
    userGoal: {
      count: jest.fn(),
    },
    suggestionProgress: {
      findMany: jest.fn(),
    },
  },
}));

const prismaMock = prisma as unknown as {
  userGoal: {
    count: jest.Mock;
  };
  suggestionProgress: {
    findMany: jest.Mock;
  };
};

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
    prismaMock.userGoal.count.mockResolvedValue(4);
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

    expect(prismaMock.userGoal.count).toHaveBeenCalledWith({
      where: {
        userId: "user-123",
        active: true,
      },
    });
    expect(prismaMock.suggestionProgress.findMany).toHaveBeenCalledWith({
      where: {
        userId: "user-123",
        completedAt: {
          gte: new Date(2026, 6, 4),
          lte: new Date(2026, 6, 10),
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
      completedToday: 2,
      totalGoals: 4,
      completionRateToday: 50,
      weeklyRate: 21.43,
      currentStreak: 3,
    });
  });

  it("deve retornar indicadores zerados quando o usuario nao tiver objetivos ativos", async () => {
    prismaMock.userGoal.count.mockResolvedValue(0);

    const req = createRequest();
    const res = createResponse();

    await getProgress(req, res);

    expect(prismaMock.suggestionProgress.findMany).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      completedToday: 0,
      totalGoals: 0,
      completionRateToday: 0,
      weeklyRate: 0,
      currentStreak: 0,
    });
  });

  it("deve retornar 401 quando nao houver usuario autenticado", async () => {
    const req = createUnauthenticatedRequest();
    const res = createResponse();

    await getProgress(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Usuario nao autenticado.",
    });
    expect(prismaMock.userGoal.count).not.toHaveBeenCalled();
    expect(prismaMock.suggestionProgress.findMany).not.toHaveBeenCalled();
  });
});
