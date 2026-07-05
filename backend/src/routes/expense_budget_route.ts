import { Router } from "express";
import { isAuthenticated } from "../middleware/auth_middleware.js";
import {
  addExpenseBudget,
  getExpenseBudgets,
  getExpenseBudgetByCategory,
  updateExpenseBudget,
  deleteExpenseBudget,
} from "../controllers/expense_budget_controllers.js";

const router = Router();

// ===================== EXPENSE BUDGET ROUTES =====================
router.post("/expensebudget", isAuthenticated, addExpenseBudget);
router.get("/expensebudget", isAuthenticated, getExpenseBudgets);
router.get("/expensebudget/category/:category", isAuthenticated, getExpenseBudgetByCategory);
router.put("/expensebudget/:budgetid", isAuthenticated, updateExpenseBudget);
router.delete("/expensebudget/:budgetid", isAuthenticated, deleteExpenseBudget);

export default router;
