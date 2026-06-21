import { Agent, run, user, assistant, InputGuardrail, InputGuardrailTripwireTriggered } from "@openai/agents";
import { z } from "zod";
import { BudgetAgent, UserContext } from "./budget_agent.js";
import { IncomeExpenseAgent } from "./income_expense_agent.js";
import { IncomeGoalAgent } from "./incomegoal_agent.js";
import { GoalAgent } from "./goal_agent.js";
import { FinancialAdviserAgent } from "./finantial_adviser_agent.js";
import { AgentResponse } from "../types/agent_response.js";

const financeGuardrailAgent = new Agent({
  name: "FinanceGuardrail",
  instructions: "Check if the user's question or intent is related to personal finance, budgeting, income, expenses, savings, investments, or general financial planning. Simple greetings like 'hello' or 'hi' are acceptable. Reject totally unrelated topics like math homework, coding, cooking, sports, etc.",
  outputType: z.object({
    isFinanceRelated: z.boolean(),
    reasoning: z.string(),
  }),
  model: "gpt-4o-mini"
});

const financeGuardrail: InputGuardrail = {
  name: "Finance Guardrail",
  runInParallel: false,
  execute: async ({ input, context }) => {
    const result = await run(financeGuardrailAgent, input, { context });
    return {
      outputInfo: result.finalOutput,
      tripwireTriggered: result.finalOutput?.isFinanceRelated === false,
    };
  },
};

// ─── Manager Agent (Orchestrator) ────────────────────────────────────────────
// Single entry point. Routes every user query to the right specialist agent.
const ManagerAgent = new Agent<UserContext>({
  name: "ManagerAgent",
  instructions: `You are the SpendWise financial assistant manager. Your job is to understand the user's intent and hand off to the right specialist:

- **Income / Expense tracking** (add income, add expense, view balance summary): → IncomeExpenseAgent
- **Budget management** (add/view budgets, budget advice, spending limits): → BudgetAgent
- **Income goals** (set income targets, view income goal progress, income goal advice): → IncomeGoalAgent
- **Savings goals** (create savings goals, view goal progress, goal advice): → GoalAgent
- **General financial advice** (overall financial health, investment tips, how to save more, financial planning): → FinancialAdviserAgent

Routing rules:
- If the query mentions "income" AND "goal/target", route to IncomeGoalAgent
- If the query mentions "budget" or "spending limit", route to BudgetAgent
- If the query mentions "add income" or "add expense" or "record income/expense", route to IncomeExpenseAgent
- If the query mentions "goal" or "save for" or "savings", route to GoalAgent
- If the query asks for overall advice, planning, or "how am I doing financially", route to FinancialAdviserAgent

Always pass the full user query to the sub-agent so it has complete context.`,
  model: "gpt-4o-mini",
  inputGuardrails: [financeGuardrail],
  handoffs: [
    IncomeExpenseAgent,
    BudgetAgent,
    IncomeGoalAgent,
    GoalAgent,
    FinancialAdviserAgent,
  ],
});

// ─── Chat history message shape (matches what the frontend sends) ────────────
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ─── Entry point used by chat_route.ts ───────────────────────────────────────
export const genarateResponse = async (
  query: string,
  userId: number,
  chatHistory: ChatMessage[] = []
): Promise<AgentResponse> => {
  // Build the full input: past messages + the new user query.
  // Use the SDK's user() and assistant() helpers to produce correctly-shaped message objects.
  const input = [
    ...chatHistory.map((msg) =>
      msg.role === "user" ? user(msg.content) : assistant(msg.content)
    ),
    user(query),
  ];

  try {
    const result = await run(ManagerAgent, input, {
      context: { userId } satisfies UserContext,
    });

    // result.finalOutput is AgentResponse when ManagerAgent passes through sub-agent output
    if (result.finalOutput && typeof result.finalOutput === "object") {
      return result.finalOutput as AgentResponse;
    }

    // Fallback for plain-string responses from the ManagerAgent itself
    return {
      type: "info",
      title: "Response",
      summary: typeof result.finalOutput === "string"
        ? result.finalOutput
        : "I'm sorry, I couldn't generate a response. Please try again.",
    };
  } catch (error) {
    if (error instanceof InputGuardrailTripwireTriggered) {
      return {
        type: "error",
        title: "Off-Topic Question",
        summary: "I can only help with questions related to personal finance, budgeting, goals, and savings. Please ask me something related to managing your money!",
      };
    }
    console.error("ManagerAgent run error:", error);
    return {
      type: "error",
      title: "Error",
      summary: "I'm sorry, I encountered an internal error. Please try again later.",
    };
  }
};