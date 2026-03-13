import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { validExpenseCatagory } from "../utils/cheakcatgory.js";

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
    const { amount, catagory, note } = req.body;
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

    const newexpense = await prisma.expense.create({
      data: {
        amount,
        category: catagory.toUpperCase(),
        note,
        userId: userid,
      },
    });

    return res.status(201).json(newexpense);
  } catch (err) {
    return res.status(500).json({ message: "Failed to add expense" });
  }
};
