import { Router } from "express";
import { isAuthenticated } from "../middleware/auth_middleware.js";
import { addIncome, deleteIncome, getIncome, getTotalIncome,getcatagoryIncome } from "../controllers/income_controllers.js";
const router = Router();

router.get("/income", isAuthenticated, getIncome);
router.post("/addincome", isAuthenticated, addIncome);
router.delete("/income/:incomeid", isAuthenticated, deleteIncome);
router.get("/income/catagory", isAuthenticated, getcatagoryIncome);
router.get("/income/total", isAuthenticated, getTotalIncome);

export default router;