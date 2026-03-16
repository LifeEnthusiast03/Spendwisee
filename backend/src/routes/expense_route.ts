import { Router } from "express";
import { isAuthenticated } from "../middleware/auth_middleware.js";
import {
	addExpense,
	getExpense,
	getTotalExpense,
	getcatagoryExpense,
} from "../controllers/expense_controllers.js";

const router = Router();

router.get("/expense", isAuthenticated, getExpense);

router.post("/addexpense", isAuthenticated, addExpense);

router.get("/expense/catagory", isAuthenticated, getcatagoryExpense);
router.get("/expense/total", isAuthenticated, getTotalExpense);

export default router;
