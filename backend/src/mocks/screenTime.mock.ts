export interface AppUsage {
  appName: string;
  category: "social" | "entertainment" | "productivity" | "reading" | "other";
  minutesUsed: number;
}

export interface ScreenTimeData {
  userId: string;
  date: string;
  apps: AppUsage[];
}

const usageProfiles: AppUsage[][] = [
  [
    { appName: "Instagram", category: "social", minutesUsed: 90 },
    { appName: "WhatsApp", category: "social", minutesUsed: 45 },
    { appName: "YouTube", category: "entertainment", minutesUsed: 120 },
    { appName: "TikTok", category: "social", minutesUsed: 60 },
    { appName: "Kindle", category: "reading", minutesUsed: 15 },
  ],
  [
    { appName: "WhatsApp", category: "social", minutesUsed: 30 },
    { appName: "Netflix", category: "entertainment", minutesUsed: 180 },
    { appName: "Twitter", category: "social", minutesUsed: 40 },
    { appName: "Notion", category: "productivity", minutesUsed: 25 },
  ],
  [
    { appName: "Instagram", category: "social", minutesUsed: 20 },
    { appName: "WhatsApp", category: "social", minutesUsed: 60 },
    { appName: "YouTube", category: "entertainment", minutesUsed: 45 },
    { appName: "Duolingo", category: "productivity", minutesUsed: 15 },
    { appName: "Kindle", category: "reading", minutesUsed: 90 },
  ],
];

export function getMockScreenTime(userId: string): ScreenTimeData {
  const profileIndex = userId.charCodeAt(0) % usageProfiles.length;
  return {
    userId,
    date: new Date().toISOString().split("T")[0],
    apps: usageProfiles[profileIndex],
  };
}

export function getTotalByCategory(
  data: ScreenTimeData
): Record<string, number> {
  return data.apps.reduce((acc, app) => {
    acc[app.category] = (acc[app.category] || 0) + app.minutesUsed;
    return acc;
  }, {} as Record<string, number>);
}

export function isHighSocialUsage(data: ScreenTimeData): boolean {
  const totals = getTotalByCategory(data);
  return (totals["social"] || 0) > 120;
}

export function isHighEntertainmentUsage(data: ScreenTimeData): boolean {
  const totals = getTotalByCategory(data);
  return (totals["entertainment"] || 0) > 180;
}