import { StyleSheet, Text, View } from "react-native";

export type WeeklyRateDay = {
  date: string;
  hasSuggestionDone: boolean;
};

type WeeklyRateProps = {
  weeklyRate: number;
  days: WeeklyRateDay[];
};

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizeWeeklyRate(weeklyRate: number): number {
  if (!Number.isFinite(weeklyRate)) {
    return 0;
  }

  const percentage = weeklyRate >= 0 && weeklyRate <= 1
    ? weeklyRate * 100
    : weeklyRate;

  return Math.min(Math.max(Math.round(percentage), 0), 100);
}

export function WeeklyRate({ weeklyRate, days }: WeeklyRateProps) {
  const visibleDays = days.slice(0, 7);
  const today = formatLocalDate(new Date());
  const normalizedRate = normalizeWeeklyRate(weeklyRate);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Desempenho semanal</Text>

      <View style={styles.daysRow}>
        {visibleDays.map((day) => {
          const isToday = day.date === today;
          const dayNumber = day.date.slice(-2);

          return (
            <View key={day.date} style={styles.dayItem}>
              <View
                style={[
                  styles.dot,
                  day.hasSuggestionDone && styles.dotDone,
                  isToday && styles.dotToday,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    isToday && !day.hasSuggestionDone && styles.dayTextToday,
                    day.hasSuggestionDone && styles.dayTextDone,
                  ]}
                >
                  {dayNumber}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <Text style={styles.rateText}>{normalizedRate}% na semana</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "90%",
    alignSelf: "center",
    backgroundColor: "#F7F8FC",
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  title: {
    color: "#2A2A2A",
    fontSize: 14,
    fontWeight: "800",
  },
  daysRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  dayItem: {
    width: 32,
    alignItems: "center",
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#DADCE0",
    borderWidth: 1,
  },
  dotDone: {
    backgroundColor: "#5d57c7",
    borderColor: "#5d57c7",
  },
  dotToday: {
    borderColor: "#F9AB00",
    borderWidth: 3,
  },
  dayText: {
    color: "#777777",
    fontSize: 11,
    fontWeight: "700",
  },
  dayTextDone: {
    color: "#FFFFFF",
  },
  dayTextToday: {
    color: "#2A2A2A",
  },
  rateText: {
    color: "#59519e",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },
});
