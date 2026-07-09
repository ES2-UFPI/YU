import type { MascotReaction, MascotReactionContext } from "./MascotReactionTypes";

const DEFAULT_DAILY_SUGGESTION_TARGET = 5;

/**
 * Resolve qual reacao deve ser disparada com base na transicao de estado.
 *
 * Regras:
 * - primeiro_goal -> completedSuggestionsToday passou de 0 para 1
 * - ultimo_goal   -> completedSuggestionsToday atingiu dailySuggestionTarget
 * - null          -> nenhuma reacao para esse evento
 */
export function resolveMascotReaction(
  context: MascotReactionContext
): MascotReaction | null {
  const dailySuggestionTarget = normalizeDailySuggestionTarget(
    context.dailySuggestionTarget
  );
  const current = normalizeCompleted(
    context.completedSuggestionsToday,
    dailySuggestionTarget
  );
  const previous = normalizeCompleted(
    context.previousCompletedSuggestionsToday ?? 0,
    dailySuggestionTarget
  );

  if (current === dailySuggestionTarget && previous < dailySuggestionTarget) {
    return "ultimo_goal";
  }

  if (current === 1 && previous === 0) {
    return "primeiro_goal";
  }

  return null;
}

export const REACTION_CARD_TEXT: Record<MascotReaction, string> = {
  primeiro_goal: "Primeiro goal do dia! Continue assim ",
  ultimo_goal: "Meta do dia concluída! Yu está orgulhoso ",
};

function normalizeCompleted(value: number, max: number): number {
  if (!Number.isFinite(value)) return 0;
  const v = Math.floor(value);
  if (v < 0) return 0;
  if (v > max) return max;
  return v;
}

function normalizeDailySuggestionTarget(value?: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_DAILY_SUGGESTION_TARGET;
  }
  const v = Math.floor(value);
  return v <= 0 ? DEFAULT_DAILY_SUGGESTION_TARGET : v;
}