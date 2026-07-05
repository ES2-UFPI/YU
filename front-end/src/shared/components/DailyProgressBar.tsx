import { useEffect, useState } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  getDailyProgress,
  ProgressIndicators,
} from "../../services/progressApi";

type DailyProgressBarProps = {
  completedToday?: number;
  totalGoals?: number;
  style?: StyleProp<ViewStyle>;
};

const EMPTY_PROGRESS: ProgressIndicators = {
  completedToday: 0,
  totalGoals: 0,
  completionRateToday: 0,
  weeklyRate: 0,
  currentStreak: 0,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getProgressColor(percentage: number): string {
  if (percentage < 40) {
    return "#D93025";
  }

  if (percentage < 80) {
    return "#F9AB00";
  }

  return "#188038";
}

export function DailyProgressBar({
  completedToday,
  totalGoals,
  style,
}: DailyProgressBarProps) {
  const [progress, setProgress] =
    useState<ProgressIndicators>(EMPTY_PROGRESS);
  const [loading, setLoading] = useState(
    completedToday === undefined || totalGoals === undefined
  );
  const [error, setError] = useState<string | null>(null);
  const shouldFetch = completedToday === undefined || totalGoals === undefined;
  const resolvedCompleted = completedToday ?? progress.completedToday;
  const resolvedTotal = totalGoals ?? progress.totalGoals;
  const safeTotal = Math.max(resolvedTotal, 0);
  const safeCompleted =
    safeTotal === 0 ? 0 : clamp(resolvedCompleted, 0, safeTotal);
  const percentage =
    safeTotal === 0 ? 0 : clamp((safeCompleted / safeTotal) * 100, 0, 100);
  const fillColor = getProgressColor(percentage);
  const animatedPercentage = useSharedValue(0);

  useEffect(() => {
    if (!shouldFetch) {
      setLoading(false);
      setError(null);
      return;
    }

    let active = true;

    async function loadProgress() {
      try {
        setLoading(true);
        setError(null);
        const dailyProgress = await getDailyProgress();

        if (active) {
          setProgress(dailyProgress);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Nao foi possivel carregar o progresso diario."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProgress();

    return () => {
      active = false;
    };
  }, [shouldFetch]);

  useEffect(() => {
    animatedPercentage.value = withTiming(percentage, {
      duration: 650,
      easing: Easing.out(Easing.cubic),
    });
  }, [animatedPercentage, percentage]);

  const animatedFillStyle = useAnimatedStyle(() => ({
    width: `${animatedPercentage.value}%`,
  }));

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.statusText}>Carregando progresso...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.textRow}>
        <Text style={styles.label}>
          {safeCompleted} de {safeTotal} objetivos cumpridos hoje
        </Text>
        <Text style={[styles.percentage, { color: fillColor }]}>
          {Math.round(percentage)}%
        </Text>
      </View>

      <View
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: safeTotal,
          now: safeCompleted,
          text: `${safeCompleted} de ${safeTotal} objetivos cumpridos hoje`,
        }}
        style={styles.track}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: fillColor,
            },
            animatedFillStyle,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "90%",
    alignSelf: "center",
    gap: 10,
  },
  statusText: {
    color: "#555555",
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    color: "#8A2A19",
    fontSize: 13,
    lineHeight: 18,
  },
  textRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  label: {
    flex: 1,
    color: "#2A2A2A",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 19,
  },
  percentage: {
    minWidth: 44,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "800",
  },
  track: {
    width: "100%",
    height: 12,
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "#E8EAED",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
  },
});
