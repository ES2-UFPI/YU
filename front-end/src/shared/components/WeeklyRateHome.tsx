import { StyleSheet, Text, View } from "react-native";

export type WeeklyRateDay = {
  day: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  hasSuggestionDone: boolean;
};

type WeeklyRateProps = {
  weeklyRate: number;
  days: WeeklyRateDay[];
};

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 7] as const;

function getTodayIndex(): number {
  const jsDay = new Date().getDay();
  const mapped = jsDay === 0 ? 7 : jsDay;
  return WEEK_ORDER.indexOf(mapped as typeof WEEK_ORDER[number]);
}

export function WeeklyRateHome({ days }: WeeklyRateProps) {
  const todayIndex = getTodayIndex();

  const daysBySlot = new Map(days.map((d) => [d.day, d]));

  const slots = WEEK_ORDER.map((slot, index) => {
    const data = daysBySlot.get(slot) ?? null;
    const isToday = index === todayIndex;
    const isFuture = index > todayIndex;

    return {
      slot,
      index,
      isToday,
      isFuture,
      dayNumber: String(index + 1),
      isDone: !isFuture && (data?.hasSuggestionDone ?? false),
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.daysRow}>
        {slots.map(({ slot, dayNumber, isDone, isToday, isFuture }) => (
          <View key={slot} style={styles.dayItem}>
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