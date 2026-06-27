import { Router, Response } from "express";
import {
  authenticate,
  AuthenticatedRequest,
} from "../middlewares/auth.middleware.js";
import {
  getMockScreenTime,
  getTotalByCategory,
  isHighSocialUsage,
  isHighEntertainmentUsage,
} from "../mocks/screenTime.mock.js";

const router = Router();

router.use(authenticate);

// GET /users/screen-time
// Retorna os dados mockados de tempo de tela do usuário alimentando o motor de sugestões
router.get("/", (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const data = getMockScreenTime(userId);
  const totals = getTotalByCategory(data);

  res.status(200).json({
    userId: data.userId,
    date: data.date,
    apps: data.apps,
    summary: {
      totalMinutes: data.apps.reduce(
        (sum, app) => sum + app.minutesUsed, 0
      ),
      byCategory: totals,
      alerts: {
        highSocialUsage: isHighSocialUsage(data),
        highEntertainmentUsage: isHighEntertainmentUsage(data),
      },
    },
  });
});

export default router;