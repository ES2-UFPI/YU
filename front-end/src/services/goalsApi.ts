import { getAnonymousIdToken } from "./firebase";

export type Goal = {
    id: string;
    name: string;
    description?: string;
    shortDescription?: string;
    icon?: string;
};

type GoalsResponse = {
    goals?: Goal[];
    error?: string;
    erro?: string;
};

const API_BASE_URL = (
    process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

async function requestGoals(
    path: string,
    options: RequestInit = {}
): Promise<GoalsResponse> {
    const token = await getAnonymousIdToken();
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });
    const data = (await response.json().catch(() => ({}))) as GoalsResponse;

    if (!response.ok) {
        throw new Error(data.error || data.erro || "Nao foi possivel carregar os objetivos.");
    }

    return data;
}

export async function getSavedGoals(): Promise<string[]> {
    const data = await requestGoals("/users/goals");

    return data.goals?.map((goal) => goal.id) ?? [];
}

export async function saveSelectedGoals(goalIds: string[]): Promise<void> {
    await requestGoals("/users/goals", {
        method: "POST",
        body: JSON.stringify({ goalIds }),
    });
}
