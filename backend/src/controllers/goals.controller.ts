import { Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}
 
export async function saveGoals(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.userId!;
  const { goalIds } = req.body;
 
  if (!Array.isArray(goalIds) || goalIds.length === 0) {
    res.status(400).json({
      error: "O campo 'goalIds' deve ser um array com pelo menos um item.",
    });
    return;
  }
 
  try {
    const found = await prisma.wellnessGoal.findMany({
      where: { id: { in: goalIds } },
      select: { id: true },
    });
 
    const foundIds = found.map((g) => g.id);
    const invalidIds = goalIds.filter(
      (id: string) => !foundIds.includes(id)
    );
 
    if (invalidIds.length > 0) {
      res.status(422).json({
        error: "Um ou mais objetivos não foram encontrados ou estão inativos.",
        invalidIds,
      });
      return;
    }
 
    await prisma.userGoal.updateMany({
      where: { userId, active: true },
      data: { active: false },
    });
 
    const saved = await Promise.all(
      goalIds.map((goalId: string) =>
        prisma.userGoal.upsert({
          where: { userId_goalId: { userId, goalId } },
          update: { active: true, savedAt: new Date() },
          create: { userId, goalId },
          include: {
            wellnessGoal: {
              select: {
                id: true,
                name: true,
                shortDescription: true,
                icon: true,
              },
            },
          },
        })
      )
    );
 
    res.status(201).json({
      message: "Objetivos salvos com sucesso.",
      total: saved.length,
      goals: saved.map((s) => s.wellnessGoal),
    });
  } catch (error) {
    console.error("[saveGoals]", error);
    res.status(500).json({ error: "Erro interno ao salvar objetivos." });
  }
}

export async function getGoals(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.userId!;

  try {
    const records = await prisma.userGoal.findMany({
      where: { userId, active: true },
      orderBy: { savedAt: "desc" },
      include: {
        wellnessGoal: {        
          select: {
            id: true,
            name: true,
            shortDescription: true,  
            icon: true,
          },
        },
      },
    });

    if (records.length === 0) {
      res.status(200).json({
        message: "Nenhum objetivo selecionado ainda.",
        total: 0,
        goals: [],
      });
      return;
    }

    res.status(200).json({
      total: records.length,
      goals: records.map((r) => ({
        id: r.wellnessGoal.id,                   
        name: r.wellnessGoal.name,             
        description: r.wellnessGoal.shortDescription,  
        icon: r.wellnessGoal.icon,              
        active: r.active,
        savedAt: r.savedAt,
      })),
    });
  } catch (error) {
    console.error("[getGoals]", error);
    res.status(500).json({ error: "Erro interno ao buscar objetivos." });
  }
}

export async function completeGoal(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.userId!;
  const goalIdParam = req.params.goalId;
  const goalId = Array.isArray(goalIdParam) ? goalIdParam[0] : goalIdParam;
  const completedAt = getTodayDateString();

  if (!goalId) {
    res.status(400).json({ error: "Parametro 'goalId' e obrigatorio." });
    return;
  }

  try {
    const selectedGoal = await prisma.userGoal.findFirst({
      where: {
        userId,
        goalId,
        active: true,
      },
      select: { id: true },
    });

    if (!selectedGoal) {
      res.status(404).json({
        error: "Objetivo nao pertence aos objetivos selecionados pelo usuario.",
      });
      return;
    }

    const existingCompletion = await prisma.goalProgress.findUnique({
      where: {
        userId_goalId_completedAt: {
          userId,
          goalId,
          completedAt,
        },
      },
      select: { id: true },
    });

    if (existingCompletion) {
      res.status(409).json({
        error: "Objetivo ja foi concluido hoje.",
        completedAt,
      });
      return;
    }

    await prisma.goalProgress.create({
      data: {
        userId,
        goalId,
        completedAt,
      },
    });

    res.status(201).json({
      message: "Objetivo concluido com sucesso.",
      goalId,
      completedAt,
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      res.status(409).json({
        error: "Objetivo ja foi concluido hoje.",
        completedAt,
      });
      return;
    }

    console.error("[completeGoal]", error);
    res.status(500).json({ error: "Erro interno ao concluir objetivo." });
  }
}
