import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  completeSuggestion,
  getSuggestions,
} from "../controllers/suggestions.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", getSuggestions);

router.post("/:suggestionId/complete", completeSuggestion);

export default router;
