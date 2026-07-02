import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { generateSuggestions } from "../services/suggestions.service.js";
import { buildUserContextProfile } from "../services/contextProfile.service.js";

export async function getSuggestions(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ error: "Usuário não autenticado." });
    return;
  }

  try {
    const contextProfile = await buildUserContextProfile(userId);
    const response = await generateSuggestions(userId, contextProfile);

    res.status(200).json(response);
  } catch (error) {
    console.error("[getSuggestions]", error);
    res.status(500).json({ error: "Erro interno ao gerar sugestões." });
  }
}
