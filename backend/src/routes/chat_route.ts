import { Router } from "express";
import { isAuthenticated } from "../middleware/auth_middleware.js";
import { genarateResponse } from "../finantial_agant/agent.js";

const router = Router();


router.post("/chat", isAuthenticated, async (req, res) => {
    const { query } = req.body;
    const result = await genarateResponse(query);
    res.json({ result });
})


export default router;