import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { resolveMascotReaction } from "./mascotReactionMapper";
import type { MascotReaction, MascotReactionContext } from "./mascotReactionTypes";

function makeContext(
  completedSuggestionsToday: number,
  overrides: Partial<MascotReactionContext> = {}
): MascotReactionContext {
  return {
    completedSuggestionsToday,
    ...overrides,
  };
}

function expectReaction(
  context: MascotReactionContext,
  expected: MascotReaction | null
): void {
  assert.equal(resolveMascotReaction(context), expected);
}

describe("resolveMascotReaction", () => {
  describe("primeiro_goal", () => {
    test("dispara quando completa a primeira sugestao do dia", () => {
      expectReaction(
        makeContext(1, { previousCompletedSuggestionsToday: 0 }),
        "primeiro_goal"
      );
    });

    test("nao dispara quando ja havia sugestoes antes", () => {
      expectReaction(
        makeContext(2, { previousCompletedSuggestionsToday: 1 }),
        null
      );
    });

    test("nao dispara quando previous nao e fornecido e current e 1", () => {
      expectReaction(makeContext(1), "primeiro_goal");
    });
  });

  describe("ultimo_goal", () => {
    test("dispara quando atinge a meta diaria padrao de 5", () => {
      expectReaction(
        makeContext(5, { previousCompletedSuggestionsToday: 4 }),
        "ultimo_goal"
      );
    });

    test("dispara quando atinge meta diaria customizada", () => {
      expectReaction(
        makeContext(3, {
          previousCompletedSuggestionsToday: 2,
          dailySuggestionTarget: 3,
        }),
        "ultimo_goal"
      );
    });

    test("nao dispara quando ja estava na meta antes", () => {
      expectReaction(
        makeContext(5, { previousCompletedSuggestionsToday: 5 }),
        null
      );
    });
  });

  describe("sem reacao", () => {
    test("retorna null para goals intermediarios", () => {
      expectReaction(
        makeContext(3, { previousCompletedSuggestionsToday: 2 }),
        null
      );
    });

    test("retorna null quando nao houve mudanca", () => {
      expectReaction(
        makeContext(2, { previousCompletedSuggestionsToday: 2 }),
        null
      );
    });

    test("retorna null quando current e 0", () => {
      expectReaction(makeContext(0), null);
    });
  });

  describe("casos de borda", () => {
    test("trata completedSuggestionsToday negativo como 0", () => {
      expectReaction(
        makeContext(-1, { previousCompletedSuggestionsToday: 0 }),
        null
      );
    });

    test("trata completedSuggestionsToday invalido como 0", () => {
      expectReaction(
        makeContext(Number.NaN, { previousCompletedSuggestionsToday: 0 }),
        null
      );
    });

    test("limita completedSuggestionsToday acima da meta ao target", () => {
      expectReaction(
        makeContext(10, { previousCompletedSuggestionsToday: 4 }),
        "ultimo_goal"
      );
    });

    test("usa 5 como target quando dailySuggestionTarget esta ausente", () => {
      expectReaction(
        makeContext(5, { previousCompletedSuggestionsToday: 4 }),
        "ultimo_goal"
      );
    });
  });
});