import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { resolveMascotState } from "./mascotStateMapper";
import type { MascotContext, MascotState } from "./mascotTypes";

function makeContext(
  completedSuggestionsToday: number,
  overrides: Partial<MascotContext> = {}
): MascotContext {
  return {
    completedSuggestionsToday,
    ...overrides,
  };
}

function expectMascotState(
  context: MascotContext,
  expectedState: MascotState
): void {
  assert.equal(resolveMascotState(context), expectedState);
}

describe("resolveMascotState", () => {
  describe("estado doente", () => {
    test("retorna doente quando hoje e ontem tem 0 sugestoes concluidas", () => {
      expectMascotState(
        makeContext(0, {
          history: [{ date: "2026-07-06", completedSuggestions: 0 }],
        }),
        "doente"
      );
    });
  });

  describe("estado triste", () => {
    test("retorna triste quando hoje tem 0 sugestoes e ontem teve acao", () => {
      expectMascotState(
        makeContext(0, {
          history: [{ date: "2026-07-06", completedSuggestions: 2 }],
        }),
        "triste"
      );
    });

    test("retorna triste quando hoje tem 0 sugestoes e nao ha historico", () => {
      expectMascotState(makeContext(0), "triste");
      expectMascotState(makeContext(0, { history: [] }), "triste");
    });
  });

  describe("estado neutro", () => {
    test("retorna neutro quando 1 sugestao foi concluida hoje", () => {
      expectMascotState(makeContext(1), "neutro");
    });
  });

  describe("estado feliz", () => {
    test("retorna feliz quando 2 sugestoes foram concluidas hoje", () => {
      expectMascotState(makeContext(2), "feliz");
    });

    test("retorna feliz quando 3 sugestoes foram concluidas hoje", () => {
      expectMascotState(makeContext(3), "feliz");
    });
  });

  describe("estado animado", () => {
    test("retorna animado quando 4 sugestoes foram concluidas hoje", () => {
      expectMascotState(makeContext(4), "animado");
    });

    test("retorna animado quando 5 sugestoes foram concluidas hoje", () => {
      expectMascotState(makeContext(5), "animado");
    });
  });

  describe("casos de borda", () => {
    test("trata completedSuggestionsToday negativo como 0", () => {
      expectMascotState(makeContext(-1), "triste");
    });

    test("limita completedSuggestionsToday maior que 5 ao total diario", () => {
      expectMascotState(makeContext(8), "animado");
    });

    test("trata completedSuggestionsToday invalido como 0", () => {
      expectMascotState(makeContext(Number.NaN), "triste");
    });

    test("usa 5 como total diario quando dailySuggestionTarget esta ausente", () => {
      expectMascotState(makeContext(5), "animado");
    });
  });
});
