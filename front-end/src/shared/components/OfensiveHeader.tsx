import { useCallback, useState } from "react";
import { View, StyleSheet, useWindowDimensions, Image, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { WeeklyRateHome, WeeklyRateDay } from "./WeeklyRateHome";
import { getDailyProgress } from "../../services/progressApi";

const OFFENSIVE_ACTIVE = require("../../../assets/mascot/icons/icon_yu_ofensiva.png");
const OFFENSIVE_OUT = require("../../../assets/mascot/icons/icon_yu_ofensiva_out.png");

export const OfensiveHeader = () => {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const headerHeight = height * 0.20 + insets.top;

  const [weeklyRate, setWeeklyRate] = useState(0);
  const [days, setDays] = useState<WeeklyRateDay[]>([]);
  const [streakBroken, setStreakBroken] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function load() {
        try {
          const data = await getDailyProgress();

          if (!isActive) {
            return;
          }

          setWeeklyRate(data.weeklyRate);
          setCurrentStreak(data.currentStreak);
          setStreakBroken(data.currentStreak === 0);
          setDays(data.weeklyHistory);
        } catch (error) {
          console.error("Erro ao carregar progresso:", error);
        }
      }

      load();

      return () => {
        isActive = false;
      };
    }, [])
  );

  return (
    <View style={[styles.header, { height: headerHeight, paddingTop: insets.top + 12 }]}>
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <Image
        source={streakBroken ? OFFENSIVE_OUT : OFFENSIVE_ACTIVE}
        style={styles.offensive}
        resizeMode="contain"
      />

      <View style={styles.weeklyWrapper}>
        <WeeklyRateHome weeklyRate={weeklyRate} days={days} />
      </View>

      <Text style={styles.streakText}>
        {currentStreak} {currentStreak === 1 ? "dia" : "dias"} de ofensiva
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: "100%",
    backgroundColor: "#5d57c7",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 20,
    overflow: "hidden",
    gap: 0,
  },
  circle1: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.06)",
    top: -60,
    right: -30,
  },
  circle2: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.04)",
    top: 30,
    right: 80,
  },
  offensive: {
    width: 60,
    height: 80,
  },
  streakText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    fontWeight: "700",
  },
  weeklyWrapper: {
    transform: [{ scale: 0.60 }],
  },
});
