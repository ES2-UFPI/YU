import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, StyleSheet, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { OfensiveHeader } from "../shared/components/OfensiveHeader";
import { Mascote } from "../features/mascot";
import type { MascotContext, MascotEvent } from "../features/mascot";
import { getDailyProgress, type WeeklyHistoryDay } from "../services/progressApi";

function getCurrentWeekDayNumber(): 1 | 2 | 3 | 4 | 5 | 6 | 7 {
  const jsDay = new Date().getDay();
  return (jsDay === 0 ? 7 : jsDay) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

function getYesterdayWeekDayNumber(): 1 | 2 | 3 | 4 | 5 | 6 | 7 {
  const currentDay = getCurrentWeekDayNumber();
  return (currentDay === 1 ? 7 : currentDay - 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

function buildMascotHistoryFromWeeklyHistory(
  weeklyHistory: WeeklyHistoryDay[]
): MascotContext["history"] {
  const yesterdayDay = getYesterdayWeekDayNumber();
  const yesterday = weeklyHistory.find((item) => item.day === yesterdayDay);

  if (!yesterday) {
    return [];
  }

  return [
    {
      date: `day-${yesterdayDay}`,
      completedSuggestions: yesterday.hasSuggestionDone ? 1 : 0,
    },
  ];
}

export const HomePage = () => {
  const [mascotContext, setMascotContext] = useState<MascotContext | null>(null);
  const [mascotEvent, setMascotEvent] = useState<MascotEvent | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadMascotContext() {
        try {
          const progress = await getDailyProgress();

          const nextMascotContext: MascotContext = {
            completedSuggestionsToday: progress.completedSuggestionsToday,
            dailySuggestionTarget: progress.dailySuggestionTarget || 5,
            history: buildMascotHistoryFromWeeklyHistory(progress.weeklyHistory),
            isOffline: false,
          };

          if (isActive) {
            setMascotContext(nextMascotContext);
            setMascotEvent(null);
          }
        } catch (error) {
          console.error("Erro ao carregar dados do mascote:", error);

          if (isActive) {
            setMascotContext(null);
            setMascotEvent(null);
          }
        }
      }

      loadMascotContext();

      return () => {
        isActive = false;
      };
    }, [])
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <OfensiveHeader />
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mascotCenter}>
          <Mascote context={mascotContext} event={mascotEvent} size={360} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#5d57c7",
  },
  list: {
    flexGrow: 1,
    paddingVertical: 12,
    paddingBottom: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  mascotCenter: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 24,
  },
});
