import { Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

// POST /users/weather — salva os dados de clima do usuário
export async function saveWeather(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.userId!;
  const { temperature, condition, latitude, longitude } = req.body;

  // Validação — campos obrigatórios
  if (
    temperature === undefined ||
    !condition ||
    latitude === undefined ||
    longitude === undefined
  ) {
    res.status(400).json({
      error:
        "Os campos 'temperature', 'condition', 'latitude' e 'longitude' são obrigatórios.",
    });
    return;
  }

  try {
    const weather = await prisma.weatherData.create({
      data: { userId, temperature, condition, latitude, longitude },
    });

    res.status(201).json({
      message: "Dados de clima salvos com sucesso.",
      weather: {
        id: weather.id,
        temperature: weather.temperature,
        condition: weather.condition,
        latitude: weather.latitude,
        longitude: weather.longitude,
        fetchedAt: weather.fetchedAt,
      },
    });
  } catch (error) {
    console.error("[saveWeather]", error);
    res.status(500).json({ error: "Erro interno ao salvar os dados de clima." });
  }
}

// GET /users/weather — retorna o último clima salvo
export async function getLastWeather(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.userId!;

  try {
    const weather = await prisma.weatherData.findFirst({
      where: { userId },
      orderBy: { fetchedAt: "desc" },
    });

    if (!weather) {
      res.status(200).json({
        message: "Nenhum dado de clima registrado ainda.",
        weather: null,
      });
      return;
    }

    res.status(200).json({
      weather: {
        id: weather.id,
        temperature: weather.temperature,
        condition: weather.condition,
        latitude: weather.latitude,
        longitude: weather.longitude,
        fetchedAt: weather.fetchedAt,
      },
    });
  } catch (error) {
    console.error("[getLastWeather]", error);
    res.status(500).json({ error: "Erro interno ao buscar os dados de clima." });
  }
}