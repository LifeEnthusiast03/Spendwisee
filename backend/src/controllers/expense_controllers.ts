import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { ExpenseCategory } from "../types/type.js";
import { validExpenseCatagory } from "../utils/cheakcatgory.js";
import { catagorywisedata } from "../utils/catagorywisedata.js";

type PrismaKnownError = {
  code?: string;
};

const isPrismaKnownError = (err: unknown): err is PrismaKnownError => {
  return typeof err === "object" && err !== null && "code" in err;
};

const validBudgetType = (type: unknown): type is "WEEKLY" | "MONTHLY" | "YEARLY" => {
  return type === "WEEKLY" || type === "MONTHLY" || type === "YEARLY";
};

export const getExpense = async (req: Request, res: Response) => {
  try {
    const userid = req.user?.id;
    if (!userid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const expenses = await prisma.expense.findMany({
      where: { userId: userid },
      orderBy: { date: "desc" },
    });

    return res.status(200).json(expenses);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch expense" });
  }
};

export const addExpense = async (req: Request, res: Response) => {
  try {
    const { amount, catagory, note, date, adddate } = req.body;
    const userid = req.user?.id;

    if (typeof amount !== "number" || amount < 0) {
      return res.status(400).json({ message: "Amount must be a non-negative number" });
    }

    if (!userid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!validExpenseCatagory(catagory)) {
      return res.status(400).json({ message: "Invalid expense category" });
    }

    const requestedDate = date ?? adddate;
    let parsedDate: Date | undefined;
    if (requestedDate !== undefined && requestedDate !== null && requestedDate !== "") {
      parsedDate = requestedDate instanceof Date ? requestedDate : new Date(requestedDate);
      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
    }

    // Check if user has enough income to cover this expense (accounting for goal commitments)
    const [totalIncomeResult, totalExpenseResult, totalGoalFulfilledResult] = await Promise.all([
      prisma.income.aggregate({
        where: { userId: userid },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { userId: userid },
        _sum: { amount: true },
      }),
      prisma.goal.aggregate({
        where: { userId: userid },
        _sum: { totalMoney: true },
      }),
    ]);

    const totalIncome = totalIncomeResult._sum.amount ?? 0;
    const totalExpense = totalExpenseResult._sum.amount ?? 0;
    const totalGoalFulfilled = totalGoalFulfilledResult._sum.totalMoney ?? 0;
    const availableBalance = totalIncome - totalExpense - totalGoalFulfilled;

    if (amount > availableBalance) {
      return res.status(400).json({
        message: `Insufficient income. Your available balance is ${availableBalance} (total income: ${totalIncome} - total expenses: ${totalExpense} - goal commitments: ${totalGoalFulfilled}), but the expense amount is ${amount}`,
      });
    }

    const newexpense = await prisma.expense.create({
      data: {
        amount,
        category: catagory.toUpperCase(),
        note,
        userId: userid,
        ...(parsedDate ? { date: parsedDate } : {}),
      },
    });

    // Check for active expense budgets matching this category and update fulfilledAmount
    const expenseDate = parsedDate ?? new Date();
    const activeBudgets = await prisma.expenseBudget.findMany({
      where: {
        userId: userid,
        category: catagory.toUpperCase() as ExpenseCategory,
        isActive: true,
        periodStart: { lte: expenseDate },
        periodEnd: { gte: expenseDate },
      },
    });

    if (activeBudgets.length > 0) {
      await Promise.all(
        activeBudgets.map((budget) =>
          prisma.expenseBudget.update({
            where: { id: budget.id },
            data: { fulfilledAmount: { increment: amount } },
          })
        )
      );
    }

    return res.status(201).json(newexpense);
  } catch (err) {
    return res.status(500).json({ message: "Failed to add expense" });
  }
};

export const getTotalExpense = async (req: Request, res: Response) => {
  try {
    const userid = req.user?.id;
    if (!userid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const expenses = await prisma.expense.findMany({
      where: { userId: userid },
    });
    const data = catagorywisedata(expenses);

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch expense" });
  }
};

export const getcatagoryExpense = async (req: Request, res: Response) => {
  try {
    const userid = req.user?.id;
    if (!userid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const categoryQuery = req.query.catagory;
    if (typeof categoryQuery !== "string") {
      return res.status(400).json({ message: "Category query is required" });
    }

    const normalizedCategory = categoryQuery.trim().toUpperCase();
    if (!validExpenseCatagory(normalizedCategory)) {
      return res.status(400).json({ message: "Invalid expense category" });
    }
    const expenseCategory = normalizedCategory as ExpenseCategory;

    const expenses = await prisma.expense.findMany({
      where: {
        userId: userid,
        category: expenseCategory,
      },
    });
    const data = catagorywisedata(expenses);

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch expense" });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const userid = req.user?.id;
    if (!userid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const expenseid = Number(req.params.expenseid);
    if (!Number.isInteger(expenseid) || expenseid <= 0) {
      return res.status(400).json({ message: "Invalid expense id" });
    }

    const expense = await prisma.expense.findFirst({
      where: {
        id: expenseid,
        userId: userid,
      },
      select: { id: true },
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    await prisma.expense.delete({
      where: {
        id: expenseid,
      },
    });

    return res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err) {
    if (isPrismaKnownError(err) && err.code === "P2025") {
      return res.status(404).json({ message: "Expense not found" });
    }

    return res.status(500).json({ message: "Failed to delete expense" });
  }
};

// ============= Expense Budget Controllers =============

export const addExpenseBudget = async (req: Request, res: Response) => {
  try {
    const { catagory, amount, type } = req.body;
    const userid = req.user?.id;

    if (!userid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number" });
    }

    if (!validBudgetType(type)) {
      return res.status(400).json({ message: "Invalid budget type. Must be WEEKLY, MONTHLY, or YEARLY" });
    }
    if (!validExpenseCatagory(catagory)) {
      return res.status(400).json({ message: "Invalid expense category" });
    }

    // Calculate period dates based on budget type
    const now = new Date();
    let periodEnd = new Date(now);

    if (type === "WEEKLY") {
      periodEnd.setDate(periodEnd.getDate() + 7);
    } else if (type === "MONTHLY") {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else if (type === "YEARLY") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    // Check if an active budget already exists for this category and type with overlapping period
    const existingBudget = await prisma.expenseBudget.findFirst({
      where: {
        userId: userid,
        category: catagory.toUpperCase(),
        type: type,
        isActive: true,
        // Check for overlapping periods
        periodStart: {
          lte: periodEnd, // existing budget starts before or at the end of new period
        },
        periodEnd: {
          gte: now, // existing budget ends after or at the start of new period
        },
      },
    });

    if (existingBudget) {
      return res.status(400).json({
        message: `An active ${type} expense budget for ${catagory.toUpperCase()} category already exists from ${existingBudget.periodStart} to ${existingBudget.periodEnd}`,
      });
    }

    const newBudget = await prisma.expenseBudget.create({
      data: {
        amount,
        category: catagory.toUpperCase(),
        type: type,
        userId: userid,
        periodStart: now,
        periodEnd: periodEnd,
      },
    });

    return res.status(201).json(newBudget);
  } catch (err) {
    return res.status(500).json({ message: "Failed to add expense budget" });
  }
};

export const getExpenseBudgets = async (req: Request, res: Response) => {
  try {
    const userid = req.user?.id;
    if (!userid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const budgets = await prisma.expenseBudget.findMany({
      where: { userId: userid },
      orderBy: { type: "asc" },
    });

    return res.status(200).json(budgets);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch expense budgets" });
  }
};

export const getExpenseBudgetByCategory = async (req: Request, res: Response) => {
  try {
    const userid = req.user?.id;
    if (!userid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const categoryQuery = req.params.category?.toUpperCase();
    if (!validExpenseCatagory(categoryQuery)) {
      return res.status(400).json({ message: "Invalid expense category" });
    }

    const budgets = await prisma.expenseBudget.findMany({
      where: {
        userId: userid,
        category: categoryQuery as ExpenseCategory,
      },
      orderBy: { type: "asc" },
    });

    if (budgets.length === 0) {
      return res.status(404).json({ message: `No expense budgets found for ${categoryQuery} category` });
    }

    return res.status(200).json(budgets);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch expense budgets" });
  }
};

export const updateExpenseBudget = async (req: Request, res: Response) => {
  try {
    const userid = req.user?.id;
    if (!userid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const budgetid = Number(req.params.budgetid);
    if (!Number.isInteger(budgetid) || budgetid <= 0) {
      return res.status(400).json({ message: "Invalid budget id" });
    }

    const { amount, type } = req.body;

    // Verify budget ownership
    const existingBudget = await prisma.expenseBudget.findFirst({
      where: {
        id: budgetid,
        userId: userid,
      },
    });

    if (!existingBudget) {
      return res.status(404).json({ message: "Expense budget not found" });
    }

    // Check if budget is active - only allow updates if active
    if (!existingBudget.isActive) {
      return res.status(400).json({ message: "Cannot update an inactive budget" });
    }

    // Validate update fields
    const updateData: {
      amount?: number;
      type?: "WEEKLY" | "MONTHLY" | "YEARLY";
      periodEnd?: Date;
    } = {};

    if (amount !== undefined) {
      if (typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({ message: "Amount must be a positive number" });
      }
      updateData.amount = amount;
    }

    if (type !== undefined) {
      if (!validBudgetType(type)) {
        return res.status(400).json({ message: "Invalid budget type. Must be WEEKLY, MONTHLY, or YEARLY" });
      }
      updateData.type = type;

      // Recalculate periodEnd based on new type, keeping periodStart the same
      const newPeriodEnd = new Date(existingBudget.periodStart);
      if (type === "WEEKLY") {
        newPeriodEnd.setDate(newPeriodEnd.getDate() + 7);
      } else if (type === "MONTHLY") {
        newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
      } else if (type === "YEARLY") {
        newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1);
      }
      updateData.periodEnd = newPeriodEnd;
    }

    // Check if category + type combination already exists with overlapping periods (only if type is being updated)
    if (type !== undefined) {
      const conflictingBudget = await prisma.expenseBudget.findFirst({
        where: {
          userId: userid,
          category: existingBudget.category,
          type: type,
          isActive: true,
          NOT: { id: budgetid },
          // Check for overlapping periods
          periodStart: {
            lte: updateData.periodEnd,
          },
          periodEnd: {
            gte: existingBudget.periodStart,
          },
        },
      });

      if (conflictingBudget) {
        return res.status(400).json({
          message: `An active ${type} expense budget for ${existingBudget.category} category already exists with overlapping period`,
        });
      }
    }

    const updatedBudget = await prisma.expenseBudget.update({
      where: { id: budgetid },
      data: updateData,
    });

    return res.status(200).json(updatedBudget);
  } catch (err) {
    if (isPrismaKnownError(err) && err.code === "P2025") {
      return res.status(404).json({ message: "Expense budget not found" });
    }

    return res.status(500).json({ message: "Failed to update expense budget" });
  }
};

export const deleteExpenseBudget = async (req: Request, res: Response) => {
  try {
    const userid = req.user?.id;
    if (!userid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const budgetid = Number(req.params.budgetid);
    if (!Number.isInteger(budgetid) || budgetid <= 0) {
      return res.status(400).json({ message: "Invalid budget id" });
    }

    const budget = await prisma.expenseBudget.findFirst({
      where: {
        id: budgetid,
        userId: userid,
      },
      select: { id: true },
    });

    if (!budget) {
      return res.status(404).json({ message: "Expense budget not found" });
    }

    await prisma.expenseBudget.delete({
      where: { id: budgetid },
    });

    return res.status(200).json({ message: "Expense budget deleted successfully" });
  } catch (err) {
    if (isPrismaKnownError(err) && err.code === "P2025") {
      return res.status(404).json({ message: "Expense budget not found" });
    }

    return res.status(500).json({ message: "Failed to delete expense budget" });
  }
};
