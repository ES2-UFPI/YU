import { prisma } from "../lib/prisma.js";
import {
  ScreenTimeContext,
  TimeOfDay,
  UserContextProfile,
  UserLocationContext,
  WeatherContext,
} from "../types/suggestions.types.js";
import {
  getMockScreenTime,
  getTotalByCategory,
  ScreenTimeData,
} from "../mocks/screenTime.mock.js";

function getTimeOfDay(date: Date): TimeOfDay {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return "morning";
  }

  if (hour >= 12 && hour < 18) {
    return "afternoon";
  }

  if (hour >= 18 && hour < 22) {
    return "evening";
  }

  return "night";
}

function buildScreenTimeContext(data: ScreenTimeData): ScreenTimeContext {
  const instagramMinutes =
    data.apps.find((app) => app.appName.toLowerCase() === "instagram")
      ?.minutesUsed ?? 0;
  const whatsappMinutes =
    data.apps.find((app) => app.appName.toLowerCase() === "whatsapp")
      ?.minutesUsed ?? 0;
  const readingMinutes = data.apps
    .filter((app) => app.category === "reading")
    .reduce((sum, app) => sum + app.minutesUsed, 0);

  return {
    source: "mock",
    totalMinutes: data.apps.reduce((sum, app) => sum + app.minutesUsed, 0),
    apps: {
      instagramMinutes,
      whatsappMinutes,
      readingMinutes,
    },
    byCategory: getTotalByCategory(data),
  };
}

function buildWeatherContext(): WeatherContext {
  return {
    available: false,
    temperatureCelsius: null,
    condition: "unknown",
    observedAt: null,
  };
}

export function serializeContextProfile(profile: UserContextProfile): string {
  return JSON.stringify(profile);
}

export async function buildUserContextProfile(
  userId: string,
  now = new Date()
): Promise<UserContextProfile> {
  const [goals, location] = await Promise.all([
    prisma.userGoal.findMany({
      where: { userId, active: true },
      orderBy: { savedAt: "desc" },
      select: { goalId: true },
    }),
    prisma.userLocation.findFirst({
      where: { userId },
      orderBy: { capturedAt: "desc" },
      select: {
        latitude: true,
        longitude: true,
        capturedAt: true,
      },
    }),
  ]);

  const locationContext: UserLocationContext = location
    ? {
        granted: true,
        latitude: location.latitude,
        longitude: location.longitude,
        capturedAt: location.capturedAt.toISOString(),
      }
    : {
        granted: false,
        latitude: null,
        longitude: null,
        capturedAt: null,
      };

  return {
    userId,
    generatedAt: now.toISOString(),
    goals: goals.map((goal) => goal.goalId),
    location: locationContext,
    weather: buildWeatherContext(),
    screenTime: buildScreenTimeContext(getMockScreenTime(userId)),
    timeOfDay: getTimeOfDay(now),
  };
}
