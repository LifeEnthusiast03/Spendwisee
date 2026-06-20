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

const EXPENSE_CATEGORIES = [
  "FOOD",
  "TRANSPORT",
  "RENT",
  "SHOPPING",
  "ENTERTAINMENT",
  "BILLS",
  "OTHER",
] as const;

// ─── Tool: add_income ─────────────────────────────────────────────────────────
const addIncomeTool = tool({
  name: "add_income",
  description:
    "Add a new income record for the user. Categories: SALARY, FREELANCE, BUSINESS, INVESTMENT, GIFT, OTHER. Amount must be positive.",
  strict: true,
  parameters: z.object({
    amount: z.number().describe("Income amount (must be positive)"),
    category: z
      .enum(INCOME_CATEGORIES)
      .describe("Income category"),
    note: z.string().describe("Optional note about this income (use empty string if none)"),
  }),
  execute: async (
    { amount, category, note },
    runContext?: RunContext<UserContext>
  ): Promise<string> => {
    const userId = runContext?.context.userId;
    if (!userId) return "Error: Unable to identify user. Please log in again.";
    if (amount <= 0) return "Error: Amount must be a positive number.";

    const newIncome = await prisma.income.create({
      data: {
        amount,
        category: category as IncomeCategory,
        note: note || null,
        userId,
      },
    });

    // Update matching active income goals
    const now = new Date();
    const activeGoals = await prisma.incomeGoal.findMany({
      where: {
        userId,
        category: category as IncomeCategory,
        periodStart: { lte: now },
        periodEnd: { gte: now },
      },
    });
    if (activeGoals.length > 0) {
      await Promise.all(
        activeGoals.map((g) =>
          prisma.incomeGoal.update({
            where: { id: g.id },
            data: { fulfilledAmount: { increment: amount } },
          })
        )
      );
    }

    return (
      `✅ Income added successfully!\n` +
      `- Category: ${newIncome.category}\n` +
      `- Amount: ₹${newIncome.amount}\n` +
      `- Date: ${newIncome.date.toDateString()}` +
      (note ? `\n- Note: ${note}` : "")
    );
  },
});

// ─── Tool: add_expense ────────────────────────────────────────────────────────
const addExpenseTool = tool({
  name: "add_expense",
  description:
    "Add a new expense record for the user after checking available balance. Categories: FOOD, TRANSPORT, RENT, SHOPPING, ENTERTAINMENT, BILLS, OTHER.",
  strict: true,
  parameters: z.object({
    amount: z.number().describe("Expense amount (must be positive)"),
    category: z
      .enum(EXPENSE_CATEGORIES)
      .describe("Expense category"),
    note: z.string().describe("Optional note about this expense (use empty string if none)"),
  }),
  execute: async (
    { amount, category, note },
    runContext?: RunContext<UserContext>
  ): Promise<string> => {
    const userId = runContext?.context.userId;
    if (!userId) return "Error: Unable to identify user. Please log in again.";
    if (amount <= 0) return "Error: Amount must be a positive number.";

    // Check available balance
    const [incomeResult, expenseResult, goalResult] = await Promise.all([
      prisma.income.aggregate({ where: { userId }, _sum: { amount: true } }),
      prisma.expense.aggregate({ where: { userId }, _sum: { amount: true } }),
      prisma.goal.aggregate({ where: { userId }, _sum: { totalMoney: true } }),
    ]);

    const totalIncome = incomeResult._sum.amount ?? 0;
    const totalExpense = expenseResult._sum.amount ?? 0;
    const totalGoal = goalResult._sum.totalMoney ?? 0;
    const available = totalIncome - totalExpense - totalGoal;

    if (amount > available) {
      return (
        `❌ Insufficient balance. Available: ₹${available} ` +
        `(Income: ₹${totalIncome} - Expenses: ₹${totalExpense} - Goal commitments: ₹${totalGoal}). ` +
        `Requested: ₹${amount}`
      );
    }

    const newExpense = await prisma.expense.create({
      data: {
        amount,
        category,
        note: note || null,
        userId,
      },
    });

    // Update matching active expense budgets
    const now = new Date();
    const activeBudgets = await prisma.expenseBudget.findMany({
      where: {
        userId,
        category,
        periodStart: { lte: now },
        periodEnd: { gte: now },
      },
    });
    if (activeBudgets.length > 0) {
      await Promise.all(
        activeBudgets.map((b) =>
          prisma.expenseBudget.update({
            where: { id: b.id },
            data: { fulfilledAmount: { increment: amount } },
          })
        )
      );
    }

    return (
      `✅ Expense added successfully!\n` +
      `- Category: ${newExpense.category}\n` +
      `- Amount: ₹${newExpense.amount}\n` +
      `- Date: ${newExpense.date.toDateString()}` +
      (note ? `\n- Note: ${note}` : "") +
      `\n- Remaining balance: ₹${available - amount}`
    );
  },
});

// ─── Tool: get_income_expense_summary ─────────────────────────────────────────
const getSummaryTool = tool({
  name: "get_income_expense_summary",
  description:
    "Get a summary of the user's total income, total expenses, goal commitments, and available balance.",
  strict: true,
  parameters: z.object({}),
  execute: async (
    _params,
    runContext?: RunContext<UserContext>
  ): Promise<string> => {
    const userId = runContext?.context.userId;
    if (!userId) return "Error: Unable to identify user. Please log in again.";

    const [incomeResult, expenseResult, goalResult, recentIncomes, recentExpenses] =
      await Promise.all([
        prisma.income.aggregate({ where: { userId }, _sum: { amount: true } }),
        prisma.expense.aggregate({ where: { userId }, _sum: { amount: true } }),
        prisma.goal.aggregate({ where: { userId }, _sum: { totalMoney: true } }),
        prisma.income.findMany({
          where: { userId },
          orderBy: { date: "desc" },
          take: 5,
        }),
        prisma.expense.findMany({
          where: { userId },
          orderBy: { date: "desc" },
          take: 5,
        }),
      ]);

    const totalIncome = incomeResult._sum.amount ?? 0;
    const totalExpense = expenseResult._sum.amount ?? 0;
    const totalGoal = goalResult._sum.totalMoney ?? 0;
    const available = totalIncome - totalExpense - totalGoal;

    const recentIncomeLines = recentIncomes
      .map((i) => `  • ${i.category}: ₹${i.amount} (${i.date.toDateString()})`)
      .join("\n");
    const recentExpenseLines = recentExpenses
      .map((e) => `  • ${e.category}: ₹${e.amount} (${e.date.toDateString()})`)
      .join("\n");

    return (
      `💰 Financial Summary\n\n` +
      `Total Income:      ₹${totalIncome}\n` +
      `Total Expenses:    ₹${totalExpense}\n` +
      `Goal Commitments:  ₹${totalGoal}\n` +
      `Available Balance: ₹${available}\n\n` +
      `📥 Recent Incomes:\n${recentIncomeLines || "  No income records yet."}\n\n` +
      `📤 Recent Expenses:\n${recentExpenseLines || "  No expense records yet."}`
    );
  },
});

// ─── IncomeExpenseAgent ───────────────────────────────────────────────────────
export const IncomeExpenseAgent = new Agent<UserContext, typeof AgentResponseSchema>({
  name: "IncomeExpenseAgent",
  instructions: `You are a specialized income and expense tracking assistant within SpendWise.

You help users:
1. Record new income (SALARY, FREELANCE, BUSINESS, INVESTMENT, GIFT, OTHER)
2. Record new expenses (FOOD, TRANSPORT, RENT, SHOPPING, ENTERTAINMENT, BILLS, OTHER)
3. View their financial summary — total income, expenses, and available balance

Always use tools to interact with real data. Never make up financial data.
When adding income or expense, if no category is clear from context, ask the user.
If a note is not provided, use an empty string for the note parameter.

Return your final answer ALWAYS as the structured JSON schema with fields: type, title, summary, and optionally details/items/tips.`,
  model: "gpt-4o-mini",
  outputType: AgentResponseSchema,
  tools: [addIncomeTool, addExpenseTool, getSummaryTool],
});
