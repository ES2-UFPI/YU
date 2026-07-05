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
import { StatusBar } from "expo-status-bar";
import { getAuth } from "firebase/auth";
import { fetchSuggestions, Suggestion } from "../services/suggestionsApi";

const GOAL_CARD_SIZE = 80;

export const DetailPage = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [source, setSource] = useState<"engine" | "cache" | "offline" | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadSuggestions() {
      try {
        const token = await getAuth().currentUser?.getIdToken();

        if (!token) {
          setLoading(false);
          return;
        }

        const result = await fetchSuggestions(token);
        setSuggestions(result.suggestions);
        setSource(result.source);
      } catch (error) {
        console.error("Erro ao carregar sugestões:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSuggestions();
  }, []);

  // Marca uma sugestão como concluída e atualiza o progresso
  function handleComplete(id: string) {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

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

      {/* Header com progresso atualizado em tempo real */}
      <QuestHeader
        title="Bem-vindo!"
        subtitle={
          source === "offline"
            ? "Você está offline. Exibindo sugestões do cache."
            : "Complete missões e deixe o Yu Feliz! As missões renovam todo dia."
        }
        current={completed.size}        
        total={suggestions.length}
      />

      {/* ScrollView */}
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {suggestions.map((suggestion) => (
          <GoalCheckCard
            key={suggestion.id}
            title={suggestion.title}
            description={suggestion.description}
            iconColor="#59519e"
            cardSize={GOAL_CARD_SIZE}
            onCompleteBackend={async () => {
              handleComplete(suggestion.id);
              console.log("Sugestão concluída:", suggestion.id);
            }}
          />
        ))}
      </ScrollView>
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