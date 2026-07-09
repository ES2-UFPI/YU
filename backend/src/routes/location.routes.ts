import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  saveLocation,
  getLastLocation,
} from "../controllers/location.controller.js";

const router = Router();

router.use(authenticate);

// POST /users/location — salva localização
router.post("/", saveLocation);

// GET /users/location — consulta última localização
router.get("/", getLastLocation);

export default router;