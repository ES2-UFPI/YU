import { useEffect, useState } from "react";
import {
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
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
  completedSuggestionsToday?: number;
  completedSuggestionsDelta?: number;
  dailySuggestionTarget?: number;
  animationDuration?: number;
  refreshKey?: number;
  style?: StyleProp<ViewStyle>;
  variant?: "default" | "header";
};

const EMPTY_PROGRESS: ProgressIndicators = {
  completedSuggestionsToday: 0,
  dailySuggestionTarget: 0,
  completionRateToday: 0,
  weeklyRate: 0,
  currentStreak: 0,
  weeklyHistory: [
    { day: 1, hasSuggestionDone: false },
    { day: 2, hasSuggestionDone: false },
    { day: 3, hasSuggestionDone: false },
    { day: 4, hasSuggestionDone: false },
    { day: 5, hasSuggestionDone: false },
    { day: 6, hasSuggestionDone: false },
    { day: 7, hasSuggestionDone: false },
  ],
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
  completedSuggestionsToday,
  completedSuggestionsDelta = 0,
  dailySuggestionTarget,
  animationDuration = 650,
  refreshKey = 0,
  style,
  variant = "default",
}: DailyProgressBarProps) {
  const hasProvidedCompleted = completedSuggestionsToday !== undefined;
  const hasProvidedTarget = dailySuggestionTarget !== undefined;
  const [progress, setProgress] =
    useState<ProgressIndicators>(EMPTY_PROGRESS);
  const [loading, setLoading] = useState(
    !hasProvidedCompleted && !hasProvidedTarget
  );
  const [error, setError] = useState<string | null>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const shouldFetch = !hasProvidedCompleted || !hasProvidedTarget;
  const resolvedCompleted =
    (completedSuggestionsToday ?? progress.completedSuggestionsToday) +
    completedSuggestionsDelta;
  const resolvedTotal = dailySuggestionTarget ?? progress.dailySuggestionTarget;
  const safeTotal = Math.max(resolvedTotal, 0);
  const safeCompleted =
    safeTotal === 0 ? 0 : clamp(resolvedCompleted, 0, safeTotal);
  const percentage =
    safeTotal === 0 ? 0 : clamp((safeCompleted / safeTotal) * 100, 0, 100);
  const fillColor = getProgressColor(percentage);
  const animatedProgress = useSharedValue(0);
  const isHeaderVariant = variant === "header";

  useEffect(() => {
    if (!shouldFetch) {
      setLoading(false);
      setError(null);
      return;
    }

    let active = true;

    async function loadProgress() {
      try {
        setLoading(!hasProvidedCompleted && !hasProvidedTarget);
        setError(null);
        const dailyProgress = await getDailyProgress();

        if (active) {
          setProgress(dailyProgress);
        }
      } catch (err) {
        if (active) {
          setError(
            hasProvidedCompleted || hasProvidedTarget
              ? null
              : err instanceof Error
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
  }, [
    hasProvidedCompleted,
    hasProvidedTarget,
    completedSuggestionsToday,
    dailySuggestionTarget,
    refreshKey,
    shouldFetch,
  ]);

  useEffect(() => {
    if (animationDuration === 0) {
      animatedProgress.value = percentage / 100;
      return;
    }

    animatedProgress.value = withTiming(percentage / 100, {
      duration: animationDuration,
      easing: Easing.out(Easing.cubic),
    });
  }, [animatedProgress, animationDuration, percentage]);

  const animatedFillStyle = useAnimatedStyle(() => ({
    width: trackWidth * animatedProgress.value,
  }));

  function handleTrackLayout(event: LayoutChangeEvent) {
    setTrackWidth(event.nativeEvent.layout.width);
  }

  function renderHeaderStatus(message: string, isError = false) {
    return (
      <View style={[styles.headerContainer, style]}>
        <View style={styles.headerTrack}>
          <Text
            numberOfLines={1}
            style={[styles.headerLabel, isError && styles.headerErrorLabel]}
          >
            {message}
          </Text>
        </View>
      </View>
    );
  }

  if (loading) {
    if (isHeaderVariant) {
      return renderHeaderStatus("Carregando progresso...");
    }

    return (
      <View style={[styles.container, style]}>
        <Text style={styles.statusText}>Carregando progresso...</Text>
      </View>
    );
  }

  if (error) {
    if (isHeaderVariant) {
      return renderHeaderStatus(error, true);
    }

    return (
      <View style={[styles.container, style]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (isHeaderVariant) {
    return (
      <View style={[styles.headerContainer, style]}>
        <View
          accessibilityRole="progressbar"
          accessibilityValue={{
            min: 0,
            max: safeTotal,
            now: safeCompleted,
            text: `${safeCompleted} de ${safeTotal} missões concluídas hoje`,
          }}
          onLayout={handleTrackLayout}
          style={styles.headerTrack}
        >
          <Animated.View
            style={[
              styles.headerFill,
              {
                backgroundColor: fillColor,
              },
              animatedFillStyle,
            ]}
          />
          <Text adjustsFontSizeToFit numberOfLines={1} style={styles.headerLabel}>
            {safeCompleted}/{safeTotal} missões hoje
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.textRow}>
        <Text style={styles.label}>
          {safeCompleted}/{safeTotal} missões hoje
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
          text: `${safeCompleted} de ${safeTotal} missões concluídas hoje`,
        }}
        onLayout={handleTrackLayout}
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
  headerContainer: {
    width: "100%",
  },
  headerTrack: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 999,
    height: 28,
    justifyContent: "center",
    overflow: "hidden",
    width: "100%",
  },
  headerFill: {
    bottom: 0,
    borderRadius: 999,
    height: "100%",
    left: 0,
    position: "absolute",
    top: 0,
  },
  headerLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    paddingHorizontal: 10,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.28)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerErrorLabel: {
    color: "#FFE4E0",
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
