import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { generateSuggestions } from "../services/suggestions.service.js";
import { buildUserContextProfile } from "../services/contextProfile.service.js";
import { prisma } from "../lib/prisma.js";
import { getSuggestionCatalogItemById } from "../services/suggestionsCatalog.service.js";

const SUGGESTION_ALREADY_COMPLETED_TODAY_ERROR =
  "Sugestao ja foi concluida hoje.";

function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTodayDateOnly(): Date {
  const today = new Date();

  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

function getSingleParam(
  value: string | string[] | undefined
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

function sendAlreadyCompletedTodayResponse(
  res: Response,
  completedAt: string
): void {
  res.status(409).json({
    error: SUGGESTION_ALREADY_COMPLETED_TODAY_ERROR,
    completedAt,
  });
}

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

export async function completeSuggestion(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.userId;
  const suggestionId = getSingleParam(req.params.suggestionId);
  const completedAtDate = getTodayDateOnly();
  const completedAt = formatDateOnly(completedAtDate);

  if (!userId) {
    res.status(401).json({ error: "Usuário não autenticado." });
    return;
  }

  if (!suggestionId) {
    res.status(400).json({ error: "Parametro 'suggestionId' e obrigatorio." });
    return;
  }

  const suggestion = getSuggestionCatalogItemById(suggestionId);

  if (!suggestion) {
    res.status(404).json({ error: "Sugestao nao encontrada no catalogo." });
    return;
  }

  try {
    const existingCompletion = await prisma.suggestionProgress.findUnique({
      where: {
        userId_suggestionId_completedAt: {
          userId,
          suggestionId,
          completedAt: completedAtDate,
        },
      },
      select: { id: true },
    });

    if (existingCompletion) {
      sendAlreadyCompletedTodayResponse(res, completedAt);
      return;
    }

    await prisma.suggestionProgress.create({
      data: {
        userId,
        suggestionId,
        completedAt: completedAtDate,
      },
    });

    res.status(201).json({
      message: "Sugestao concluida com sucesso.",
      suggestionId,
      completedAt,
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      sendAlreadyCompletedTodayResponse(res, completedAt);
      return;
    }

    console.error("[completeSuggestion]", error);
    res.status(500).json({ error: "Erro interno ao concluir sugestao." });
  }
}
