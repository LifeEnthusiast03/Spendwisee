import { Router } from "express";
import { isAuthenticated } from "../middleware/auth_middleware.js";
import { addIncome, getIncome } from "../controllers/income_controllers.js";

const router = Router();

router.get("/income", isAuthenticated, getIncome);

router.post("/addincome", isAuthenticated, addIncome);

export default router;