import { createEventBus } from "./eventBus";

export type AppEvent =
  | {
      type: "suggestionCompleted";
      payload: {
        suggestionId: string;
        goalId?: string;
        createdAt: number;
      };
    }
  | {
      type: "suggestionIgnored";
      payload: {
        suggestionId: string;
        reason: "speechBubbleDismissed" | "manualSkip";
        createdAt: number;
      };
    }
  | {
      type: "streakBroken";
      payload: {
        previousStreak: number;
        currentStreak: number;
        createdAt: number;
      };
    }
  | {
      type: "streakRecovered";
      payload: {
        previousStreak: number;
        currentStreak: number;
        createdAt: number;
      };
    };

/**
 * Barramento global de eventos do app.
 *
 * Este é o Subject do padrão Observer.
 * Telas e componentes publicam eventos reais do usuário.
 * Outros módulos, como o mascote, observam esses eventos sem acoplamento direto.
 */
export const appEventBus = createEventBus<AppEvent>();
