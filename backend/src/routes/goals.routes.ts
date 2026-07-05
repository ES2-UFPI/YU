import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  saveGoals,
  getGoals,
  completeGoal,
} from "../controllers/goals.controller.js";
 
const router = Router();
 
router.use(authenticate);
 
router.post("/", saveGoals);

router.get("/", getGoals);

router.post("/:goalId/complete", completeGoal);
 
export default router;
