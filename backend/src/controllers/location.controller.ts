import { Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

// POST /users/location — salva a localização do usuário
export async function saveLocation(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.userId!;
  const { latitude, longitude } = req.body;

  // Validação — campos obrigatórios
  if (latitude === undefined || longitude === undefined) {
    res.status(400).json({
      error: "Os campos 'latitude' e 'longitude' são obrigatórios.",
    });
    return;
  }

  // Validação — limites geográficos
  if (latitude < -90 || latitude > 90) {
    res.status(400).json({
      error: "Latitude inválida. Deve estar entre -90 e 90.",
    });
    return;
  }

  if (longitude < -180 || longitude > 180) {
    res.status(400).json({
      error: "Longitude inválida. Deve estar entre -180 e 180.",
    });
    return;
  }

  try {
    const location = await prisma.userLocation.create({
      data: { userId, latitude, longitude },
    });

    res.status(201).json({
      message: "Localização salva com sucesso.",
      location: {
        id: location.id,
        latitude: location.latitude,
        longitude: location.longitude,
        capturedAt: location.capturedAt,
      },
    });
  } catch (error) {
    console.error("[saveLocation]", error);
    res.status(500).json({ error: "Erro interno ao salvar a localização." });
  }
}

// GET /users/location — retorna a última localização salva
export async function getLastLocation(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.userId!;

  try {
    const location = await prisma.userLocation.findFirst({
      where: { userId },
      orderBy: { capturedAt: "desc" },
    });

    if (!location) {
      res.status(200).json({
        message: "Nenhuma localização registrada ainda.",
        location: null,
      });
      return;
    }

    res.status(200).json({
      location: {
        id: location.id,
        latitude: location.latitude,
        longitude: location.longitude,
        capturedAt: location.capturedAt,
      },
    });
  } catch (error) {
    console.error("[getLastLocation]", error);
    res.status(500).json({ error: "Erro interno ao buscar a localização." });
  }
}