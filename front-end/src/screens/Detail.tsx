import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import { GoalCheckCard } from "../shared/components/GoalCheckCard";
import { QuestHeader } from "../shared/components/QuestHeader";
import { DailyProgressBar } from "../shared/components/DailyProgressBar";
import { WeeklyRate } from "../shared/components/WeeklyRate";
import { MascotReactionCard } from "../shared/components/MascotReactionCard";
import { appEventBus } from "../shared/events";
import { StatusBar } from "expo-status-bar";
import { getAuth } from "firebase/auth";
import {
  getDailyProgress,
  ProgressIndicators,
  WeeklyHistoryDay,
} from "../services/progressApi";
import {
  completeSuggestion,
  fetchSuggestions,
  Suggestion,
} from "../services/suggestionsApi";
import { resolveMascotReaction } from "../features/mascot/mascotReactionMapper";
import type { MascotReaction } from "../features/mascot/mascotReactionTypes";

const GOAL_CARD_SIZE = 80;

export const DetailPage = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [source, setSource] = useState<"engine" | "cache" | "offline" | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedSuggestionIds, setCompletedSuggestionIds] = useState<Set<string>>(
    () => new Set()
  );
  const [activeReaction, setActiveReaction] = useState<MascotReaction | null>(null);
  const [weeklyHistory, setWeeklyHistory] = useState<WeeklyHistoryDay[]>([]);
  const [progress, setProgress] = useState<ProgressIndicators | null>(null);

  useEffect(() => {
    async function loadSuggestions() {
      try {
        const token = await getAuth().currentUser?.getIdToken();

        if (!token) {
          setLoading(false);
          return;
        }

        const result = await fetchSuggestions(token);
        const dailyProgress = await getDailyProgress();
        setSuggestions(result.suggestions);
        setSource(result.source);
        setProgress(dailyProgress);
        setWeeklyHistory(dailyProgress.weeklyHistory);
      } catch (error) {
        console.error("Erro ao carregar sugestões:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSuggestions();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5d57c7" />
        <Text style={styles.loadingText}>Carregando missões...</Text>
      </View>
    );
  }

  if (suggestions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.emptyText}>Nenhuma sugestão disponível.</Text>
        <Text style={styles.emptySubText}>
          Selecione seus objetivos para receber recomendações personalizadas.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <QuestHeader
        title="Bem-vindo!"
        subtitle={
          source === "offline"
            ? "Você está offline. Exibindo sugestões do cache."
            : "Complete missões e deixe o Yu Feliz! As missões renovam todo dia."
        }
        progressBar={
          <DailyProgressBar
            completedSuggestionsToday={progress?.completedSuggestionsToday}
            dailySuggestionTarget={progress?.dailySuggestionTarget ?? suggestions.length}
            variant="header"
          />
        }
      />

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        <WeeklyRate days={weeklyHistory} />

        {suggestions.map((suggestion) => (
          <GoalCheckCard
            key={suggestion.id}
            title={suggestion.title}
            description={suggestion.description}
            iconColor="#59519e"
            cardSize={GOAL_CARD_SIZE}
            onCompleteBackend={async () => {
              const wasNewCompletion = await completeSuggestion(suggestion.id);

              if (wasNewCompletion) {
                /**
                 * Observer:
                 * publica um evento real de sugestao concluida.
                 * A Home/Mascote observa esse evento sem depender diretamente desta tela.
                 */
                appEventBus.publish({
                  type: "suggestionCompleted",
                  payload: {
                    suggestionId: suggestion.id,
                    goalId: suggestion.goalId,
                    createdAt: Date.now(),
                  },
                });

                setCompletedSuggestionIds((current) => {
                  const next = new Set(current);
                  next.add(suggestion.id);

                  const reaction = resolveMascotReaction({
                    completedSuggestionsToday: next.size,
                    previousCompletedSuggestionsToday: current.size,
                    dailySuggestionTarget: progress?.dailySuggestionTarget ?? suggestions.length,
                  });

                  if (reaction) setActiveReaction(reaction);

                  return next;
                });

                const previousStreak = progress?.currentStreak ?? 0;
                const dailyProgress = await getDailyProgress();

                if (previousStreak === 0 && dailyProgress.currentStreak > 0) {
                  appEventBus.publish({
                    type: "streakRecovered",
                    payload: {
                      previousStreak,
                      currentStreak: dailyProgress.currentStreak,
                      createdAt: Date.now(),
                    },
                  });
                }

                if (previousStreak > 0 && dailyProgress.currentStreak === 0) {
                  appEventBus.publish({
                    type: "streakBroken",
                    payload: {
                      previousStreak,
                      currentStreak: dailyProgress.currentStreak,
                      createdAt: Date.now(),
                    },
                  });
                }

                setProgress(dailyProgress);
                setWeeklyHistory(dailyProgress.weeklyHistory);
              }
            }}
          />
        ))}
      </ScrollView>

      <MascotReactionCard
        reaction={activeReaction}
        onDismiss={() => setActiveReaction(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  list: {
    paddingVertical: 12,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    lineHeight: 20,
  },
});
