import { Router } from "express";
import { isAuthenticated } from "../middleware/auth_middleware.js";
import {
	addExpense,
	deleteExpense,
	getExpense,
	getTotalExpense,
	getcatagoryExpense,
	addExpenseBudget,
	getExpenseBudgets,
	getExpenseBudgetByType,
	updateExpenseBudget,
	deleteExpenseBudget,
} from "../controllers/expense_controllers.js";

const router = Router();

router.get("/expense", isAuthenticated, getExpense);
router.post("/addexpense", isAuthenticated, addExpense);
router.delete("/expense/:expenseid", isAuthenticated, deleteExpense);
router.get("/expense/catagory", isAuthenticated, getcatagoryExpense);
router.get("/expense/total", isAuthenticated, getTotalExpense);

// ============= Expense Budget Routes =============
router.post("/expensebudget", isAuthenticated, addExpenseBudget);
router.get("/expensebudget", isAuthenticated, getExpenseBudgets);
router.get("/expensebudget/:type", isAuthenticated, getExpenseBudgetByType);
router.put("/expensebudget/:budgetid", isAuthenticated, updateExpenseBudget);
router.delete("/expensebudget/:budgetid", isAuthenticated, deleteExpenseBudget);

export default router;
