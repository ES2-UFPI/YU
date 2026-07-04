import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { getUserProgress } from "../services/progress.service.js";

export async function getProgress(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ error: "Usuario nao autenticado." });
    return;
  }

  try {
    const progress = await getUserProgress(userId);

    res.status(200).json(progress);
  } catch (error) {
    console.error("[getProgress]", error);
    res.status(500).json({
      error: "Erro interno ao buscar indicadores de progresso.",
    });
  }
}
