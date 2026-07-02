import {
  Suggestion,
  SuggestionsResponse,
  UserContextProfile,
} from "../types/suggestions.types.js";

const cachedSuggestions: Suggestion[] = [
  {
    id: "screen-break",
    title: "Faça uma pausa curta das telas",
    description:
      "Afaste-se do celular por alguns minutos para descansar a visão e recuperar o foco.",
    category: "digital_balance",
  },
  {
    id: "short-walk",
    title: "Caminhe por alguns minutos",
    description:
      "Uma caminhada leve ajuda a movimentar o corpo e pode melhorar sua energia.",
    category: "physical_activity",
  },
  {
    id: "hydrate",
    title: "Beba água",
    description:
      "Uma pausa rápida para hidratação ajuda a manter disposição ao longo do dia.",
    category: "wellbeing",
  },
  {
    id: "focus-block",
    title: "Reserve um bloco de foco",
    description:
      "Escolha uma tarefa pequena e silencie notificações por um período curto.",
    category: "focus",
  },
  {
    id: "rest-moment",
    title: "Inclua um momento de descanso",
    description:
      "Uma pausa sem estímulos pode reduzir o cansaço e apoiar uma rotina mais equilibrada.",
    category: "rest",
  },
];

async function getSuggestionsFromDecisionEngine(
  _userId: string,
  _context: UserContextProfile
): Promise<Suggestion[]> {
  throw new Error("Decision engine is not available yet.");
}

function getCachedSuggestions(): Suggestion[] {
  return cachedSuggestions.slice(0, 3);
}

export async function generateSuggestions(
  userId: string,
  context: UserContextProfile
): Promise<SuggestionsResponse> {
  try {
    const suggestions = await getSuggestionsFromDecisionEngine(userId, context);

    return {
      source: "engine",
      contextProfile: context,
      total: suggestions.length,
      suggestions: suggestions.slice(0, 5),
    };
  } catch {
    const suggestions = getCachedSuggestions();

    return {
      source: "cache",
      contextProfile: context,
      total: suggestions.length,
      suggestions,
    };
  }
}
