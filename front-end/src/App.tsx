import { useEffect } from "react";
import { AppRoutes } from "./Routes";
import { getAnonymousIdToken } from "./services/firebase";
import { collectAndSendLocation } from "./services/location.service";
import { getWeather } from "./services/weather";

export default function App() {
  useEffect(() => {
    async function collectInitialContext() {
      try {
        const token = await getAnonymousIdToken();
        const location = await collectAndSendLocation(token);

        if (location) {
          await getWeather(location.latitude, location.longitude, token);
        }
      } catch (error) {
        console.error("Erro ao coletar contexto inicial:", error);
      }
    }

    collectInitialContext();
  }, []);

  return <AppRoutes />;
}
