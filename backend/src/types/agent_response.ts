import { z } from "zod";

// ─── Shared structured response schema for all agents ─────────────────────────
// Every agent returns this shape — the frontend can render each type differently.
//
// type    → drives the UI card style (success=green, error=red, list=table, advice=tips panel)
// title   → card heading
// summary → one-line description or confirmation message
// details → key/value pairs (e.g. "Category: FOOD", "Amount: ₹5000")
// items   → list of records when showing multiple rows
// tips    → actionable advice bullets

export const AgentResponseSchema = z.object({
  type: z
    .enum(["success", "error", "info", "advice", "list"])
    .describe(
      "Response type: 'success' for confirmations, 'error' for failures, " +
        "'info' for summaries, 'advice' for financial advice, 'list' for record listings"
    ),
  title: z.string().describe("Short heading for the response card (max ~6 words)"),
  summary: z
    .string()
    .describe("One-sentence summary of the result or the main point"),
  details: z
    .array(
      z.object({
        label: z.string().describe("Field name, e.g. 'Category', 'Amount', 'Period'"),
        value: z.string().describe("Field value, e.g. 'FOOD', '₹5000', 'Monthly'"),
      })
    )
    .optional()
    .describe("Key-value pairs for success/info responses (show as a detail card)"),
  items: z
    .array(z.string())
    .optional()
    .describe(
      "List of formatted record strings for 'list' type responses (one record per item)"
    ),
  tips: z
    .array(z.string())
    .optional()
    .describe(
      "Actionable advice bullets for 'advice' type responses (2-5 concrete next steps)"
    ),
});

export type AgentResponse = z.infer<typeof AgentResponseSchema>;
