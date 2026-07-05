import { Router } from "express";
import { isAuthenticated } from "../middleware/auth_middleware.js";
import {
  addIncomeGoal,
  getIncomeGoals,
  getIncomeGoalByCategory,
  updateIncomeGoal,
  deleteIncomeGoal,
} from "../controllers/income_goal_controllers.js";

const router = Router();

// ===================== INCOME GOAL ROUTES =====================
router.post("/incomegoal", isAuthenticated, addIncomeGoal);
router.get("/incomegoal", isAuthenticated, getIncomeGoals);
router.get("/incomegoal/category/:category", isAuthenticated, getIncomeGoalByCategory);
router.put("/incomegoal/:goalid", isAuthenticated, updateIncomeGoal);
router.delete("/incomegoal/:goalid", isAuthenticated, deleteIncomeGoal);

export default router;
