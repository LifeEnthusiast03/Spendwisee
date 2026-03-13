import { Router } from "express";
import { isAuthenticated } from "../middleware/auth_middleware.js";
import { addExpense, getExpense } from "../controllers/expense_controllers.js";

const router = Router();

router.get("/expense", isAuthenticated, getExpense);

router.post("/addexpense", isAuthenticated, addExpense);

export default router;
