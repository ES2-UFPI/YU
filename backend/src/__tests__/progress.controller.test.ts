import { Response } from "express";
import { getProgress } from "../controllers/progress.controller.js";
import { prisma } from "../lib/prisma.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

jest.mock("../lib/prisma.js", () => ({
  prisma: {
    userGoal: {
      count: jest.fn(),
    },
    goalProgress: {
      findMany: jest.fn(),
    },
  },
}));

const prismaMock = prisma as unknown as {
  userGoal: {
    count: jest.Mock;
  };
  goalProgress: {
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
    prismaMock.goalProgress.findMany.mockResolvedValue([
      { goalId: "hydration", completedAt: new Date(2026, 6, 10) },
      { goalId: "read_more", completedAt: new Date(2026, 6, 10) },
      { goalId: "study", completedAt: new Date(2026, 6, 9) },
      { goalId: "hydration", completedAt: new Date(2026, 6, 8) },
      { goalId: "screen_time_balance", completedAt: new Date(2026, 6, 8) },
      { goalId: "physical_activity", completedAt: new Date(2026, 6, 6) },
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
    expect(prismaMock.goalProgress.findMany).toHaveBeenCalledWith({
      where: {
        userId: "user-123",
        completedAt: {
          gte: "2026-07-04",
          lte: "2026-07-10",
        },
      },
      select: {
        goalId: true,
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

    expect(prismaMock.goalProgress.findMany).not.toHaveBeenCalled();
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
    expect(prismaMock.goalProgress.findMany).not.toHaveBeenCalled();
  });
});
