import type {
  MascotContext,
  MascotState,
  MascotSuggestionHistoryDay,
} from "./mascotTypes";

const DEFAULT_DAILY_SUGGESTION_TARGET = 5;

/**
 * Prioridade dos estados:
 * 1. doente  -> 0 sugestoes hoje e 0 sugestoes ontem
 * 2. triste  -> 0 sugestoes hoje, sem confirmar dois dias seguidos sem acao
 * 3. neutro  -> 1 sugestao concluida hoje
 * 4. feliz   -> 2 ou 3 sugestoes concluidas hoje
 * 5. animado -> 4 ou 5 sugestoes concluidas hoje
 *
 * O historico deve ser fornecido ja preparado pela camada chamadora. Quando
 * presente, o ultimo registro representa ontem, conforme a documentacao final.
 */
export function resolveMascotState(context: MascotContext): MascotState {
  const dailySuggestionTarget = normalizeDailySuggestionTarget(
    context.dailySuggestionTarget
  );
  const completedSuggestionsToday = normalizeCompletedSuggestions(
    context.completedSuggestionsToday,
    dailySuggestionTarget
  );
  const yesterdayCompletedSuggestions = getYesterdayCompletedSuggestions(
    context.history
  );

  if (
    completedSuggestionsToday === 0 &&
    yesterdayCompletedSuggestions !== null &&
    yesterdayCompletedSuggestions === 0
  ) {
    return "doente";
  }

  if (completedSuggestionsToday === 0) {
    return "triste";
  }

  if (completedSuggestionsToday === 1) {
    return "neutro";
  }

  if (completedSuggestionsToday >= 2 && completedSuggestionsToday <= 3) {
    return "feliz";
  }

  return "animado";
}

function normalizeCompletedSuggestions(value: number, max: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const normalizedValue = Math.floor(value);

  if (normalizedValue < 0) {
    return 0;
  }

  if (normalizedValue > max) {
    return max;
  }

  return normalizedValue;
}

function getYesterdayCompletedSuggestions(
  history?: MascotSuggestionHistoryDay[]
): number | null {
  if (!history || history.length === 0) {
    return null;
  }

  const yesterday = history[history.length - 1];

  return normalizeCompletedSuggestions(
    yesterday.completedSuggestions,
    DEFAULT_DAILY_SUGGESTION_TARGET
  );
}

function normalizeDailySuggestionTarget(value?: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_DAILY_SUGGESTION_TARGET;
  }

  const normalizedValue = Math.floor(value);

  if (normalizedValue <= 0) {
    return DEFAULT_DAILY_SUGGESTION_TARGET;
  }

  return normalizedValue;
}
