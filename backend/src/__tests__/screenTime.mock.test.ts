import {
  getMockScreenTime,
  getTotalByCategory,
  isHighSocialUsage,
  isHighEntertainmentUsage,
  ScreenTimeData,
} from "../mocks/screenTime.mock.js";

// getMockScreenTime
describe("getMockScreenTime", () => {
  it("deve retornar dados com o userId correto", () => {
    const data = getMockScreenTime("user-123");
    expect(data.userId).toBe("user-123");
  });

  it("deve retornar a data de hoje", () => {
    const today = new Date().toISOString().split("T")[0];
    const data = getMockScreenTime("user-123");
    expect(data.date).toBe(today);
  });

  it("deve retornar pelo menos um app", () => {
    const data = getMockScreenTime("user-123");
    expect(data.apps.length).toBeGreaterThan(0);
  });

  it("deve retornar sempre o mesmo perfil para o mesmo userId", () => {
    const data1 = getMockScreenTime("user-abc");
    const data2 = getMockScreenTime("user-abc");
    expect(data1.apps).toEqual(data2.apps);
  });

  it("cada app deve ter appName, category e minutesUsed", () => {
    const data = getMockScreenTime("user-123");
    data.apps.forEach((app) => {
      expect(app).toHaveProperty("appName");
      expect(app).toHaveProperty("category");
      expect(app).toHaveProperty("minutesUsed");
      expect(app.minutesUsed).toBeGreaterThan(0);
    });
  });
});

// getTotalByCategory
describe("getTotalByCategory", () => {
  const mockData: ScreenTimeData = {
    userId: "user-test",
    date: "2026-06-06",
    apps: [
      { appName: "Instagram", category: "social", minutesUsed: 60 },
      { appName: "WhatsApp", category: "social", minutesUsed: 30 },
      { appName: "YouTube", category: "entertainment", minutesUsed: 90 },
      { appName: "Kindle", category: "reading", minutesUsed: 20 },
    ],
  };

  it("deve somar corretamente os minutos por categoria", () => {
    const totals = getTotalByCategory(mockData);
    expect(totals["social"]).toBe(90);
    expect(totals["entertainment"]).toBe(90);
    expect(totals["reading"]).toBe(20);
  });

  it("não deve incluir categorias com zero minutos", () => {
    const totals = getTotalByCategory(mockData);
    expect(totals["productivity"]).toBeUndefined();
  });

  it("deve retornar objeto vazio se não houver apps", () => {
    const empty: ScreenTimeData = { userId: "u", date: "2026-06-06", apps: [] };
    const totals = getTotalByCategory(empty);
    expect(Object.keys(totals).length).toBe(0);
  });
});

// isHighSocialUsage
describe("isHighSocialUsage", () => {
  it("deve retornar true quando uso social passar de 120 minutos", () => {
    const data: ScreenTimeData = {
      userId: "user-test",
      date: "2026-06-06",
      apps: [
        { appName: "Instagram", category: "social", minutesUsed: 100 },
        { appName: "WhatsApp", category: "social", minutesUsed: 30 },
      ],
    };
    expect(isHighSocialUsage(data)).toBe(true);
  });

  it("deve retornar false quando uso social for menor ou igual a 120 minutos", () => {
    const data: ScreenTimeData = {
      userId: "user-test",
      date: "2026-06-06",
      apps: [
        { appName: "Instagram", category: "social", minutesUsed: 60 },
        { appName: "WhatsApp", category: "social", minutesUsed: 60 },
      ],
    };
    expect(isHighSocialUsage(data)).toBe(false);
  });

  it("deve retornar false quando não houver apps sociais", () => {
    const data: ScreenTimeData = {
      userId: "user-test",
      date: "2026-06-06",
      apps: [
        { appName: "YouTube", category: "entertainment", minutesUsed: 200 },
      ],
    };
    expect(isHighSocialUsage(data)).toBe(false);
  });
});

// isHighEntertainmentUsage
describe("isHighEntertainmentUsage", () => {
  it("deve retornar true quando entretenimento passar de 180 minutos", () => {
    const data: ScreenTimeData = {
      userId: "user-test",
      date: "2026-06-06",
      apps: [
        { appName: "YouTube", category: "entertainment", minutesUsed: 120 },
        { appName: "Netflix", category: "entertainment", minutesUsed: 90 },
      ],
    };
    expect(isHighEntertainmentUsage(data)).toBe(true);
  });

  it("deve retornar false quando entretenimento for menor ou igual a 180 minutos", () => {
    const data: ScreenTimeData = {
      userId: "user-test",
      date: "2026-06-06",
      apps: [
        { appName: "YouTube", category: "entertainment", minutesUsed: 180 },
      ],
    };
    expect(isHighEntertainmentUsage(data)).toBe(false);
  });
});