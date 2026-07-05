import {
  getWeatherCache,
  saveWeatherCache,
} from "../storage/offlineStorage";

const OPENWEATHER_API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000"
).replace(/\/$/, "");
const CACHE_VALIDITY_MS = 60 * 60 * 1000; // 1 hora em milissegundos

export interface WeatherData {
  temperature: number;
  condition: string;
  latitude: number;
  longitude: number;
  fetchedAt: string;
}

// Busca o clima na OpenWeatherMap usando coordenadas GPS
async function fetchFromAPI(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  if (!OPENWEATHER_API_KEY) {
    throw new Error("EXPO_PUBLIC_OPENWEATHER_API_KEY nao configurada.");
  }

  const url =
    `https://api.openweathermap.org/data/2.5/weather` +
    `?lat=${latitude}&lon=${longitude}` +
    `&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Erro na API de clima: ${response.status}`);
  }

  const data = await response.json();

  return {
    temperature: Math.round(data.main.temp),
    condition: data.weather?.[0]?.description ?? "unknown",
    latitude,
    longitude,
    fetchedAt: new Date().toISOString(),
  };
}

// Le o cache local e valida se ainda esta dentro da janela de 1 hora.
async function getValidCache(): Promise<WeatherData | null> {
  const cached = await getWeatherCache();
  if (!cached) return null;
  const age = Date.now() - new Date(cached.fetchedAt).getTime();

  if (age < CACHE_VALIDITY_MS) return cached;

  return null;
}

// Envia os dados de clima ao backend
async function sendToBackend(
  data: WeatherData,
  token: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/weather`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    console.error("Erro ao salvar clima no backend:", response.status);
  }
}

// Função principal — use essa em qualquer parte do app
export async function getWeather(
  latitude: number,
  longitude: number,
  token: string
): Promise<WeatherData | null> {
  const cached = await getValidCache();
  if (cached) {
    return cached;
  }

  // 1. Tenta buscar da API
  try {
    const data = await fetchFromAPI(latitude, longitude);

    // 2. Salva no cache local
    await saveWeatherCache(data);

    // 3. Envia ao backend
    await sendToBackend(data, token);

    return data;
  } catch (error) {
    console.warn("Falha na API de clima, tentando cache:", error);

    // 4. Fallback: usa o ultimo cache disponivel, mesmo expirado.
    const fallback = await getWeatherCache();
    if (fallback) {
      console.log("Usando dados de clima do cache.");
      return fallback;
    }

    console.error("Sem dados de clima disponíveis.");
    return null;
  }
}
