import { prisma } from "../lib/prisma.js";
import { IncomeCategory } from "../types/type.js";
import { validIncomeCatagory } from "../utils/cheakcatgory.js";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors.js";

type BudgetType = "WEEKLY" | "MONTHLY" | "YEARLY";

const validBudgetType = (type: unknown): type is BudgetType =>
  type === "WEEKLY" || type === "MONTHLY" || type === "YEARLY";

class IncomeGoalService {
  private readonly prisma = prisma;

  async addIncomeGoal(
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
      throw new BadRequestError("Type must be WEEKLY, MONTHLY, or YEARLY");
    }

    if (typeof category !== "string" || !validIncomeCatagory(category)) {
      throw new BadRequestError("Invalid income category");
    }

    const now = new Date();
    const periodEnd = new Date(now);

    if (type === "WEEKLY") periodEnd.setDate(periodEnd.getDate() + 7);
    else if (type === "MONTHLY") periodEnd.setMonth(periodEnd.getMonth() + 1);
    else if (type === "YEARLY") periodEnd.setFullYear(periodEnd.getFullYear() + 1);

    const existingGoal = await this.prisma.incomeGoal.findFirst({
      where: {
        userId,
        category: category.toUpperCase() as IncomeCategory,
        type,
        periodStart: { lte: periodEnd },
        periodEnd: { gte: now },
      },
    });

    if (existingGoal) {
      throw new BadRequestError(
        `An active ${type} income goal for ${category.toUpperCase()} category already exists from ${existingGoal.periodStart} to ${existingGoal.periodEnd}`
      );
    }

    const incomeGoal = await this.prisma.incomeGoal.create({
      data: {
        amount,
        type,
        category: category.toUpperCase() as IncomeCategory,
        userId,
        periodStart: now,
        periodEnd,
      },
    });
    console.log("income goal created succsfully");

    return incomeGoal;
  }

  async getIncomeGoals(userId: number) {
    if (!userId) throw new UnauthorizedError();

    const goals = await this.prisma.incomeGoal.findMany({
      where: { userId },
      orderBy: { type: "asc" },
    });
    return goals;
  }

  async getIncomeGoalByCategory(userId: number, category: unknown) {
    if (!userId) throw new UnauthorizedError();

    const categoryQuery =
      typeof category === "string" ? category.toUpperCase() : "";

    if (!validIncomeCatagory(categoryQuery)) {
      throw new BadRequestError("Invalid income category");
    }

    const goals = await this.prisma.incomeGoal.findMany({
      where: { userId, category: categoryQuery as IncomeCategory },
      orderBy: { type: "asc" },
    });

    if (goals.length === 0) {
      throw new NotFoundError(
        `No income goals found for ${categoryQuery} category`
      );
    }
    return goals;
  }

  async updateIncomeGoal(
    userId: number,
    goalId: number,
    amount?: number,
    type?: unknown
  ) {
    if (!userId) throw new UnauthorizedError();

    if (!Number.isInteger(goalId) || goalId <= 0) {
      throw new BadRequestError("Invalid goal id");
    }

    const existingGoal = await this.prisma.incomeGoal.findFirst({
      where: { id: goalId, userId },
    });

    if (!existingGoal) throw new NotFoundError("Income goal not found");

    const now = new Date();
    if (now < existingGoal.periodStart || now > existingGoal.periodEnd) {
      throw new BadRequestError("Cannot update an inactive income goal");
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
        throw new BadRequestError("Type must be WEEKLY, MONTHLY, or YEARLY");
      }
      updateData.type = type;

      const newPeriodEnd = new Date(existingGoal.periodStart);
      if (type === "WEEKLY") newPeriodEnd.setDate(newPeriodEnd.getDate() + 7);
      else if (type === "MONTHLY") newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
      else if (type === "YEARLY") newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1);
      updateData.periodEnd = newPeriodEnd;

      const newPeriodEnd2 = updateData.periodEnd ?? existingGoal.periodEnd;
      const conflictingGoal = await this.prisma.incomeGoal.findFirst({
        where: {
          userId,
          category: existingGoal.category,
          type,
          NOT: { id: goalId },
          periodStart: { lte: newPeriodEnd2 },
          periodEnd: { gte: existingGoal.periodStart },
        },
      });

      if (conflictingGoal) {
        throw new BadRequestError(
          `An active ${type} income goal for ${existingGoal.category} category already exists with overlapping period`
        );
      }
    }

    const updatedGoal = await this.prisma.incomeGoal.update({
      where: { id: goalId },
      data: updateData,
    });
    return updatedGoal;
  }

  async deleteIncomeGoal(userId: number, goalId: number) {
    if (!userId) throw new UnauthorizedError();

    if (!Number.isInteger(goalId) || goalId <= 0) {
      throw new BadRequestError("Invalid goal id");
    }

    const goal = await this.prisma.incomeGoal.findFirst({
      where: { id: goalId, userId },
      select: { id: true },
    });

    if (!goal) throw new NotFoundError("Income goal not found");

    await this.prisma.incomeGoal.delete({ where: { id: goalId } });

    return { message: "Income goal deleted successfully" };
  }
}

export const incomeGoalService = new IncomeGoalService();
