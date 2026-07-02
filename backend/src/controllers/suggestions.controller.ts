import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { generateSuggestions } from "../services/suggestions.service.js";
import {
  SuggestionsRequestBody,
  UserContextProfile,
} from "../types/suggestions.types.js";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function validateContext(context: unknown): string | null {
  if (!isObject(context)) {
    return "O campo 'context' é obrigatório e deve ser um objeto.";
  }

  if (context.location !== undefined) {
    if (!isObject(context.location)) {
      return "O campo 'context.location' deve ser um objeto.";
    }

    if (
      !isFiniteNumber(context.location.latitude) ||
      !isFiniteNumber(context.location.longitude)
    ) {
      return "Os campos 'context.location.latitude' e 'context.location.longitude' devem ser números.";
    }
  }

  if (context.goals !== undefined && !Array.isArray(context.goals)) {
    return "O campo 'context.goals' deve ser uma lista de identificadores.";
  }

  if (context.screenTime !== undefined && !isObject(context.screenTime)) {
    return "O campo 'context.screenTime' deve ser um objeto.";
  }

  return null;
}

export async function getSuggestions(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.userId;
  const body = req.body as Partial<SuggestionsRequestBody>;
  const validationError = validateContext(body.context);

  if (!userId) {
    res.status(401).json({ error: "Usuário não autenticado." });
    return;
  }

  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }

  try {
    const response = await generateSuggestions(
      userId,
      body.context as UserContextProfile
    );

    res.status(200).json(response);
  } catch (error) {
    console.error("[getSuggestions]", error);
    res.status(500).json({ error: "Erro interno ao gerar sugestões." });
  }
}
