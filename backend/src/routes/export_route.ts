import { Router } from "express";
import { isAuthenticated } from "../middleware/auth_middleware.js";
import { exportTransactions } from "../controllers/export_controllers.js";

const router = Router();

// ===================== EXPORT ROUTES =====================
router.get("/export/transactions", isAuthenticated, exportTransactions);

export default router;
