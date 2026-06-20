import { Router } from "express";
import { isAuthenticated } from "../middleware/auth_middleware.js";
import { genarateResponse, ChatMessage } from "../finantial_agant/agent.js";

const router = Router();

router.post("/chat", isAuthenticated, async (req, res) => {
  const { query, chatHistory } = req.body;

  if (!query || typeof query !== "string" || query.trim() === "") {
    return res.status(400).json({
      type: "error",
      title: "Invalid Request",
      summary: "Query is required and must be a non-empty string.",
    });
  }

  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      type: "error",
      title: "Unauthorized",
      summary: "You must be logged in to use the assistant.",
    });
  }

  // Validate chatHistory — must be an array of { role, content } objects
  const history: ChatMessage[] = [];
  if (Array.isArray(chatHistory)) {
    for (const msg of chatHistory) {
      if (
        msg &&
        typeof msg === "object" &&
        (msg.role === "user" || msg.role === "assistant") &&
        typeof msg.content === "string"
      ) {
        history.push({ role: msg.role, content: msg.content });
      }
    }
  }

  try {
    // Returns AgentResponse — a structured object the frontend can render directly
    const response = await genarateResponse(query.trim(), userId, history);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Agent error:", error);
    return res.status(500).json({
      type: "error",
      title: "Assistant Error",
      summary: "Something went wrong. Please try again.",
    });
  }
});

export default router;