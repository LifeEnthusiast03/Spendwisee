import { Router } from "express";
import { isAuthenticated } from "../middleware/auth_middleware.js";
import {
    addGoal,
    addMoneyToGoal,
    removeMoneyFromGoal,
    removeMoneyFromGoals,
    updateGoal,
    deleteGoal,
    totalMoneyInGoal,
    getGoals,
} from "../controllers/goal_controllers.js";

const router = Router();

// ===================== GOAL ROUTES =====================
router.get("/goal", isAuthenticated, getGoals);
router.post("/goal", isAuthenticated, addGoal);
router.put("/goal/:goalid", isAuthenticated, updateGoal);
router.delete("/goal/:goalid", isAuthenticated, deleteGoal);

// ===================== GOAL MONEY ROUTES =====================
router.post("/goal/:goalid/addmoney", isAuthenticated, addMoneyToGoal);
router.post("/goal/:goalid/removemoney", isAuthenticated, removeMoneyFromGoal);
router.post("/goal/removemoney", isAuthenticated, removeMoneyFromGoals);
router.get("/goal/:goalid/totalmoney", isAuthenticated, totalMoneyInGoal);

export default router;
