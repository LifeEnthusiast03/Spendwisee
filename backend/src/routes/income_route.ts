import { Router } from "express";
import { isAuthenticated } from "../middleware/auth_middleware.js";
import {
  addIncome,
  deleteIncome,
  getIncome,
  getTotalIncome,
  getcatagoryIncome,
  addIncomeGoal,
  getIncomeGoals,
  getIncomeGoalByCategory,
  updateIncomeGoal,
  deleteIncomeGoal,
} from "../controllers/income_controllers.js";

const router = Router();

// ===================== INCOME ROUTES =====================
router.get("/income", isAuthenticated, getIncome);
router.post("/addincome", isAuthenticated, addIncome);
router.delete("/income/:incomeid", isAuthenticated, deleteIncome);
router.get("/income/catagory", isAuthenticated, getcatagoryIncome);
router.get("/income/total", isAuthenticated, getTotalIncome);

// ===================== INCOME GOAL ROUTES =====================
router.post("/incomegoal", isAuthenticated, addIncomeGoal);
router.get("/incomegoal", isAuthenticated, getIncomeGoals);
router.get("/incomegoal/category/:category", isAuthenticated, getIncomeGoalByCategory);
router.put("/incomegoal/:goalid", isAuthenticated, updateIncomeGoal);
router.delete("/incomegoal/:goalid", isAuthenticated, deleteIncomeGoal);

export default router;