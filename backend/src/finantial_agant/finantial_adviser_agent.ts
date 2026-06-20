import { Agent, RunContext, tool } from "@openai/agents";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { UserContext } from "./budget_agent.js";
import { AgentResponseSchema } from "../types/agent_response.js";

// ─── Tool: get_full_financial_overview ────────────────────────────────────────
// Fetches ALL financial data for the user in one call — used as the single
// data source for general financial advice.
const getFinancialOverviewTool = tool({
  name: "get_full_financial_overview",
  description:
    "Fetch a complete financial overview for the user: total income, expenses, available balance, active budgets with utilization, savings goals with progress, and income goals with fulfillment. Used to give holistic financial advice.",
  strict: true,
  parameters: z.object({}),
  execute: async (
    _params,
    runContext?: RunContext<UserContext>
  ): Promise<string> => {
    const userId = runContext?.context.userId;
    if (!userId) return "Error: Unable to identify user. Please log in again.";

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      incomeResult,
      expenseResult,
      goalResult,
      activeBudgets,
      activeIncomeGoals,
      savingsGoals,
      monthlyExpenses,
      monthlyIncome,
    ] = await Promise.all([
      prisma.income.aggregate({ where: { userId }, _sum: { amount: true } }),
      prisma.expense.aggregate({ where: { userId }, _sum: { amount: true } }),
      prisma.goal.aggregate({ where: { userId }, _sum: { totalMoney: true } }),
      prisma.expenseBudget.findMany({
        where: { userId, periodStart: { lte: now }, periodEnd: { gte: now } },
      }),
      prisma.incomeGoal.findMany({
        where: { userId, periodStart: { lte: now }, periodEnd: { gte: now } },
      }),
      prisma.goal.findMany({ where: { userId, isActive: true } }),
      prisma.expense.findMany({
        where: { userId, date: { gte: monthStart } },
      }),
      prisma.income.findMany({
        where: { userId, date: { gte: monthStart } },
      }),
    ]);

    const totalIncome = incomeResult._sum.amount ?? 0;
    const totalExpense = expenseResult._sum.amount ?? 0;
    const totalGoalSavings = goalResult._sum.totalMoney ?? 0;
    const available = totalIncome - totalExpense - totalGoalSavings;

    // Monthly snapshot
    const monthlyIncomeTotal = monthlyIncome.reduce((s, i) => s + i.amount, 0);
    const monthlyExpenseTotal = monthlyExpenses.reduce((s, e) => s + e.amount, 0);

    // Budget utilization summary
    const budgetLines = activeBudgets.map((b) => {
      const pct = b.amount > 0 ? ((b.fulfilledAmount ?? 0) / b.amount * 100).toFixed(1) : "0.0";
      return `  ${b.category} (${b.type}): ₹${b.fulfilledAmount ?? 0}/₹${b.amount} (${pct}%)`;
    });

    // Income goal summary
    const incomeGoalLines = activeIncomeGoals.map((g) => {
      const pct = g.amount > 0 ? ((g.fulfilledAmount ?? 0) / g.amount * 100).toFixed(1) : "0.0";
      return `  ${g.category} (${g.type}): ₹${g.fulfilledAmount ?? 0}/₹${g.amount} (${pct}%)`;
    });

    // Savings goal summary
    const savingsGoalLines = savingsGoals.map((g) => {
      const pct = g.amount > 0 ? (g.totalMoney / g.amount * 100).toFixed(1) : "0.0";
      const daysLeft = Math.max(0, Math.ceil((g.enddate.getTime() - now.getTime()) / 86400000));
      return `  "${g.name}": ₹${g.totalMoney}/₹${g.amount} (${pct}%) | ${daysLeft} days left`;
    });

    return (
      `📊 Complete Financial Overview\n\n` +
      `══ Overall Finances ══\n` +
      `Total Income (all time):    ₹${totalIncome}\n` +
      `Total Expenses (all time):  ₹${totalExpense}\n` +
      `Total Goal Savings:         ₹${totalGoalSavings}\n` +
      `Available Balance:          ₹${available}\n\n` +
      `══ This Month ══\n` +
      `Income this month:   ₹${monthlyIncomeTotal}\n` +
      `Expenses this month: ₹${monthlyExpenseTotal}\n` +
      `Net this month:      ₹${monthlyIncomeTotal - monthlyExpenseTotal}\n\n` +
      `══ Active Expense Budgets ══\n` +
      (budgetLines.length > 0 ? budgetLines.join("\n") : "  No active budgets.") + "\n\n" +
      `══ Active Income Goals ══\n` +
      (incomeGoalLines.length > 0 ? incomeGoalLines.join("\n") : "  No active income goals.") + "\n\n" +
      `══ Savings Goals ══\n` +
      (savingsGoalLines.length > 0 ? savingsGoalLines.join("\n") : "  No savings goals.")
    );
  },
});

// ─── FinancialAdviserAgent ────────────────────────────────────────────────────
export const FinancialAdviserAgent = new Agent<UserContext, typeof AgentResponseSchema>({
  name: "FinancialAdviserAgent",
  instructions: `You are the SpendWise personal financial adviser. You give holistic, data-driven financial advice.

Your role:
1. Always call get_full_financial_overview first to load the user's real financial data before giving advice
2. Analyze income vs expenses, savings rate, budget utilization, and goal progress
3. Give specific, actionable advice — not generic tips
4. Identify risks: overspending categories, overdue goals, insufficient savings rate
5. Suggest priorities: which goals to focus on, which budgets to tighten

Advice principles:
- 50/30/20 rule: 50% needs, 30% wants, 20% savings
- Emergency fund: at least 3-6 months of expenses
- High utilization budgets (>80%) need immediate attention
- Income goals below 50% with <30% period remaining need a push
- Always end with 2-3 concrete next steps the user can take today

Be empathetic, specific, and encouraging. Use the actual numbers from the overview.

Return your final answer ALWAYS as the structured JSON schema. Use type='advice', include a clear summary, and put each concrete next step in tips[].`,
  model: "gpt-4o-mini",
  outputType: AgentResponseSchema,
  tools: [getFinancialOverviewTool],
});
