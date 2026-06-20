import { Agent, RunContext, tool } from "@openai/agents";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { ExpenseCategory } from "../types/type.js";
import { AgentResponseSchema } from "../types/agent_response.js";

// ─── RunContext type shared with agent.ts ─────────────────────────────────────
export interface UserContext {
  userId: number;
}

// ─── Valid categories (mirrors the DB enum) ───────────────────────────────────
const VALID_CATEGORIES = [
  "FOOD",
  "TRANSPORT",
  "RENT",
  "SHOPPING",
  "ENTERTAINMENT",
  "BILLS",
  "OTHER",
] as const;

type BudgetType = "WEEKLY" | "MONTHLY" | "YEARLY";

// ─── Tool: add_budget ─────────────────────────────────────────────────────────
const addBudgetTool = tool({
  name: "add_budget",
  description:
    "Add a new expense budget for a specific category. Categories: FOOD, TRANSPORT, RENT, SHOPPING, ENTERTAINMENT, BILLS, OTHER. Types: WEEKLY, MONTHLY, YEARLY.",
  strict: true,
  parameters: z.object({
    category: z
      .enum(VALID_CATEGORIES)
      .describe("The expense category for this budget"),
    amount: z.number().describe("The budget limit amount (must be positive)"),
    type: z
      .enum(["WEEKLY", "MONTHLY", "YEARLY"])
      .describe("Budget period type: WEEKLY, MONTHLY, or YEARLY"),
  }),
  execute: async (
    { category, amount, type },
    runContext?: RunContext<UserContext>
  ) => {
    const userId = runContext?.context.userId;
    if (!userId) {
      return "Error: Unable to identify user. Please log in again.";
    }

    if (amount <= 0) {
      return "Error: Budget amount must be a positive number.";
    }

    const now = new Date();
    let periodEnd = new Date(now);

    if (type === "WEEKLY") {
      periodEnd.setDate(periodEnd.getDate() + 7);
    } else if (type === "MONTHLY") {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else if (type === "YEARLY") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    // Check for existing active overlapping budget
    const existingBudget = await prisma.expenseBudget.findFirst({
      where: {
        userId,
        category: category as ExpenseCategory,
        type: type as BudgetType,
        periodStart: { lte: periodEnd },
        periodEnd: { gte: now },
      },
    });

    if (existingBudget) {
      return `An active ${type} budget for ${category} already exists (₹${existingBudget.amount}) running until ${existingBudget.periodEnd.toDateString()}. Please update the existing budget instead.`;
    }

    const newBudget = await prisma.expenseBudget.create({
      data: {
        amount,
        category: category as ExpenseCategory,
        type: type as BudgetType,
        userId,
        periodStart: now,
        periodEnd,
      },
    });

    return `✅ Budget created successfully!\n- Category: ${newBudget.category}\n- Amount: ₹${newBudget.amount}\n- Type: ${newBudget.type}\n- Period: ${newBudget.periodStart.toDateString()} → ${newBudget.periodEnd.toDateString()}`;
  },
});

// ─── Tool: get_budgets ────────────────────────────────────────────────────────
const getBudgetsTool = tool({
  name: "get_budgets",
  description:
    "Retrieve all expense budgets for the current user, including how much has been spent vs the budget limit (utilization).",
  strict: true,
  parameters: z.object({}),
  execute: async (_params, runContext?: RunContext<UserContext>) => {
    const userId = runContext?.context.userId;
    if (!userId) {
      return "Error: Unable to identify user. Please log in again.";
    }

    const budgets = await prisma.expenseBudget.findMany({
      where: { userId },
      orderBy: [{ type: "asc" }, { category: "asc" }],
    });

    if (budgets.length === 0) {
      return "You have no budgets set up yet. You can add one by saying something like: 'Add a monthly food budget of ₹5000'.";
    }

    const now = new Date();
    const budgetLines = budgets.map((b) => {
      const isActive = now >= b.periodStart && now <= b.periodEnd;
      const utilized = b.fulfilledAmount ?? 0;
      const utilizationPct =
        b.amount > 0 ? ((utilized / b.amount) * 100).toFixed(1) : "0.0";
      const remaining = b.amount - utilized;
      const status = isActive ? "🟢 Active" : "⚫ Expired";

      return (
        `• [${status}] ${b.category} (${b.type})\n` +
        `  Budget: ₹${b.amount} | Spent: ₹${utilized} | Remaining: ₹${remaining}\n` +
        `  Utilization: ${utilizationPct}% | Period: ${b.periodStart.toDateString()} → ${b.periodEnd.toDateString()}`
      );
    });

    return `📊 Your Budgets (${budgets.length} total):\n\n${budgetLines.join("\n\n")}`;
  },
});

// ─── Tool: budget_advice ──────────────────────────────────────────────────────
const budgetAdviceTool = tool({
  name: "budget_advice",
  description:
    "Analyze the user's current budget utilization and spending patterns, then provide personalized financial advice and recommendations.",
  strict: true,
  parameters: z.object({}),
  execute: async (_params, runContext?: RunContext<UserContext>) => {
    const userId = runContext?.context.userId;
    if (!userId) {
      return "Error: Unable to identify user. Please log in again.";
    }

    const now = new Date();

    // Fetch active budgets and recent expenses in parallel
    const [budgets, recentExpenses] = await Promise.all([
      prisma.expenseBudget.findMany({
        where: { userId, periodStart: { lte: now }, periodEnd: { gte: now } },
      }),
      prisma.expense.findMany({
        where: {
          userId,
          date: {
            gte: new Date(now.getFullYear(), now.getMonth(), 1), // current month
          },
        },
        orderBy: { date: "desc" },
      }),
    ]);

    if (budgets.length === 0) {
      return (
        "📋 You have no active budgets set up yet.\n\n" +
        "💡 Tip: Start by setting monthly budgets for your main expense categories like FOOD, TRANSPORT, and BILLS. " +
        "This helps you track spending and stay on target.\n\n" +
        "Example: 'Add a monthly food budget of ₹8000'"
      );
    }

    const adviceLines: string[] = [];

    // Per-budget analysis
    for (const b of budgets) {
      const utilized = b.fulfilledAmount ?? 0;
      const pct = b.amount > 0 ? (utilized / b.amount) * 100 : 0;
      const remaining = b.amount - utilized;

      if (pct >= 90) {
        adviceLines.push(
          `🚨 ${b.category}: You've used ${pct.toFixed(1)}% of your ${b.type.toLowerCase()} budget (₹${utilized}/₹${b.amount}). Only ₹${remaining} left — avoid non-essential ${b.category.toLowerCase()} spending for the rest of the period.`
        );
      } else if (pct >= 70) {
        adviceLines.push(
          `⚠️  ${b.category}: You're at ${pct.toFixed(1)}% of your ${b.type.toLowerCase()} budget. ₹${remaining} remaining — keep an eye on this category.`
        );
      } else if (pct <= 20 && utilized > 0) {
        adviceLines.push(
          `✅ ${b.category}: Great job! You've only used ${pct.toFixed(1)}% of your budget (₹${utilized}/₹${b.amount}). You're well within limits.`
        );
      } else {
        adviceLines.push(
          `📈 ${b.category}: On track at ${pct.toFixed(1)}% (₹${utilized}/₹${b.amount}). ₹${remaining} remaining.`
        );
      }
    }

    // Overall summary
    const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
    const totalSpent = budgets.reduce((s, b) => s + (b.fulfilledAmount ?? 0), 0);
    const overallPct =
      totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : "0.0";

    const categoriesWithNoBudget = recentExpenses
      .map((e) => e.category)
      .filter((cat) => !budgets.find((b) => b.category === cat));
    const uniqueUnbudgeted = [...new Set(categoriesWithNoBudget)];

    let advice =
      `💰 Budget Health Report\n\n` +
      `Overall: ₹${totalSpent} spent of ₹${totalBudget} total budget (${overallPct}%)\n\n` +
      adviceLines.join("\n\n");

    if (uniqueUnbudgeted.length > 0) {
      advice += `\n\n📌 You have recent expenses in unbudgeted categories: ${uniqueUnbudgeted.join(", ")}. Consider adding budgets for these too.`;
    }

    return advice;
  },
});

// ─── BudgetAgent ──────────────────────────────────────────────────────────────
export const BudgetAgent = new Agent<UserContext, typeof AgentResponseSchema>({
  name: "BudgetAgent",
  instructions: `You are a specialized budget management assistant within the SpendWise app.

You help users:
1. Create expense budgets for categories (FOOD, TRANSPORT, RENT, SHOPPING, ENTERTAINMENT, BILLS, OTHER) with period types (WEEKLY, MONTHLY, YEARLY)
2. View their existing budgets and spending utilization
3. Get personalized budget advice and financial health analysis

Always use the available tools to interact with the user's budget data. Never make up budget data.
When adding a budget, if the user doesn't specify the type, assume MONTHLY.
When showing budgets, always call get_budgets to get real-time data.
When giving advice, always call budget_advice to get the latest utilization data.

Return your final answer ALWAYS as the structured JSON schema with fields: type, title, summary, and optionally details/items/tips.`,
  model: "gpt-4o-mini",
  outputType: AgentResponseSchema,
  tools: [addBudgetTool, getBudgetsTool, budgetAdviceTool],
});
