import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { getSuggestions } from "../controllers/suggestions.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", getSuggestions);

export default router;
