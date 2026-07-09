import { Router } from "express";
import { getProgress } from "../controllers/progress.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", getProgress);

export default router;
