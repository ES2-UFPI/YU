import { apiFetch } from "./api";
import { getAnonymousIdToken } from "./firebase";

export type ProgressIndicators = {
  completedSuggestionsToday: number;
  dailySuggestionTarget: number;
  completionRateToday: number;
  weeklyRate: number;
  currentStreak: number;
  weeklyHistory: WeeklyHistoryDay[];
};

export type WeeklyHistoryDay = {
  day: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  hasSuggestionDone: boolean;
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
  weeklyHistory: [
    { day: 1, hasSuggestionDone: false },
    { day: 2, hasSuggestionDone: false },
    { day: 3, hasSuggestionDone: false },
    { day: 4, hasSuggestionDone: false },
    { day: 5, hasSuggestionDone: false },
    { day: 6, hasSuggestionDone: false },
    { day: 7, hasSuggestionDone: false },
  ],
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
