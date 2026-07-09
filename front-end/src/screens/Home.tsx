import { useCallback, useEffect, useMemo, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { OfensiveHeader } from "../shared/components/OfensiveHeader";
import { MascotSpeechBubble } from "../shared/components/MascotSpeechBubble";
import { appEventBus, type AppEvent } from "../shared/events";
import { Mascote } from "../features/mascot";
import type {
  MascotContext,
  MascotEvent,
  MascotState,
} from "../features/mascot";
import {
  getDailyProgress,
  type WeeklyHistoryDay,
} from "../services/progressApi";
import { getAnonymousIdToken } from "../services/firebase";
import { fetchSuggestions } from "../services/suggestionsApi";
import type { Suggestion } from "../services/suggestionsApi";

type SpeechSuggestion = Suggestion & {
  source: "engine" | "cache" | "offline" | "celebration";
};

const LAST_SPEECH_SUGGESTION_KEY = "@yu:mascot:last_speech_suggestion";
const LAST_CELEBRATION_DATE_KEY = "@yu:mascot:last_celebration_date";
const BUBBLE_SPACE_HEIGHT = 205;

const SPEECH_PREFIX: Record<MascotState, string[]> = {
  doente: [
    "Eu estou meio sem energia hoje. Vamos tentar algo pequeno?",
    "A gente pode recomecar devagar. Que tal essa missao?",
  ],
  triste: [
    "Senti falta de ver voce cuidando de si. Posso te sugerir uma coisa?",
    "Vamos dar um passinho juntos? Acho que isso combina com agora.",
  ],
  neutro: [
    "Tenho uma ideia tranquila para agora.",
    "Essa missao parece uma boa para o seu momento.",
  ],
  feliz: [
    "Boa, voce ja esta embalando. Vamos manter esse ritmo?",
    "Estou gostando desse cuidado. Tenho mais uma ideia para voce.",
  ],
  animado: [
    "Voce esta voando hoje. Bora completar mais uma?",
    "Estou animado com seu progresso. Essa pode fechar bonito.",
  ],
};

const CELEBRATION_SUGGESTION: SpeechSuggestion = {
  id: "daily-celebration",
  title: "Tudo concluido por hoje",
  description:
    "Voce completou todas as missoes disponiveis. Eu adorei ver esse cuidado acontecendo.",
  category: "wellbeing",
  source: "celebration",
};

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

async function pickSuggestion(
  suggestions: Suggestion[],
  source: SpeechSuggestion["source"]
): Promise<SpeechSuggestion | null> {
  if (suggestions.length === 0) {
    return null;
  }

  const lastSuggestionId = await AsyncStorage.getItem(
    LAST_SPEECH_SUGGESTION_KEY
  ).catch(() => null);
  const availableSuggestions =
    suggestions.length > 1
      ? suggestions.filter((suggestion) => suggestion.id !== lastSuggestionId)
      : suggestions;
  const index = Math.floor(Math.random() * availableSuggestions.length);
  const nextSuggestion = availableSuggestions[index];

  await AsyncStorage.setItem(LAST_SPEECH_SUGGESTION_KEY, nextSuggestion.id).catch(
    () => undefined
  );

  return {
    ...nextSuggestion,
    source,
  };
}

function buildMascotSpeech(
  suggestion: SpeechSuggestion,
  mascotState: MascotState
): string {
  if (suggestion.source === "celebration") {
    return `${suggestion.title}: ${suggestion.description}`;
  }

  const prefixes = SPEECH_PREFIX[mascotState];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

  return `${prefix} ${suggestion.title}: ${suggestion.description}`;
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

async function shouldShowCelebrationToday(): Promise<boolean> {
  const todayKey = getTodayKey();
  const lastCelebrationDate = await AsyncStorage.getItem(
    LAST_CELEBRATION_DATE_KEY
  ).catch(() => null);

  if (lastCelebrationDate === todayKey) {
    return false;
  }

  await AsyncStorage.setItem(LAST_CELEBRATION_DATE_KEY, todayKey).catch(
    () => undefined
  );

  return true;
}

function mapAppEventToMascotEvent(event: AppEvent): MascotEvent | null {
  if (event.type === "suggestionCompleted") {
    return {
      type: "metaCumprida",
      id: event.payload.suggestionId,
      createdAt: event.payload.createdAt,
    };
  }

  if (event.type === "suggestionIgnored") {
    return {
      type: "sugestaoIgnorada",
      id: event.payload.suggestionId,
      createdAt: event.payload.createdAt,
    };
  }

  if (event.type === "streakBroken") {
    return {
      type: "streakQuebrada",
      createdAt: event.payload.createdAt,
    };
  }

  if (event.type === "streakRecovered") {
    return {
      type: "streakRecuperada",
      createdAt: event.payload.createdAt,
    };
  }

  return null;
}

export const HomePage = () => {
  const [mascotContext, setMascotContext] = useState<MascotContext | null>(null);
  const [mascotEvent, setMascotEvent] = useState<MascotEvent | null>(null);
  const [speechSuggestion, setSpeechSuggestion] =
    useState<SpeechSuggestion | null>(null);
  const [isBubbleVisible, setIsBubbleVisible] = useState(true);
  const [resolvedMascotState, setResolvedMascotState] =
    useState<MascotState>("neutro");
  const bubbleProgress = useSharedValue(0);

  const loadHomeData = useCallback(
    async (shouldUpdate: () => boolean = () => true) => {
      let progress: Awaited<ReturnType<typeof getDailyProgress>> | null = null;

      try {
        progress = await getDailyProgress();

        const nextMascotContext: MascotContext = {
          completedSuggestionsToday: progress.completedSuggestionsToday,
          dailySuggestionTarget: progress.dailySuggestionTarget || 5,
          history: buildMascotHistoryFromWeeklyHistory(progress.weeklyHistory),
          isOffline: false,
        };

        if (!shouldUpdate()) {
          return;
        }

        setMascotContext(nextMascotContext);
        setMascotEvent(null);
      } catch (error) {
        console.error("Erro ao carregar progresso do mascote:", error);

        if (!shouldUpdate()) {
          return;
        }

        setMascotContext(null);
        setMascotEvent(null);
      }

      try {
        const token = await getAnonymousIdToken();
        const suggestionsResult = await fetchSuggestions(token);

        const completedSuggestionsToday =
          progress?.completedSuggestionsToday ?? 0;
        const allSuggestionsCompleted =
          progress !== null &&
          suggestionsResult.suggestions.length > 0 &&
          completedSuggestionsToday >= suggestionsResult.suggestions.length;

        const shouldShowCelebration =
          allSuggestionsCompleted && (await shouldShowCelebrationToday());

        const nextSpeechSuggestion = allSuggestionsCompleted
          ? shouldShowCelebration
            ? CELEBRATION_SUGGESTION
            : null
          : await pickSuggestion(
              suggestionsResult.suggestions,
              suggestionsResult.source === "offline"
                ? "offline"
                : suggestionsResult.source
            );

        if (!shouldUpdate()) {
          return;
        }

        setSpeechSuggestion(nextSpeechSuggestion);
        setIsBubbleVisible(nextSpeechSuggestion !== null);
      } catch (error) {
        console.warn("Nao foi possivel carregar sugestao do mascote.", error);

        if (!shouldUpdate()) {
          return;
        }

        setSpeechSuggestion(null);
        setIsBubbleVisible(false);
      }
    },
    []
  );

  useEffect(() => {
    /**
     * Observer:
     * a Home se inscreve no appEventBus para reagir a eventos
     * publicados por outros modulos, como a tela de missoes.
     */
    const unsubscribe = appEventBus.subscribe((event) => {
      const mascotEvent = mapAppEventToMascotEvent(event);

      if (!mascotEvent) {
        return;
      }

      setMascotEvent(mascotEvent);

      if (
        event.type === "suggestionCompleted" ||
        event.type === "streakBroken" ||
        event.type === "streakRecovered"
      ) {
        void loadHomeData();
      }
    });

    return unsubscribe;
  }, [loadHomeData]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadFocusedHomeData() {
        await loadHomeData(() => isActive);

        if (!isActive) {
          return;
        }

        const lastEvent = appEventBus.getLastEvent();
        const lastMascotEvent = lastEvent
          ? mapAppEventToMascotEvent(lastEvent)
          : null;

        if (lastMascotEvent) {
          setMascotEvent(lastMascotEvent);
          appEventBus.clearLastEvent();
        }
      }

      void loadFocusedHomeData();

      return () => {
        isActive = false;
      };
    }, [loadHomeData])
  );

  const speechMessage = useMemo(() => {
    if (!speechSuggestion) {
      return "";
    }

    return buildMascotSpeech(speechSuggestion, resolvedMascotState);
  }, [resolvedMascotState, speechSuggestion]);

  const shouldRenderBubble = isBubbleVisible && speechSuggestion;

  const animatedBubbleSpaceStyle = useAnimatedStyle(() => ({
    height: BUBBLE_SPACE_HEIGHT * bubbleProgress.value,
    opacity: bubbleProgress.value,
    transform: [
      {
        translateY: (1 - bubbleProgress.value) * 12,
      },
    ],
  }));

  useFocusEffect(
    useCallback(() => {
      bubbleProgress.value = withTiming(shouldRenderBubble ? 1 : 0, {
        duration: 260,
        easing: Easing.out(Easing.cubic),
      });
    }, [bubbleProgress, shouldRenderBubble])
  );

  function dismissBubble() {
    if (speechSuggestion && speechSuggestion.source !== "celebration") {
      appEventBus.publish({
        type: "suggestionIgnored",
        payload: {
          suggestionId: speechSuggestion.id,
          reason: "speechBubbleDismissed",
          createdAt: Date.now(),
        },
      });
    }

    setIsBubbleVisible(false);
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <OfensiveHeader />
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mascotCenter}>
          <Animated.View style={[styles.bubbleSlot, animatedBubbleSpaceStyle]}>
            {speechSuggestion && (
              <MascotSpeechBubble
                isOffline={speechSuggestion.source === "offline"}
                mascotState={resolvedMascotState}
                message={speechMessage}
                onDismiss={dismissBubble}
              />
            )}
          </Animated.View>

          <Mascote
            context={mascotContext}
            event={mascotEvent}
            size={360}
            onStateChange={setResolvedMascotState}
          />
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
    width: "100%",
  },
  bubbleSlot: {
    alignItems: "center",
    justifyContent: "flex-end",
    overflow: "hidden",
    width: "100%",
  },
});
