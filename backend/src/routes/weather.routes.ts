import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { saveWeather, getLastWeather } from "../controllers/weather.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", saveWeather);

router.get("/", getLastWeather);

export default router;