import { apiFetch } from "./api";
import { getAnonymousIdToken } from "./firebase";
import {
  saveLastSuggestionsCache,
  getLastSuggestionsCache,
} from "../storage/offlineStorage";

export interface Suggestion {
  id: string;
  goalId?: string;
  title: string;
  description: string;
  category: string;
}

export interface SuggestionsResult {
  source: "engine" | "cache" | "offline";
  total: number;
  suggestions: Suggestion[];
}

type CompleteSuggestionResponse = {
  error?: string;
  erro?: string;
};

export async function fetchSuggestions(
  token: string
): Promise<SuggestionsResult> {
  try {
    const response = await apiFetch("/users/suggestions", token, {
      method: "POST",
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();

    // Salva no cache para uso offline
    await saveLastSuggestionsCache(data.suggestions);

    return {
      source: data.source,
      total: data.total,
      suggestions: data.suggestions,
    };
  } catch (error) {
    console.warn("Falha ao buscar sugestões, usando cache:", error);

    // Fallback — usa o cache salvo anteriormente
    const cached = await getLastSuggestionsCache();

    if (cached && cached.length > 0) {
      return {
        source: "offline",
        total: cached.length,
        suggestions: cached,
      };
    }

    // Sem cache disponível
    return {
      source: "offline",
      total: 0,
      suggestions: [],
    };
  }
}

export async function completeSuggestion(suggestionId: string): Promise<boolean> {
  const token = await getAnonymousIdToken();
  const response = await apiFetch(
    `/users/suggestions/${encodeURIComponent(suggestionId)}/complete`,
    token,
    {
      method: "POST",
    }
  );
  const data = (await response.json().catch(() => ({}))) as CompleteSuggestionResponse;

  if (response.status === 409) {
    return false;
  }

  if (!response.ok) {
    throw new Error(data.error || data.erro || "Nao foi possivel concluir a sugestao.");
  }

  return true;
}
