import { Router } from "express";
import { isAuthenticated } from "../middleware/auth_middleware.js";
import { genarateResponse, streamGenerateResponse, ChatMessage, SseEvent } from "../finantial_agant/agent.js";

const router = Router();

// ─── Existing non-streaming endpoint (kept as-is) ────────────────────────────
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

// ─── Streaming SSE endpoint ───────────────────────────────────────────────────
// Frontend reads this with fetch() + manual SSE parsing (not EventSource, since
// we need session cookie auth on a POST body).
router.post("/chat/stream", isAuthenticated, async (req, res) => {
  const { query, chatHistory } = req.body;

  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ type: "error", title: "Unauthorized", summary: "Login required." });
    return;
  }

  if (!query || typeof query !== "string" || query.trim() === "") {
    res.status(400).json({ type: "error", title: "Invalid Request", summary: "Query is required." });
    return;
  }

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

  // SSE headers — disable buffering so chunks flush immediately
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // nginx: disable proxy buffering
  res.flushHeaders();

  // AbortController to cancel the agent run when the client disconnects
  const ac = new AbortController();
  req.on("close", () => ac.abort());

  const emit = (event: SseEvent) => {
    if (res.writableEnded) return;
    res.write(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
  };

  try {
    await streamGenerateResponse(query.trim(), userId, history, emit, ac.signal);
  } catch (err) {
    console.error("[/chat/stream] unhandled error:", err);
    if (!res.writableEnded) {
      emit({ type: "error", message: "Stream failed unexpectedly." });
    }
  } finally {
    if (!res.writableEnded) res.end();
  }
});

export default router;