import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { saveGoals } from "../controllers/goals.controller.js";
 
const router = Router();
 
router.use(authenticate);
 
router.post("/", saveGoals);
 
export default router;