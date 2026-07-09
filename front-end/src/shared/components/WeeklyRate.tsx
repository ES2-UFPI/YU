import { StyleSheet, Text, View } from "react-native";

const WEEK_DAYS = [1, 2, 3, 4, 5, 6, 7] as const;

export type WeeklyRateDay = {
  day: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  hasSuggestionDone: boolean;
};

type WeeklyRateProps = {
  days: WeeklyRateDay[];
};

function getCurrentWeekDayNumber(): WeeklyRateDay["day"] {
  const jsDay = new Date().getDay();

  return (jsDay === 0 ? 7 : jsDay) as WeeklyRateDay["day"];
}

function getDayStatus(days: WeeklyRateDay[], day: WeeklyRateDay["day"]) {
  return days.find((item) => item.day === day)?.hasSuggestionDone ?? false;
}

export function WeeklyRate({ days }: WeeklyRateProps) {
  const currentDay = getCurrentWeekDayNumber();
  const completedDaysCount = WEEK_DAYS.filter((day) => {
    const isFutureDay = day > currentDay;

    return !isFutureDay && getDayStatus(days, day);
  }).length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Desempenho semanal</Text>

      <View style={styles.daysRow}>
        {WEEK_DAYS.map((day) => {
          const isToday = day === currentDay;
          const isFutureDay = day > currentDay;
          const isDone = !isFutureDay && getDayStatus(days, day);

          return (
            <View key={day} style={styles.dayItem}>
              <View
                style={[
                  styles.dot,
                  isDone && styles.dotDone,
                  isToday && styles.dotToday,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    isToday && !isDone && styles.dayTextToday,
                    isDone && styles.dayTextDone,
                  ]}
                >
                  {day}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <Text style={styles.rateText}>
        {completedDaysCount} de 7 dias com sugestões concluídas
      </Text>
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
