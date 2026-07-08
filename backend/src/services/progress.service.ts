import { prisma } from "../lib/prisma.js";
import { buildUserContextProfile } from "./contextProfile.service.js";
import { generateSuggestions } from "./suggestions.service.js";

type SuggestionProgressRecord = {
  suggestionId: string;
  completedAt: Date | string;
};

export type WeeklyHistoryDay = {
  day: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  hasSuggestionDone: boolean;
};

export type ProgressIndicators = {
  completedSuggestionsToday: number;
  dailySuggestionTarget: number;
  completionRateToday: number;
  weeklyRate: number;
  currentStreak: number;
  weeklyHistory: WeeklyHistoryDay[];
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

function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
}

function toDateOnly(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getWeekDayNumber(date: Date): WeeklyHistoryDay["day"] {
  const day = date.getDay();

  return (day === 0 ? 7 : day) as WeeklyHistoryDay["day"];
}

function getCurrentWeekStart(date: Date): Date {
  return addDays(toDateOnly(date), -(getWeekDayNumber(date) - 1));
}

function toDateKey(value: Date | string): string {
  return typeof value === "string"
    ? value.slice(0, 10)
    : value.toISOString().slice(0, 10);
}

function roundRate(value: number): number {
  return Math.round(value * 100) / 100;
}

function countCompletionsByDate(
  records: SuggestionProgressRecord[]
): Map<string, number> {
  return records.reduce((counts, record) => {
    const dateKey = toDateKey(record.completedAt);
    counts.set(dateKey, (counts.get(dateKey) ?? 0) + 1);

    return counts;
  }, new Map<string, number>());
}

function calculateCurrentStreak(
  completionsByDate: Map<string, number>,
  today: Date
): number {
  let streak = 0;

  while (true) {
    const dateKey = formatDateOnly(addDays(today, -streak));

    if (!completionsByDate.has(dateKey)) {
      return streak;
    }

    streak += 1;
  }
}

function buildWeeklyHistory(
  completionsByDate: Map<string, number>,
  today: Date
): WeeklyHistoryDay[] {
  const currentDay = getWeekDayNumber(today);
  const weekStart = getCurrentWeekStart(today);

  return [1, 2, 3, 4, 5, 6, 7].map((day) => {
    const weekDay = day as WeeklyHistoryDay["day"];
    const dateKey = formatDateOnly(addDays(weekStart, day - 1));

    return {
      day: weekDay,
      hasSuggestionDone: weekDay <= currentDay && completionsByDate.has(dateKey),
    };
  });
}

function calculateProgressIndicators(
  dailySuggestionTarget: number,
  records: SuggestionProgressRecord[],
  today: Date
): ProgressIndicators {
  const todayKey = formatDateOnly(today);
  const completionsByDate = countCompletionsByDate(records);
  const weeklyHistory = buildWeeklyHistory(completionsByDate, today);
  const completedSuggestionsToday =
    dailySuggestionTarget === 0 ? 0 : completionsByDate.get(todayKey) ?? 0;
  const completedWeekDays = weeklyHistory.filter(
    (day) => day.hasSuggestionDone
  ).length;

  return {
    completedSuggestionsToday,
    dailySuggestionTarget,
    completionRateToday:
      dailySuggestionTarget === 0
        ? 0
        : roundRate((completedSuggestionsToday / dailySuggestionTarget) * 100),
    weeklyRate: roundRate((completedWeekDays / 7) * 100),
    currentStreak: calculateCurrentStreak(completionsByDate, today),
    weeklyHistory,
  };
}

export async function getUserProgress(
  userId: string,
  today = new Date()
): Promise<ProgressIndicators> {
  const contextProfile = await buildUserContextProfile(userId, today);
  const suggestionsResponse = await generateSuggestions(userId, contextProfile);
  const suggestionIds = suggestionsResponse.suggestions.map(
    (suggestion) => suggestion.id
  );
  const dailySuggestionTarget = suggestionIds.length;

  const todayDate = toDateOnly(today);
  const tomorrowDate = addDays(todayDate, 1);
  const progressRecords = await prisma.suggestionProgress.findMany({
    where: {
      userId,
      completedAt: {
        lt: tomorrowDate,
      },
    },
    select: {
      suggestionId: true,
      completedAt: true,
    },
    orderBy: {
      completedAt: "desc",
    },
  });

  return calculateProgressIndicators(
    dailySuggestionTarget,
    progressRecords,
    today
  );
}
