import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { IncomeCategory } from "../types/type.js";
import { validIncomeCatagory } from "../utils/cheakcatgory.js";
import { catagorywisedata } from "../utils/catagorywisedata.js";
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
    const { amount, catagory, note } = req.body;
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

    const newincome = await prisma.income.create({
      data: {
        amount,
        category: catagory.toUpperCase(),
        note,
        userId: userid,
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