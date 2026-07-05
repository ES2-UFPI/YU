import { Response } from "express";
import { completeGoal } from "../controllers/goals.controller.js";
import { prisma } from "../lib/prisma.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

jest.mock("../lib/prisma.js", () => ({
  prisma: {
    userGoal: {
      findFirst: jest.fn(),
    },
    goalProgress: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const prismaMock = prisma as unknown as {
  userGoal: {
    findFirst: jest.Mock;
  };
  goalProgress: {
    findUnique: jest.Mock;
    create: jest.Mock;
  };
};

function createResponse() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  return res as unknown as Response;
}

function createRequest(goalId = "read_more") {
  return {
    userId: "user-123",
    params: { goalId },
  } as unknown as AuthenticatedRequest;
}

describe("completeGoal", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 6, 3, 12));
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("deve registrar a conclusao do objetivo selecionado para hoje", async () => {
    prismaMock.userGoal.findFirst.mockResolvedValue({ id: "user-goal-1" });
    prismaMock.goalProgress.findUnique.mockResolvedValue(null);
    prismaMock.goalProgress.create.mockResolvedValue({
      id: "progress-1",
      userId: "user-123",
      goalId: "read_more",
      completedAt: new Date(2026, 6, 3),
    });

    const req = createRequest();
    const res = createResponse();

    await completeGoal(req, res);

    expect(prismaMock.userGoal.findFirst).toHaveBeenCalledWith({
      where: {
        userId: "user-123",
        goalId: "read_more",
        active: true,
      },
      select: { id: true },
    });
    expect(prismaMock.goalProgress.findUnique).toHaveBeenCalledWith({
      where: {
        userId_goalId_completedAt: {
          userId: "user-123",
          goalId: "read_more",
          completedAt: new Date(2026, 6, 3),
        },
      },
      select: { id: true },
    });
    expect(prismaMock.goalProgress.create).toHaveBeenCalledWith({
      data: {
        userId: "user-123",
        goalId: "read_more",
        completedAt: new Date(2026, 6, 3),
      },
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Objetivo concluido com sucesso.",
      goalId: "read_more",
      completedAt: "2026-07-03",
    });
  });

  it("deve retornar erro se o objetivo ja foi concluido hoje", async () => {
    prismaMock.userGoal.findFirst.mockResolvedValue({ id: "user-goal-1" });
    prismaMock.goalProgress.findUnique.mockResolvedValue({
      id: "progress-1",
    });

    const req = createRequest();
    const res = createResponse();

    await completeGoal(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: "Objetivo ja foi concluido hoje.",
      completedAt: "2026-07-03",
    });
    expect(prismaMock.goalProgress.create).not.toHaveBeenCalled();
  });

  it("deve retornar erro se o objetivo nao estiver selecionado pelo usuario", async () => {
    prismaMock.userGoal.findFirst.mockResolvedValue(null);

    const req = createRequest("sleep_better");
    const res = createResponse();

    await completeGoal(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Objetivo nao pertence aos objetivos selecionados pelo usuario.",
    });
    expect(prismaMock.goalProgress.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.goalProgress.create).not.toHaveBeenCalled();
  });
});
