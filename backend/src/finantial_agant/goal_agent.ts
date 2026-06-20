import { Agent, RunContext, tool } from "@openai/agents";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { UserContext } from "./budget_agent.js";
import { AgentResponseSchema } from "../types/agent_response.js";

// ─── Tool: add_goal ───────────────────────────────────────────────────────────
const addGoalTool = tool({
  name: "add_goal",
  description:
    "Create a new savings goal with a name, target amount, start date, and end date. The user saves money toward this goal over time.",
  strict: true,
  parameters: z.object({
    name: z.string().describe("Goal name (e.g. 'Emergency Fund', 'New Laptop', 'Vacation')"),
    amount: z.number().describe("Target amount to save (must be positive)"),
    startdate: z
      .string()
      .describe("Start date in ISO format (e.g. '2025-01-01'). Use today's date if not specified."),
    enddate: z
      .string()
      .describe("End date in ISO format (e.g. '2025-12-31'). Must be after start date."),
  }),
  execute: async (
    { name, amount, startdate, enddate },
    runContext?: RunContext<UserContext>
  ): Promise<string> => {
    const userId = runContext?.context.userId;
    if (!userId) return "Error: Unable to identify user. Please log in again.";
    if (amount <= 0) return "Error: Amount must be a positive number.";

    const parsedStart = new Date(startdate);
    const parsedEnd = new Date(enddate);

    if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
      return "Error: Invalid date format. Please use ISO format like '2025-01-01'.";
    }
    if (parsedStart >= parsedEnd) {
      return "Error: End date must be after start date.";
    }

    const normalizedName = name.trim().toLowerCase();

    const existing = await prisma.goal.findFirst({
      where: { userId, isActive: true, name: normalizedName },
    });
    if (existing) {
      return `A goal named "${name}" already exists and is still active. Please choose a different name or update the existing goal.`;
    }

    const newGoal = await prisma.goal.create({
      data: {
        name: normalizedName,
        amount,
        startdate: parsedStart,
        enddate: parsedEnd,
        userId,
      },
    });

    const daysToTarget = Math.ceil(
      (parsedEnd.getTime() - parsedStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    const dailySavings = (amount / daysToTarget).toFixed(2);

    return (
      `✅ Goal created!\n` +
      `- Name: ${newGoal.name}\n` +
      `- Target: ₹${newGoal.amount}\n` +
      `- Period: ${parsedStart.toDateString()} → ${parsedEnd.toDateString()}\n` +
      `- To reach your goal: save roughly ₹${dailySavings}/day`
    );
  },
});

// ─── Tool: get_goals ──────────────────────────────────────────────────────────
const getGoalsTool = tool({
  name: "get_goals",
  description:
    "Retrieve all savings goals for the user, including current savings, target amount, and completion percentage.",
  strict: true,
  parameters: z.object({}),
  execute: async (
    _params,
    runContext?: RunContext<UserContext>
  ): Promise<string> => {
    const userId = runContext?.context.userId;
    if (!userId) return "Error: Unable to identify user. Please log in again.";

    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (goals.length === 0) {
      return (
        "You have no savings goals yet. Create one by saying something like: " +
        "'Create a goal to save ₹50000 for a vacation by December 2025'."
      );
    }

    const now = new Date();
    const lines = goals.map((g) => {
      const pct = g.amount > 0 ? ((g.totalMoney / g.amount) * 100).toFixed(1) : "0.0";
      const remaining = g.amount - g.totalMoney;
      const isActive = g.isActive;
      const isOverdue = now > g.enddate && g.isActive;
      const status = !isActive ? "⚫ Inactive" : isOverdue ? "🔴 Overdue" : "🟢 Active";
      const daysLeft = isActive
        ? Math.max(0, Math.ceil((g.enddate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        : 0;

      return (
        `• [${status}] ${g.name}\n` +
        `  Saved: ₹${g.totalMoney} / Target: ₹${g.amount} (${pct}%)\n` +
        `  Remaining to save: ₹${remaining}` +
        (isActive ? ` | ${daysLeft} days left` : "") +
        `\n  Period: ${g.startdate.toDateString()} → ${g.enddate.toDateString()}`
      );
    });

    return `🏦 Your Savings Goals (${goals.length} total):\n\n${lines.join("\n\n")}`;
  },
});

// ─── Tool: goal_advice ────────────────────────────────────────────────────────
const goalAdviceTool = tool({
  name: "goal_advice",
  description:
    "Analyze the user's savings goals progress and give personalized advice to help them reach their targets on time.",
  strict: true,
  parameters: z.object({}),
  execute: async (
    _params,
    runContext?: RunContext<UserContext>
  ): Promise<string> => {
    const userId = runContext?.context.userId;
    if (!userId) return "Error: Unable to identify user. Please log in again.";

    const now = new Date();

    const [goals, incomeResult, expenseResult] = await Promise.all([
      prisma.goal.findMany({ where: { userId, isActive: true } }),
      prisma.income.aggregate({ where: { userId }, _sum: { amount: true } }),
      prisma.expense.aggregate({ where: { userId }, _sum: { amount: true } }),
    ]);

    if (goals.length === 0) {
      return (
        "📋 You have no active savings goals.\n\n" +
        "💡 Tip: Setting clear savings goals (like an emergency fund or a vacation) helps you stay focused. " +
        "Try: 'Create a goal to save ₹100000 for an emergency fund by December 2026'"
      );
    }

    const totalIncome = incomeResult._sum.amount ?? 0;
    const totalExpense = expenseResult._sum.amount ?? 0;
    const availableBalance = totalIncome - totalExpense;

    const adviceLines: string[] = [];

    for (const g of goals) {
      const pct = g.amount > 0 ? (g.totalMoney / g.amount) * 100 : 0;
      const remaining = g.amount - g.totalMoney;
      const daysLeft = Math.max(
        0,
        Math.ceil((g.enddate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      );
      const dailyNeeded = daysLeft > 0 ? (remaining / daysLeft).toFixed(2) : "N/A";
      const isOverdue = now > g.enddate;

      if (isOverdue) {
        adviceLines.push(
          `🔴 "${g.name}": Goal is overdue! Only ${pct.toFixed(1)}% achieved (₹${g.totalMoney}/₹${g.amount}). Consider extending the deadline or increasing contributions.`
        );
      } else if (pct >= 100) {
        adviceLines.push(
          `🏆 "${g.name}": Goal achieved! ₹${g.totalMoney} saved out of ₹${g.amount} target. Congratulations!`
        );
      } else if (pct >= 70) {
        adviceLines.push(
          `✅ "${g.name}": Great progress at ${pct.toFixed(1)}%! Save ₹${dailyNeeded}/day to finish by ${g.enddate.toDateString()}.`
        );
      } else if (pct >= 30) {
        adviceLines.push(
          `⚠️  "${g.name}": At ${pct.toFixed(1)}% with ${daysLeft} days left. You need ₹${dailyNeeded}/day — stay consistent!`
        );
      } else {
        adviceLines.push(
          `🚨 "${g.name}": Only ${pct.toFixed(1)}% saved (₹${g.totalMoney}/₹${g.amount}). ` +
          `Need ₹${dailyNeeded}/day for ${daysLeft} days. Consider reducing non-essential expenses.`
        );
      }
    }

    const totalGoalAmount = goals.reduce((s, g) => s + g.amount, 0);
    const totalSaved = goals.reduce((s, g) => s + g.totalMoney, 0);

    let report =
      `🏦 Savings Goal Report\n\n` +
      `Available Balance: ₹${availableBalance}\n` +
      `Total saved across goals: ₹${totalSaved} of ₹${totalGoalAmount}\n\n` +
      adviceLines.join("\n\n");

    if (availableBalance < 0) {
      report += `\n\n⚠️  Your expenses exceed your income. Focus on reducing spending before contributing more to goals.`;
    }

    return report;
  },
});

// ─── GoalAgent ────────────────────────────────────────────────────────────────
export const GoalAgent = new Agent<UserContext, typeof AgentResponseSchema>({
  name: "GoalAgent",
  instructions: `You are a specialized savings goal assistant within SpendWise.

You help users:
1. Create savings goals with a name, target amount, and deadline (start/end date)
2. View all their goals with current progress and days remaining
3. Get personalized advice to help them reach their goals on time

Always use tools to fetch real data. Never make up goal progress.
When creating a goal and no dates are provided, use today as start date and ask for an end date.
If the user says "by [month/year]", convert that to an end date.

Return your final answer ALWAYS as the structured JSON schema with fields: type, title, summary, and optionally details/items/tips.`,
  model: "gpt-4o-mini",
  outputType: AgentResponseSchema,
  tools: [addGoalTool, getGoalsTool, goalAdviceTool],
});
