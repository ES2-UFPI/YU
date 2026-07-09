export type MascotState =
  | "doente"
  | "triste"
  | "neutro"
  | "feliz"
  | "animado";

export type MascotSuggestionHistoryDay = {
  date: string;
  completedSuggestions: number;
};

export type MascotContext = {
  completedSuggestionsToday: number;
  dailySuggestionTarget?: number;
  history?: MascotSuggestionHistoryDay[];
  isOffline?: boolean;
};
