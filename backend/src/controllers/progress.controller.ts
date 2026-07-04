import { Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

type GoalProgressRecord = {
  goalId: string;
  completedAt: Date | string;
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
    const totalGoals = await prisma.userGoal.count({
      where: {
        userId,
        active: true,
      },
    });

    if (totalGoals === 0) {
      res.status(200).json({
        completedToday: 0,
        totalGoals: 0,
        completionRateToday: 0,
        weeklyRate: 0,
        currentStreak: 0,
      });
      return;
    }

    const today = new Date();
    const todayKey = formatDateOnly(today);
    const weekStartKey = formatDateOnly(addDays(today, -6));

    const progressRecords = await prisma.goalProgress.findMany({
      where: {
        userId,
        completedAt: {
          gte: weekStartKey,
          lte: todayKey,
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

    const completionsByDate = countCompletionsByDate(progressRecords);
    const completedToday = completionsByDate.get(todayKey) ?? 0;
    const totalWeeklyCompletions = progressRecords.length;

    res.status(200).json({
      completedToday,
      totalGoals,
      completionRateToday: roundRate((completedToday / totalGoals) * 100),
      weeklyRate: roundRate((totalWeeklyCompletions / (totalGoals * 7)) * 100),
      currentStreak: calculateCurrentStreak(completionsByDate, today),
    });
  } catch (error) {
    console.error("[getProgress]", error);
    res.status(500).json({
      error: "Erro interno ao buscar indicadores de progresso.",
    });
  }
}
