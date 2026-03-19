import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { IncomeCategory } from "../types/type.js";
import { validIncomeCatagory } from "../utils/cheakcatgory.js";
import { catagorywisedata } from "../utils/catagorywisedata.js";

type PrismaKnownError = {
  code?: string;
};

const isPrismaKnownError = (err: unknown): err is PrismaKnownError => {
  return typeof err === "object" && err !== null && "code" in err;
};
export const getIncome = async (req: Request, res: Response) => {
  try {
    const userid = req.user?.id;
    if (!userid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const incomes = await prisma.income.findMany({
      where: { userId: userid },
      orderBy: { date: "desc" },
    });

    return res.status(200).json(incomes);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch income" });
  }
};
export const addIncome = async (req: Request, res: Response) => {
  try {
    const { amount, catagory, note, date, adddate } = req.body;
    const userid = req.user?.id;

    if (typeof amount !== "number" || amount < 0) {
      return res.status(400).json({ message: "Amount must be a non-negative number" });
    }

    if (!userid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!validIncomeCatagory(catagory)) {
      return res.status(400).json({ message: "Invalid income category" });
    }

    const requestedDate = date ?? adddate;
    let parsedDate: Date | undefined;
    if (requestedDate !== undefined && requestedDate !== null && requestedDate !== "") {
      parsedDate = requestedDate instanceof Date ? requestedDate : new Date(requestedDate);
      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
    }

    const newincome = await prisma.income.create({
      data: {
        amount,
        category: catagory.toUpperCase(),
        note,
        userId: userid,
        ...(parsedDate ? { date: parsedDate } : {}),
      },
    });

    return res.status(201).json(newincome);
  } catch (err) {
    return res.status(500).json({ message: "Failed to add income" });
  }
};
export const getTotalIncome = async(req:Request,res:Response)=>{
   try {
    const userid = req.user?.id;
    if (!userid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const incomes = await prisma.income.findMany({
      where: { userId: userid }
    });
    const data = catagorywisedata(incomes)

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch income" });
  }
}
export const getcatagoryIncome = async(req:Request,res:Response)=>{
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
    if (!validIncomeCatagory(normalizedCategory)) {
      return res.status(400).json({ message: "Invalid income category" });
    }
    const incomeCategory = normalizedCategory as IncomeCategory;

    const incomes = await prisma.income.findMany({
      where: { userId: userid,
              category: incomeCategory
       }
    });
    const data = catagorywisedata(incomes)

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch income" });
  }
}

export const deleteIncome = async (req: Request, res: Response) => {
  try {
    const userid = req.user?.id;
    if (!userid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const incomeid = Number(req.params.incomeid);
    if (!Number.isInteger(incomeid) || incomeid <= 0) {
      return res.status(400).json({ message: "Invalid income id" });
    }

    const income = await prisma.income.findFirst({
      where: {
        id: incomeid,
        userId: userid,
      },
      select: { id: true },
    });

    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }

    await prisma.income.delete({
      where: {
        id: incomeid,
      },
    });

    return res.status(200).json({ message: "Income deleted successfully" });
  } catch (err) {
    if (isPrismaKnownError(err) && err.code === "P2025") {
      return res.status(404).json({ message: "Income not found" });
    }

    return res.status(500).json({ message: "Failed to delete income" });
  }
};

const validBudgetType = (type: unknown): type is "WEEKLY" | "MONTHLY" | "YEARLY" => {
  return type === "WEEKLY" || type === "MONTHLY" || type === "YEARLY";
};

export const addIncomeGoal = async (req: Request, res: Response) => {
    try {
    const { amount, type, catagory } = req.body;
    const userid = req.user?.id;

    if (!userid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number" });
    }

    if (!validBudgetType(type)) {
      return res.status(400).json({ message: "Type must be WEEKLY, MONTHLY, or YEARLY" });
    }

    if (!validIncomeCatagory(catagory)) {
      return res.status(400).json({ message: "Invalid income category" });
    }

    // Check if goal already exists for this category + type combination
    const existingGoal = await prisma.incomeGoal.findFirst({
      where: {
        userId: userid,
        category: catagory.toUpperCase() as IncomeCategory,
        type: type,
      },
    });

    if (existingGoal) {
      return res.status(400).json({ message: `${type} income goal for ${catagory} category already exists` });
    }

    const incomeGoal = await prisma.incomeGoal.create({
      data: {
        amount,
        type,
        category: catagory.toUpperCase() as IncomeCategory,
        userId: userid,
      },
    });

    return res.status(201).json(incomeGoal);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to add income goal" });
  }
};

export const getIncomeGoals = async (req: Request, res: Response) => {
  try {
    const userid = req.user?.id;
    if (!userid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const goals = await prisma.incomeGoal.findMany({
      where: { userId: userid },
      orderBy: { type: "asc" },
    });

    return res.status(200).json(goals);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch income goals" });
  }
};

export const getIncomeGoalByCategory = async (req: Request, res: Response) => {
  try {
    const userid = req.user?.id;
    if (!userid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const categoryQuery = req.params.category?.toUpperCase();
    if (!validIncomeCatagory(categoryQuery)) {
      return res.status(400).json({ message: "Invalid income category" });
    }

    const goals = await prisma.incomeGoal.findMany({
      where: {
        userId: userid,
        category: categoryQuery as IncomeCategory,
      },
      orderBy: { type: "asc" },
    });

    if (goals.length === 0) {
      return res.status(404).json({ message: `No income goals found for ${categoryQuery} category` });
    }

    return res.status(200).json(goals);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch income goals" });
  }
};

export const updateIncomeGoal = async (req: Request, res: Response) => {
  try {
    const userid = req.user?.id;
    if (!userid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const goalid = Number(req.params.goalid);
    if (!Number.isInteger(goalid) || goalid <= 0) {
      return res.status(400).json({ message: "Invalid goal id" });
    }

    const { amount, type, catagory } = req.body;

    // Verify goal ownership
    const existingGoal = await prisma.incomeGoal.findFirst({
      where: {
        id: goalid,
        userId: userid,
      },
    });

    if (!existingGoal) {
      return res.status(404).json({ message: "Income goal not found" });
    }

    // Validate update fields
    const updateData: { amount?: number; type?: "WEEKLY" | "MONTHLY" | "YEARLY"; category?: IncomeCategory } = {};

    if (amount !== undefined) {
      if (typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({ message: "Amount must be a positive number" });
      }
      updateData.amount = amount;
    }

    if (catagory !== undefined) {
      if (!validIncomeCatagory(catagory)) {
        return res.status(400).json({ message: "Invalid income category" });
      }
      updateData.category = catagory.toUpperCase() as IncomeCategory;
    }

    if (type !== undefined) {
      if (!validBudgetType(type)) {
        return res.status(400).json({ message: "Type must be WEEKLY, MONTHLY, or YEARLY" });
      }
      updateData.type = type;
    }

    // Check if category + type combination already exists (only if either is being updated)
    if (catagory !== undefined || type !== undefined) {
      const finalCategory = catagory !== undefined ? catagory.toUpperCase() : existingGoal.category;
      const finalType = type || existingGoal.type;

      const conflictingGoal = await prisma.incomeGoal.findFirst({
        where: {
          userId: userid,
          category: finalCategory as IncomeCategory,
          type: finalType,
          NOT: { id: goalid },
        },
      });

      if (conflictingGoal) {
        return res.status(400).json({ message: `${finalType} income goal for ${finalCategory} category already exists` });
      }
    }

    const updatedGoal = await prisma.incomeGoal.update({
      where: { id: goalid },
      data: updateData,
    });

    return res.status(200).json(updatedGoal);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update income goal" });
  }
};

export const deleteIncomeGoal = async (req: Request, res: Response) => {
  try {
    const userid = req.user?.id;
    if (!userid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const goalid = Number(req.params.goalid);
    if (!Number.isInteger(goalid) || goalid <= 0) {
      return res.status(400).json({ message: "Invalid goal id" });
    }

    const goal = await prisma.incomeGoal.findFirst({
      where: {
        id: goalid,
        userId: userid,
      },
      select: { id: true },
    });

    if (!goal) {
      return res.status(404).json({ message: "Income goal not found" });
    }

    await prisma.incomeGoal.delete({
      where: { id: goalid },
    });

    return res.status(200).json({ message: "Income goal deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to delete income goal" });
  }
};