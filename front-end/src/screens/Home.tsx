import { useCallback, useMemo, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { OfensiveHeader } from "../shared/components/OfensiveHeader";
import { MascotAnimation } from "../shared/components/Mascotanimation";
import { MascotSpeechBubble } from "../shared/components/MascotSpeechBubble";
import type { MascotState } from "../features/mascot";
import { getMascotStateWithOfflineFallback } from "../features/mascot";
import { getAnonymousIdToken } from "../services/firebase";
import { getDailyProgress } from "../services/progressApi";
import { fetchSuggestions } from "../services/suggestionsApi";
import type { Suggestion } from "../services/suggestionsApi";

type SpeechSuggestion = Suggestion & {
  source: "engine" | "cache" | "offline";
};

const LAST_SPEECH_SUGGESTION_KEY = "@yu:mascot:last_speech_suggestion";

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
      ? suggestions.filter(
          (suggestion) => suggestion.id !== lastSuggestionId
        )
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
  const prefixes = SPEECH_PREFIX[mascotState];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

  return `${prefix} ${suggestion.title}: ${suggestion.description}`;
}

export const HomePage = () => {
  const [mascotState, setMascotState] = useState<MascotState>("neutro");
  const [speechSuggestion, setSpeechSuggestion] =
    useState<SpeechSuggestion | null>(null);
  const [isBubbleVisible, setIsBubbleVisible] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadMascotSuggestion() {
        try {
          const [progress, token] = await Promise.all([
            getDailyProgress().catch(() => null),
            getAnonymousIdToken(),
          ]);

          const nextMascotState = await getMascotStateWithOfflineFallback(
            progress
              ? {
                  completedSuggestionsToday: progress.completedSuggestionsToday,
                  dailySuggestionTarget: progress.dailySuggestionTarget,
                }
              : null
          );

          const suggestionsResult = await fetchSuggestions(token);

          if (!isActive) {
            return;
          }

          const nextSpeechSuggestion = await pickSuggestion(
            suggestionsResult.suggestions,
            suggestionsResult.source === "offline"
              ? "offline"
              : suggestionsResult.source
          );

          if (!isActive) {
            return;
          }

          setMascotState(nextMascotState);
          setSpeechSuggestion(nextSpeechSuggestion);
          setIsBubbleVisible(nextSpeechSuggestion !== null);
        } catch (error) {
          console.warn("Nao foi possivel carregar sugestao do mascote.", error);

          if (!isActive) {
            return;
          }

          setSpeechSuggestion(null);
          setIsBubbleVisible(false);
        }
      }

      loadMascotSuggestion();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const speechMessage = useMemo(() => {
    if (!speechSuggestion) {
      return "";
    }

    return buildMascotSpeech(speechSuggestion, mascotState);
  }, [mascotState, speechSuggestion]);

  function dismissBubble() {
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
          {isBubbleVisible && speechSuggestion && (
            <MascotSpeechBubble
              isOffline={speechSuggestion.source === "offline"}
              mascotState={mascotState}
              message={speechMessage}
              onDismiss={dismissBubble}
            />
          )}
          <MascotAnimation state={mascotState} size={280} />
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
});
