import { Agent, RunContext, tool } from "@openai/agents";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { IncomeCategory } from "../types/type.js";
import { UserContext } from "./budget_agent.js";
import { AgentResponseSchema } from "../types/agent_response.js";

const INCOME_CATEGORIES = [
  "SALARY",
  "FREELANCE",
  "BUSINESS",
  "INVESTMENT",
  "GIFT",
  "OTHER",
] as const;

type GoalPeriodType = "WEEKLY" | "MONTHLY" | "YEARLY";

// ─── Tool: add_income_goal ────────────────────────────────────────────────────
const addIncomeGoalTool = tool({
  name: "add_income_goal",
  description:
    "Create a new income goal for a specific category and period. This sets a target income amount the user wants to earn in the given period. Categories: SALARY, FREELANCE, BUSINESS, INVESTMENT, GIFT, OTHER. Types: WEEKLY, MONTHLY, YEARLY.",
  strict: true,
  parameters: z.object({
    category: z.enum(INCOME_CATEGORIES).describe("Income category for this goal"),
    amount: z.number().describe("Target income amount to achieve (must be positive)"),
    type: z
      .enum(["WEEKLY", "MONTHLY", "YEARLY"])
      .describe("Goal period type: WEEKLY, MONTHLY, or YEARLY"),
  }),
  execute: async (
    { category, amount, type },
    runContext?: RunContext<UserContext>
  ): Promise<string> => {
    const userId = runContext?.context.userId;
    if (!userId) return "Error: Unable to identify user. Please log in again.";
    if (amount <= 0) return "Error: Amount must be a positive number.";

    const now = new Date();
    const periodEnd = new Date(now);
    if (type === "WEEKLY") periodEnd.setDate(periodEnd.getDate() + 7);
    else if (type === "MONTHLY") periodEnd.setMonth(periodEnd.getMonth() + 1);
    else if (type === "YEARLY") periodEnd.setFullYear(periodEnd.getFullYear() + 1);

    // Check for existing overlapping active goal
    const existing = await prisma.incomeGoal.findFirst({
      where: {
        userId,
        category: category as IncomeCategory,
        type: type as GoalPeriodType,
        periodStart: { lte: periodEnd },
        periodEnd: { gte: now },
      },
    });

    if (existing) {
      return (
        `An active ${type} income goal for ${category} already exists ` +
        `(Target: ₹${existing.amount}) running until ${existing.periodEnd.toDateString()}. ` +
        `Please update the existing goal instead.`
      );
    }

    const goal = await prisma.incomeGoal.create({
      data: {
        amount,
        type: type as GoalPeriodType,
        category: category as IncomeCategory,
        userId,
        periodStart: now,
        periodEnd,
      },
    });

    return (
      `✅ Income goal created!\n` +
      `- Category: ${goal.category}\n` +
      `- Target: ₹${goal.amount}\n` +
      `- Type: ${goal.type}\n` +
      `- Period: ${goal.periodStart.toDateString()} → ${goal.periodEnd.toDateString()}`
    );
  },
});

// ─── Tool: get_income_goals ───────────────────────────────────────────────────
const getIncomeGoalsTool = tool({
  name: "get_income_goals",
  description:
    "Retrieve all income goals for the current user, including how much has been earned vs the target (fulfillment progress).",
  strict: true,
  parameters: z.object({}),
  execute: async (
    _params,
    runContext?: RunContext<UserContext>
  ): Promise<string> => {
    const userId = runContext?.context.userId;
    if (!userId) return "Error: Unable to identify user. Please log in again.";

    const goals = await prisma.incomeGoal.findMany({
      where: { userId },
      orderBy: [{ type: "asc" }, { category: "asc" }],
    });

    if (goals.length === 0) {
      return (
        "You have no income goals yet. Set one by saying something like: " +
        "'Add a monthly salary income goal of ₹50000'."
      );
    }

    const now = new Date();
    const lines = goals.map((g) => {
      const isActive = now >= g.periodStart && now <= g.periodEnd;
      const fulfilled = g.fulfilledAmount ?? 0;
      const pct = g.amount > 0 ? ((fulfilled / g.amount) * 100).toFixed(1) : "0.0";
      const remaining = g.amount - fulfilled;
      const status = isActive ? "🟢 Active" : "⚫ Expired";

      return (
        `• [${status}] ${g.category} (${g.type})\n` +
        `  Target: ₹${g.amount} | Earned: ₹${fulfilled} | Remaining: ₹${remaining}\n` +
        `  Progress: ${pct}% | Period: ${g.periodStart.toDateString()} → ${g.periodEnd.toDateString()}`
      );
    });

    return `🎯 Your Income Goals (${goals.length} total):\n\n${lines.join("\n\n")}`;
  },
});

// ─── Tool: income_goal_advice ─────────────────────────────────────────────────
const incomeGoalAdviceTool = tool({
  name: "income_goal_advice",
  description:
    "Analyze the user's income goal progress and give personalized advice on how to achieve their income targets.",
  strict: true,
  parameters: z.object({}),
  execute: async (
    _params,
    runContext?: RunContext<UserContext>
  ): Promise<string> => {
    const userId = runContext?.context.userId;
    if (!userId) return "Error: Unable to identify user. Please log in again.";

    const now = new Date();

    const [activeGoals, recentIncomes] = await Promise.all([
      prisma.incomeGoal.findMany({
        where: { userId, periodStart: { lte: now }, periodEnd: { gte: now } },
      }),
      prisma.income.findMany({
        where: {
          userId,
          date: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
        },
        orderBy: { date: "desc" },
      }),
    ]);

    if (activeGoals.length === 0) {
      return (
        "📋 You have no active income goals.\n\n" +
        "💡 Tip: Setting income goals helps you stay motivated and track earnings per source. " +
        "Try: 'Add a monthly salary income goal of ₹50000'"
      );
    }

    const adviceLines: string[] = [];

    for (const g of activeGoals) {
      const fulfilled = g.fulfilledAmount ?? 0;
      const pct = g.amount > 0 ? (fulfilled / g.amount) * 100 : 0;
      const remaining = g.amount - fulfilled;

      // Days left in the period
      const daysLeft = Math.max(
        0,
        Math.ceil((g.periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      );

      if (pct >= 100) {
        adviceLines.push(
          `🏆 ${g.category}: Goal achieved! You've earned ₹${fulfilled} vs target ₹${g.amount}. Excellent work!`
        );
      } else if (pct >= 70) {
        adviceLines.push(
          `✅ ${g.category}: Great progress at ${pct.toFixed(1)}%! ₹${remaining} more needed with ${daysLeft} days left.`
        );
      } else if (pct >= 40) {
        adviceLines.push(
          `⚠️  ${g.category}: At ${pct.toFixed(1)}% with ${daysLeft} days left. You need ₹${remaining} more — consider increasing efforts in this income source.`
        );
      } else {
        adviceLines.push(
          `🚨 ${g.category}: Only ${pct.toFixed(1)}% achieved (₹${fulfilled}/₹${g.amount}) with ${daysLeft} days left. ₹${remaining} gap — urgent attention needed.`
        );
      }
    }

    const totalTarget = activeGoals.reduce((s, g) => s + g.amount, 0);
    const totalFulfilled = activeGoals.reduce((s, g) => s + (g.fulfilledAmount ?? 0), 0);
    const overallPct =
      totalTarget > 0 ? ((totalFulfilled / totalTarget) * 100).toFixed(1) : "0.0";

    return (
      `🎯 Income Goal Progress Report\n\n` +
      `Overall: ₹${totalFulfilled} earned of ₹${totalTarget} total targets (${overallPct}%)\n\n` +
      adviceLines.join("\n\n")
    );
  },
});

// ─── IncomeGoalAgent ──────────────────────────────────────────────────────────
export const IncomeGoalAgent = new Agent<UserContext, typeof AgentResponseSchema>({
  name: "IncomeGoalAgent",
  instructions: `You are a specialized income goal management assistant within SpendWise.

You help users:
1. Set income goals — target amounts they want to earn per category per period (WEEKLY/MONTHLY/YEARLY)
2. View their income goal progress and fulfillment percentages
3. Get advice on how to achieve their income targets based on current progress

Always use tools to interact with real data. Never make up goal data.
When creating a goal, if the period type is not specified, default to MONTHLY.
Categories: SALARY, FREELANCE, BUSINESS, INVESTMENT, GIFT, OTHER.

Return your final answer ALWAYS as the structured JSON schema with fields: type, title, summary, and optionally details/items/tips.`,
  model: "gpt-4o-mini",
  outputType: AgentResponseSchema,
  tools: [addIncomeGoalTool, getIncomeGoalsTool, incomeGoalAdviceTool],
});
