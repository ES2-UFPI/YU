import { apiFetch } from "./api";
import { getAnonymousIdToken } from "./firebase";

export type ProgressIndicators = {
  completedSuggestionsToday: number;
  dailySuggestionTarget: number;
  completionRateToday: number;
  weeklyRate: number;
  currentStreak: number;
};

type ProgressResponse = Partial<ProgressIndicators> & {
  error?: string;
  erro?: string;
};

const EMPTY_PROGRESS: ProgressIndicators = {
  completedSuggestionsToday: 0,
  dailySuggestionTarget: 0,
  completionRateToday: 0,
  weeklyRate: 0,
  currentStreak: 0,
};

export async function getDailyProgress(): Promise<ProgressIndicators> {
  const token = await getAnonymousIdToken();
  const response = await apiFetch("/users/progress", token);
  const data = (await response.json().catch(() => ({}))) as ProgressResponse;

  if (!response.ok) {
    throw new Error(
      data.error || data.erro || "Nao foi possivel carregar o progresso diario."
    );
  }

  return {
    ...EMPTY_PROGRESS,
    ...data,
  };
}
