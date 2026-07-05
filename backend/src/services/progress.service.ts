import { prisma } from "../lib/prisma.js";

type GoalProgressRecord = {
  goalId: string;
  completedAt: Date | string;
};

export type ProgressIndicators = {
  completedToday: number;
  totalGoals: number;
  completionRateToday: number;
  weeklyRate: number;
  currentStreak: number;
};

const EMPTY_PROGRESS: ProgressIndicators = {
  completedToday: 0,
  totalGoals: 0,
  completionRateToday: 0,
  weeklyRate: 0,
  currentStreak: 0,
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

function toDateKey(value: Date | string): string {
  return typeof value === "string" ? value.slice(0, 10) : formatDateOnly(value);
}

function roundRate(value: number): number {
  return Math.round(value * 100) / 100;
}

function countCompletionsByDate(
  records: GoalProgressRecord[]
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

function calculateProgressIndicators(
  totalGoals: number,
  records: GoalProgressRecord[],
  today: Date
): ProgressIndicators {
  if (totalGoals === 0) {
    return EMPTY_PROGRESS;
  }

  const todayKey = formatDateOnly(today);
  const completionsByDate = countCompletionsByDate(records);
  const completedToday = completionsByDate.get(todayKey) ?? 0;

  return {
    completedToday,
    totalGoals,
    completionRateToday: roundRate((completedToday / totalGoals) * 100),
    weeklyRate: roundRate((records.length / (totalGoals * 7)) * 100),
    currentStreak: calculateCurrentStreak(completionsByDate, today),
  };
}

export async function getUserProgress(
  userId: string,
  today = new Date()
): Promise<ProgressIndicators> {
  const totalGoals = await prisma.userGoal.count({
    where: {
      userId,
      active: true,
    },
  });

  if (totalGoals === 0) {
    return EMPTY_PROGRESS;
  }

  const todayDate = toDateOnly(today);
  const weekStartDate = toDateOnly(addDays(today, -6));
  const progressRecords = await prisma.goalProgress.findMany({
    where: {
      userId,
      completedAt: {
        gte: weekStartDate,
        lte: todayDate,
      },
    },
    select: {
      goalId: true,
      completedAt: true,
    },
    orderBy: {
      completedAt: "desc",
    },
  });

  return calculateProgressIndicators(totalGoals, progressRecords, today);
}
