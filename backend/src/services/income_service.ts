import { prisma } from "../lib/prisma.js";
import { IncomeCategory } from "../types/type.js";
import { validIncomeCatagory } from "../utils/cheakcatgory.js";
import { catagorywisedata } from "../utils/catagorywisedata.js";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  isPrismaKnownError,
} from "../utils/errors.js";

class IncomeService {
  private readonly prisma = prisma;

  async getIncome(userId: number) {
    if (!userId) throw new UnauthorizedError();

    const incomes = await this.prisma.income.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });
    return incomes;
  }

  async addIncome(
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

    if (!validIncomeCatagory(category)) {
      throw new BadRequestError("Invalid income category");
    }

    let parsedDate: Date | undefined;
    if (date !== undefined && date !== null && date !== "") {
      parsedDate = date instanceof Date ? date : new Date(date as string);
      if (Number.isNaN(parsedDate.getTime())) {
        throw new BadRequestError("Invalid date format");
      }
    }

    const newincome = await this.prisma.income.create({
      data: {
        amount,
        category: category.toUpperCase() as IncomeCategory,
        note,
        userId,
        ...(parsedDate ? { date: parsedDate } : {}),
      },
    });
    console.log("new income added now cheak if goal exist");

    // Check for active income goals matching this category and update fulfilledAmount
    const incomeDate = parsedDate ?? new Date();
    const activeGoals = await this.prisma.incomeGoal.findMany({
      where: {
        userId,
        category: category.toUpperCase() as IncomeCategory,
        periodStart: { lte: incomeDate },
        periodEnd: { gte: incomeDate },
      },
    });

    if (activeGoals.length > 0) {
      await Promise.all(
        activeGoals.map((goal) =>
          this.prisma.incomeGoal.update({
            where: { id: goal.id },
            data: { fulfilledAmount: { increment: amount } },
          })
        )
      );
    }

    return newincome;
  }

  async getTotalIncome(userId: number) {
    if (!userId) throw new UnauthorizedError();

    const incomes = await this.prisma.income.findMany({ where: { userId } });
    return catagorywisedata(incomes);
  }

  async getCategoryIncome(userId: number, categoryQuery: unknown) {
    if (!userId) throw new UnauthorizedError();

    if (typeof categoryQuery !== "string") {
      throw new BadRequestError("Category query is required");
    }

    const normalizedCategory = categoryQuery.trim().toUpperCase();
    if (!validIncomeCatagory(normalizedCategory)) {
      throw new BadRequestError("Invalid income category");
    }
    const incomeCategory = normalizedCategory as IncomeCategory;

    const incomes = await this.prisma.income.findMany({
      where: { userId, category: incomeCategory },
    });
    return catagorywisedata(incomes);
  }

  async deleteIncome(userId: number, incomeId: number) {
    if (!userId) throw new UnauthorizedError();

    if (!Number.isInteger(incomeId) || incomeId <= 0) {
      throw new BadRequestError("Invalid income id");
    }

    const income = await this.prisma.income.findFirst({
      where: { id: incomeId, userId },
    });

    if (!income) {
      throw new NotFoundError("Income not found");
    }

    // Calculate total income, total expenses, and total active goal amounts
    const [totalIncomeResult, totalExpenseResult, totalGoalResult] =
      await Promise.all([
        this.prisma.income.aggregate({ where: { userId }, _sum: { amount: true } }),
        this.prisma.expense.aggregate({ where: { userId }, _sum: { amount: true } }),
        this.prisma.goal.aggregate({ where: { userId }, _sum: { totalMoney: true } }),
      ]);

    const totalIncome = totalIncomeResult._sum.amount ?? 0;
    const totalExpense = totalExpenseResult._sum.amount ?? 0;
    const totalGoalFulfilled = totalGoalResult._sum.totalMoney ?? 0;

    const remainingIncome = totalIncome - income.amount;

    if (remainingIncome < totalExpense + totalGoalFulfilled) {
      throw new BadRequestError(
        `Cannot delete this income. Your remaining income (${remainingIncome}) would be less than your total expenses (${totalExpense}) + goal commitments (${totalGoalFulfilled}) = ${totalExpense + totalGoalFulfilled}`
      );
    }

    try {
      await this.prisma.income.delete({ where: { id: incomeId } });
    } catch (err) {
      if (isPrismaKnownError(err) && err.code === "P2025") {
        throw new NotFoundError("Income not found");
      }
      throw err;
    }

    return { message: "Income deleted successfully" };
  }
}

export const incomeService = new IncomeService();
