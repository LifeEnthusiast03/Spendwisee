import { prisma } from "../lib/prisma.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors.js";

class GoalService {
  private readonly prisma = prisma;

  async addGoal(
    userId: number,
    name: string,
    amount: number,
    startdate: unknown,
    enddate: unknown
  ) {
    if (!userId) throw new UnauthorizedError();

    if (typeof name !== "string" || name.trim() === "") {
      throw new BadRequestError("Enter a valid goal name");
    }

    if (typeof amount !== "number" || amount <= 0) {
      throw new BadRequestError("Amount must be a positive number");
    }

    if (!startdate || !enddate) {
      throw new BadRequestError("Start date and end date are required");
    }

    const parsedStartDate =
      startdate instanceof Date ? startdate : new Date(startdate as string);
    const parsedEndDate =
      enddate instanceof Date ? enddate : new Date(enddate as string);

    if (
      Number.isNaN(parsedStartDate.getTime()) ||
      Number.isNaN(parsedEndDate.getTime())
    ) {
      throw new BadRequestError("Invalid date format");
    }

    if (parsedStartDate >= parsedEndDate) {
      throw new BadRequestError("End date must be after start date");
    }

    const normalizedName = name.trim().toLowerCase();
    const existingGoal = await this.prisma.goal.findFirst({
      where: { userId, isActive: true, name: normalizedName },
    });

    if (existingGoal) {
      throw new ConflictError("Same name goal already exists");
    }

    const newGoal = await this.prisma.goal.create({
      data: {
        name: normalizedName,
        amount,
        startdate: parsedStartDate,
        enddate: parsedEndDate,
        userId,
      },
    });
    return newGoal;
  }

  async addMoneyToGoal(userId: number, goalId: number, amount: number) {
    if (!userId) throw new UnauthorizedError();

    if (!Number.isInteger(goalId) || goalId <= 0) {
      throw new BadRequestError("Invalid goal id");
    }

    if (typeof amount !== "number" || amount <= 0) {
      throw new BadRequestError("Amount must be a positive number");
    }

    const goal = await this.prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) throw new NotFoundError("Goal not found");

    if (!goal.isActive) {
      throw new BadRequestError("Cannot add money to an inactive goal");
    }

    const totalIncomeResult = await this.prisma.income.aggregate({
      where: { userId },
      _sum: { amount: true },
    });
    const totalExpenseResult = await this.prisma.expense.aggregate({
      where: { userId },
      _sum: { amount: true },
    });

    const totalIncome = totalIncomeResult._sum.amount ?? 0;
    const totalExpense = totalExpenseResult._sum.amount ?? 0;
    const availableBalance = totalIncome - totalExpense;

    if (availableBalance < amount) {
      throw new BadRequestError(
        `Insufficient balance. Available: ${availableBalance}, Requested: ${amount}`
      );
    }

    if (goal.totalMoney + amount > goal.amount) {
      throw new BadRequestError(
        `Adding ${amount} would exceed the goal target. Current: ${goal.totalMoney}, Target: ${goal.amount}`
      );
    }

    const updatedGoal = await this.prisma.goal.update({
      where: { id: goalId },
      data: { totalMoney: { increment: amount } },
    });
    return updatedGoal;
  }

  async removeMoneyFromGoal(userId: number, goalId: number, amount: number) {
    if (!userId) throw new UnauthorizedError();

    if (!Number.isInteger(goalId) || goalId <= 0) {
      throw new BadRequestError("Invalid goal id");
    }

    if (typeof amount !== "number" || amount <= 0) {
      throw new BadRequestError("Amount must be a positive number");
    }

    const goal = await this.prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) throw new NotFoundError("Goal not found");

    if (amount > goal.totalMoney) {
      throw new BadRequestError(
        `Cannot remove more than what is saved. Saved: ${goal.totalMoney}, Requested: ${amount}`
      );
    }

    const updatedGoal = await this.prisma.goal.update({
      where: { id: goalId },
      data: { totalMoney: { decrement: amount } },
    });
    return updatedGoal;
  }

  async removeMoneyFromGoals(
    userId: number,
    goals: { goalid: number; amount: number }[]
  ) {
    if (!userId) throw new UnauthorizedError();

    if (!Array.isArray(goals) || goals.length === 0) {
      throw new BadRequestError("Goals must be a non-empty array");
    }

    for (const entry of goals) {
      if (
        !entry.goalid ||
        typeof entry.goalid !== "number" ||
        entry.goalid <= 0
      ) {
        throw new BadRequestError(`Invalid goal id: ${entry.goalid}`);
      }
      if (typeof entry.amount !== "number" || entry.amount <= 0) {
        throw new BadRequestError(
          `Amount must be a positive number for goal id: ${entry.goalid}`
        );
      }
    }

    const goalIds = goals.map((g) => g.goalid);
    const existingGoals = await this.prisma.goal.findMany({
      where: { id: { in: goalIds }, userId },
    });

    if (existingGoals.length !== goalIds.length) {
      const foundIds = existingGoals.map((g) => g.id);
      const missingIds = goalIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundError(`Goals not found: ${missingIds.join(", ")}`);
    }

    for (const entry of goals) {
      const goal = existingGoals.find((g) => g.id === entry.goalid);
      if (goal && entry.amount > goal.totalMoney) {
        throw new BadRequestError(
          `Cannot remove more than saved for goal "${goal.name}". Saved: ${goal.totalMoney}, Requested: ${entry.amount}`
        );
      }
    }

    const updatedGoals = await this.prisma.$transaction(
      goals.map((entry) =>
        this.prisma.goal.update({
          where: { id: entry.goalid },
          data: { totalMoney: { decrement: entry.amount } },
        })
      )
    );
    return updatedGoals;
  }

  async updateGoal(
    userId: number,
    goalId: number,
    amount?: number,
    enddate?: unknown
  ) {
    if (!userId) throw new UnauthorizedError();

    if (!Number.isInteger(goalId) || goalId <= 0) {
      throw new BadRequestError("Invalid goal id");
    }

    const existingGoal = await this.prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!existingGoal) throw new NotFoundError("Goal not found");

    if (!existingGoal.isActive) {
      throw new BadRequestError("Cannot update an inactive goal");
    }

    const updateData: { amount?: number; enddate?: Date } = {};

    if (amount !== undefined) {
      if (typeof amount !== "number" || amount <= 0) {
        throw new BadRequestError("Amount must be a positive number");
      }
      if (amount < existingGoal.totalMoney) {
        throw new BadRequestError(
          `New target amount cannot be less than money already saved (${existingGoal.totalMoney})`
        );
      }
      updateData.amount = amount;
    }

    if (enddate !== undefined) {
      const parsedEndDate =
        enddate instanceof Date ? enddate : new Date(enddate as string);
      if (Number.isNaN(parsedEndDate.getTime())) {
        throw new BadRequestError("Invalid date format");
      }
      if (parsedEndDate <= existingGoal.startdate) {
        throw new BadRequestError("End date must be after start date");
      }
      updateData.enddate = parsedEndDate;
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestError("Nothing to update. Provide amount or enddate.");
    }

    const updatedGoal = await this.prisma.goal.update({
      where: { id: goalId },
      data: updateData,
    });
    return updatedGoal;
  }

  async deleteGoal(userId: number, goalId: number) {
    if (!userId) throw new UnauthorizedError();

    if (!Number.isInteger(goalId) || goalId <= 0) {
      throw new BadRequestError("Invalid goal id");
    }

    const goal = await this.prisma.goal.findFirst({
      where: { id: goalId, userId },
      select: { id: true },
    });

    if (!goal) throw new NotFoundError("Goal not found");

    await this.prisma.goal.delete({ where: { id: goalId } });

    return { message: "Goal deleted successfully" };
  }

  async totalMoneyInGoal(userId: number, goalId: number) {
    if (!userId) throw new UnauthorizedError();

    if (!Number.isInteger(goalId) || goalId <= 0) {
      throw new BadRequestError("Invalid goal id");
    }

    const goal = await this.prisma.goal.findFirst({
      where: { id: goalId, userId },
      select: { id: true, name: true, amount: true, totalMoney: true, isActive: true },
    });

    if (!goal) throw new NotFoundError("Goal not found");

    return {
      id: goal.id,
      name: goal.name,
      targetAmount: goal.amount,
      totalMoney: goal.totalMoney,
      remaining: goal.amount - goal.totalMoney,
      isActive: goal.isActive,
    };
  }

  async getGoals(userId: number) {
    if (!userId) throw new UnauthorizedError();

    const goals = await this.prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return goals;
  }
}

export const goalService = new GoalService();
