import * as Location from "expo-location";
import { Alert } from "react-native";

const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

export type CollectedLocation = {
  latitude: number;
  longitude: number;
};

export async function collectAndSendLocation(
  token: string
): Promise<CollectedLocation | null> {
  // Solicita permissão de localização
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== "granted") {
    Alert.alert(
      "Permissão necessária",
      "Ative o acesso à localização nas configurações do dispositivo para receber sugestões personalizadas.",
      [{ text: "OK" }]
    );
    return null;
  }

  try {
    // Obtém coordenadas GPS com alta precisão
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const { latitude, longitude } = position.coords;

    // Envia ao backend
    const response = await fetch(`${API_BASE_URL}/users/location`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ latitude, longitude }),
    });

    if (!response.ok) {
      console.error("Erro ao salvar localização:", response.status);
    }

    return { latitude, longitude };
  } catch (error) {
    console.error("Erro ao coletar localização:", error);
    return null;
  }
}
