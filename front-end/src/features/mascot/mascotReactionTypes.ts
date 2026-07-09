export type MascotReaction = "primeiro_goal" | "ultimo_goal";
 
export type MascotReactionCard = {
  reaction: MascotReaction;
  text: string;
};
 
export type MascotReactionContext = {
  completedSuggestionsToday: number;
  previousCompletedSuggestionsToday?: number;
  dailySuggestionTarget?: number;
};
 