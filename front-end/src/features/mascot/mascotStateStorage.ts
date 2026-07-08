import AsyncStorage from "@react-native-async-storage/async-storage";

import type { MascotContext, MascotState } from "./mascotTypes";
import { resolveMascotState } from "./mascotStateMapper";

const LAST_MASCOT_STATE_KEY = "@yu:mascot:last_state";
const SAFE_FALLBACK_MASCOT_STATE: MascotState = "neutro";
const VALID_MASCOT_STATES: MascotState[] = [
  "doente",
  "triste",
  "neutro",
  "feliz",
  "animado",
];

export async function saveLastMascotState(
  state: MascotState
): Promise<void> {
  if (!isMascotState(state)) {
    return;
  }

  try {
    await AsyncStorage.setItem(LAST_MASCOT_STATE_KEY, state);
  } catch (error) {
    console.warn("Nao foi possivel salvar o estado do mascote.", error);
  }
}

export async function getLastMascotState(): Promise<MascotState | null> {
  try {
    const storedState = await AsyncStorage.getItem(LAST_MASCOT_STATE_KEY);

    if (!isMascotState(storedState)) {
      return null;
    }

    return storedState;
  } catch (error) {
    console.warn("Nao foi possivel ler o estado do mascote.", error);
    return null;
  }
}

export async function resolveAndPersistMascotState(
  context: MascotContext
): Promise<MascotState> {
  const state = resolveMascotState(context);

  await saveLastMascotState(state);

  return state;
}

export async function getMascotStateWithOfflineFallback(
  context: MascotContext | null
): Promise<MascotState> {
  if (context) {
    return resolveAndPersistMascotState(context);
  }

  const lastState = await getLastMascotState();

  return lastState ?? SAFE_FALLBACK_MASCOT_STATE;
}

function isMascotState(value: unknown): value is MascotState {
  return (
    typeof value === "string" &&
    VALID_MASCOT_STATES.includes(value as MascotState)
  );
}
