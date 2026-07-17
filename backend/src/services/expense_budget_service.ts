import { prisma } from "../lib/prisma.js";
import { ExpenseCategory } from "../types/type.js";
import { validExpenseCatagory } from "../utils/cheakcatgory.js";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  isPrismaKnownError,
} from "../utils/errors.js";

type BudgetType = "WEEKLY" | "MONTHLY" | "YEARLY";

const validBudgetType = (type: unknown): type is BudgetType =>
  type === "WEEKLY" || type === "MONTHLY" || type === "YEARLY";

class ExpenseBudgetService {
  private readonly prisma = prisma;

  async addExpenseBudget(
    userId: number,
    amount: number,
    type: unknown,
    category: unknown
  ) {
    if (!userId) throw new UnauthorizedError();

    if (typeof amount !== "number" || amount <= 0) {
      throw new BadRequestError("Amount must be a positive number");
    }

    if (!validBudgetType(type)) {
      throw new BadRequestError(
        "Invalid budget type. Must be WEEKLY, MONTHLY, or YEARLY"
      );
    }

    if (typeof category !== "string" || !validExpenseCatagory(category)) {
      throw new BadRequestError("Invalid expense category");
    }

    const now = new Date();
    const periodEnd = new Date(now);

    if (type === "WEEKLY") periodEnd.setDate(periodEnd.getDate() + 7);
    else if (type === "MONTHLY") periodEnd.setMonth(periodEnd.getMonth() + 1);
    else if (type === "YEARLY") periodEnd.setFullYear(periodEnd.getFullYear() + 1);

    const existingBudget = await this.prisma.expenseBudget.findFirst({
      where: {
        userId,
        category: category.toUpperCase() as ExpenseCategory,
        type,
        periodStart: { lte: periodEnd },
        periodEnd: { gte: now },
      },
    });

    if (existingBudget) {
      throw new BadRequestError(
        `An active ${type} expense budget for ${category.toUpperCase()} category already exists from ${existingBudget.periodStart} to ${existingBudget.periodEnd}`
      );
    }

    const newBudget = await this.prisma.expenseBudget.create({
      data: {
        amount,
        category: category.toUpperCase() as ExpenseCategory,
        type,
        userId,
        periodStart: now,
        periodEnd,
      },
    });
    return newBudget;
  }

  async getExpenseBudgets(userId: number) {
    if (!userId) throw new UnauthorizedError();

    const budgets = await this.prisma.expenseBudget.findMany({
      where: { userId },
      orderBy: { type: "asc" },
    });
    return budgets;
  }

  async getExpenseBudgetByCategory(userId: number, category: unknown) {
    if (!userId) throw new UnauthorizedError();

    const categoryQuery =
      typeof category === "string" ? category.toUpperCase() : "";

    if (!validExpenseCatagory(categoryQuery)) {
      throw new BadRequestError("Invalid expense category");
    }

    const budgets = await this.prisma.expenseBudget.findMany({
      where: { userId, category: categoryQuery as ExpenseCategory },
      orderBy: { type: "asc" },
    });

    if (budgets.length === 0) {
      throw new NotFoundError(
        `No expense budgets found for ${categoryQuery} category`
      );
    }
    return budgets;
  }

  async updateExpenseBudget(
    userId: number,
    budgetId: number,
    amount?: number,
    type?: unknown
  ) {
    if (!userId) throw new UnauthorizedError();

    if (!Number.isInteger(budgetId) || budgetId <= 0) {
      throw new BadRequestError("Invalid budget id");
    }

    const existingBudget = await this.prisma.expenseBudget.findFirst({
      where: { id: budgetId, userId },
    });

    if (!existingBudget) throw new NotFoundError("Expense budget not found");

    const now = new Date();
    if (now < existingBudget.periodStart || now > existingBudget.periodEnd) {
      throw new BadRequestError("Cannot update an inactive budget");
    }

    const updateData: { amount?: number; type?: BudgetType; periodEnd?: Date } =
      {};

    if (amount !== undefined) {
      if (typeof amount !== "number" || amount <= 0) {
        throw new BadRequestError("Amount must be a positive number");
      }
      updateData.amount = amount;
    }

    if (type !== undefined) {
      if (!validBudgetType(type)) {
        throw new BadRequestError(
          "Invalid budget type. Must be WEEKLY, MONTHLY, or YEARLY"
        );
      }
      updateData.type = type;

      const newPeriodEnd = new Date(existingBudget.periodStart);
      if (type === "WEEKLY") newPeriodEnd.setDate(newPeriodEnd.getDate() + 7);
      else if (type === "MONTHLY") newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
      else if (type === "YEARLY") newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1);
      updateData.periodEnd = newPeriodEnd;

      const conflictingBudget = await this.prisma.expenseBudget.findFirst({
        where: {
          userId,
          category: existingBudget.category,
          type,
          NOT: { id: budgetId },
          periodStart: { lte: updateData.periodEnd },
          periodEnd: { gte: existingBudget.periodStart },
        },
      });

      if (conflictingBudget) {
        throw new BadRequestError(
          `An active ${type} expense budget for ${existingBudget.category} category already exists with overlapping period`
        );
      }
    }

    try {
      const updatedBudget = await this.prisma.expenseBudget.update({
        where: { id: budgetId },
        data: updateData,
      });
      return updatedBudget;
    } catch (err) {
      if (isPrismaKnownError(err) && err.code === "P2025") {
        throw new NotFoundError("Expense budget not found");
      }
      throw err;
    }
  }

  async deleteExpenseBudget(userId: number, budgetId: number) {
    if (!userId) throw new UnauthorizedError();

    if (!Number.isInteger(budgetId) || budgetId <= 0) {
      throw new BadRequestError("Invalid budget id");
    }

    const budget = await this.prisma.expenseBudget.findFirst({
      where: { id: budgetId, userId },
      select: { id: true },
    });

    if (!budget) throw new NotFoundError("Expense budget not found");

    try {
      await this.prisma.expenseBudget.delete({ where: { id: budgetId } });
    } catch (err) {
      if (isPrismaKnownError(err) && err.code === "P2025") {
        throw new NotFoundError("Expense budget not found");
      }
      throw err;
    }

    return { message: "Expense budget deleted successfully" };
  }
}

export const expenseBudgetService = new ExpenseBudgetService();
