import { Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
 
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
