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

export function WeeklyRateHome({ days }: WeeklyRateProps) {
  const today = new Date();
  const todayStr = formatLocalDate(today);
  const todayWeekday = today.getDay();

  const daysByWeekday = new Map(
    days.map((d) => {
      const weekday = new Date(d.date + "T00:00:00").getDay();
      return [weekday, d];
    })
  );

    const slots = [0, 1, 2, 3, 4, 5, 6].map((weekday, index) => {
    const data = daysByWeekday.get(weekday) ?? null;
    const isToday = data?.date === todayStr;
    const isFuture = weekday > todayWeekday;

    return {
        weekday,
        data,
        isToday,
        isFuture,
        dayNumber: String(index + 1),
        isDone: !isFuture && (data?.hasSuggestionDone ?? false),
    };
    });

  return (
    <View style={styles.container}>
      <View style={styles.daysRow}>
        {slots.map(({ weekday, dayNumber, isDone, isToday, isFuture }) => (
          <View key={weekday} style={styles.dayItem}>
            <View
              style={[
                styles.dot,
                isDone && styles.dotDone,
                isToday && styles.dotToday,
                isFuture && styles.dotFuture,
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  isDone && styles.dayTextDone,
                  isToday && styles.dayTextToday,
                  isFuture && styles.dayTextFuture,
                ]}
              >
                {dayNumber}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "90%",
    alignSelf: "center",
    paddingHorizontal: 10,
    paddingVertical: 0,
  },
  daysRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
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
    backgroundColor: "#dbd5d5",
    borderColor: "#AAAAAA",
    borderWidth: 1,
  },
  dotToday: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 0,
  },
  dotDone: {
    backgroundColor: "#F9AB00",
    borderColor: "#F9AB00",
  },
  dotFuture: {
    backgroundColor: "transparent",
    borderColor: "#CCCCCC",
    borderWidth: 1,
  },
  dayText: {
    color: "#5d57c7",
    fontSize: 11,
    fontWeight: "700",
  },
  dayTextDone: {
    color: "#5d57c7",
  },
  dayTextToday: {
    color: "#5d57c7",
  },
  dayTextFuture: {
    color: "#CCCCCC",
  },
});