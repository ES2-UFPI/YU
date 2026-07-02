import { Response } from "express";
import { getSuggestions } from "../controllers/suggestions.controller.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

function createResponse() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  return res as unknown as Response;
}

describe("getSuggestions", () => {
  it("deve retornar 400 quando o contexto não for enviado", async () => {
    const req = {
      userId: "user-123",
      body: {},
    } as AuthenticatedRequest;
    const res = createResponse();

    await getSuggestions(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "O campo 'context' é obrigatório e deve ser um objeto.",
    });
  });

  it("deve retornar 400 quando a localização não usar coordenadas numéricas", async () => {
    const req = {
      userId: "user-123",
      body: {
        context: {
          location: {
            latitude: "-3.7319",
            longitude: -38.5267,
          },
        },
      },
    } as AuthenticatedRequest;
    const res = createResponse();

    await getSuggestions(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error:
        "Os campos 'context.location.latitude' e 'context.location.longitude' devem ser números.",
    });
  });
});
