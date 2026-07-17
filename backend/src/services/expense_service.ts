import { prisma } from "../lib/prisma.js";
import { ExpenseCategory } from "../types/type.js";
import { validExpenseCatagory } from "../utils/cheakcatgory.js";
import { catagorywisedata } from "../utils/catagorywisedata.js";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  isPrismaKnownError,
} from "../utils/errors.js";

class ExpenseService {
  private readonly prisma = prisma;

  async getExpense(userId: number) {
    if (!userId) throw new UnauthorizedError();

    const expenses = await this.prisma.expense.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });
    return expenses;
  }

  async addExpense(
    userId: number,
    amount: number,
    category: string,
    note: string | undefined,
    date: unknown
  ) {
    if (!userId) throw new UnauthorizedError();

    if (typeof amount !== "number" || amount < 0) {
      throw new BadRequestError("Amount must be a non-negative number");
    }

    if (!validExpenseCatagory(category)) {
      throw new BadRequestError("Invalid expense category");
    }

    let parsedDate: Date | undefined;
    if (date !== undefined && date !== null && date !== "") {
      parsedDate = date instanceof Date ? date : new Date(date as string);
      if (Number.isNaN(parsedDate.getTime())) {
        throw new BadRequestError("Invalid date format");
      }
    }

    // Check if user has enough income to cover this expense (accounting for goal commitments)
    const [totalIncomeResult, totalExpenseResult, totalGoalFulfilledResult] =
      await Promise.all([
        this.prisma.income.aggregate({ where: { userId }, _sum: { amount: true } }),
        this.prisma.expense.aggregate({ where: { userId }, _sum: { amount: true } }),
        this.prisma.goal.aggregate({ where: { userId }, _sum: { totalMoney: true } }),
      ]);

    const totalIncome = totalIncomeResult._sum.amount ?? 0;
    const totalExpense = totalExpenseResult._sum.amount ?? 0;
    const totalGoalFulfilled = totalGoalFulfilledResult._sum.totalMoney ?? 0;
    const availableBalance = totalIncome - totalExpense - totalGoalFulfilled;

    if (amount > availableBalance) {
      throw new BadRequestError(
        `Insufficient income. Your available balance is ${availableBalance} (total income: ${totalIncome} - total expenses: ${totalExpense} - goal commitments: ${totalGoalFulfilled}), but the expense amount is ${amount}`
      );
    }

    const newexpense = await this.prisma.expense.create({
      data: {
        amount,
        category: category.toUpperCase() as ExpenseCategory,
        note,
        userId,
        ...(parsedDate ? { date: parsedDate } : {}),
      },
    });

    // Check for active expense budgets matching this category and update fulfilledAmount
    const expenseDate = parsedDate ?? new Date();
    const activeBudgets = await this.prisma.expenseBudget.findMany({
      where: {
        userId,
        category: category.toUpperCase() as ExpenseCategory,
        periodStart: { lte: expenseDate },
        periodEnd: { gte: expenseDate },
      },
    });

    if (activeBudgets.length > 0) {
      await Promise.all(
        activeBudgets.map((budget) =>
          this.prisma.expenseBudget.update({
            where: { id: budget.id },
            data: { fulfilledAmount: { increment: amount } },
          })
        )
      );
    }

    return newexpense;
  }

  async getTotalExpense(userId: number) {
    if (!userId) throw new UnauthorizedError();

    const expenses = await this.prisma.expense.findMany({ where: { userId } });
    return catagorywisedata(expenses);
  }

  async getCategoryExpense(userId: number, categoryQuery: unknown) {
    if (!userId) throw new UnauthorizedError();

    if (typeof categoryQuery !== "string") {
      throw new BadRequestError("Category query is required");
    }

    const normalizedCategory = categoryQuery.trim().toUpperCase();
    if (!validExpenseCatagory(normalizedCategory)) {
      throw new BadRequestError("Invalid expense category");
    }
    const expenseCategory = normalizedCategory as ExpenseCategory;

    const expenses = await this.prisma.expense.findMany({
      where: { userId, category: expenseCategory },
    });
    return catagorywisedata(expenses);
  }

  async deleteExpense(userId: number, expenseId: number) {
    if (!userId) throw new UnauthorizedError();

    if (!Number.isInteger(expenseId) || expenseId <= 0) {
      throw new BadRequestError("Invalid expense id");
    }

    const expense = await this.prisma.expense.findFirst({
      where: { id: expenseId, userId },
      select: { id: true },
    });

    if (!expense) throw new NotFoundError("Expense not found");

    try {
      await this.prisma.expense.delete({ where: { id: expenseId } });
    } catch (err) {
      if (isPrismaKnownError(err) && err.code === "P2025") {
        throw new NotFoundError("Expense not found");
      }
      throw err;
    }

    return { message: "Expense deleted successfully" };
  }
}

export const expenseService = new ExpenseService();
