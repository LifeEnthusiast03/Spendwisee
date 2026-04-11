import { prisma } from "../lib/prisma.js";
import { Request, Response } from "express";

// ===================== ADD GOAL =====================
export const addGoal = async (req: Request, res: Response) => {
    try {
        const { name, amount, startdate, enddate } = req.body;
        const userid = req.user?.id;

        if (!userid) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (typeof name !== "string" || name.trim() === "") {
            return res.status(400).json({ message: "Enter a valid goal name" });
        }

        if (typeof amount !== "number" || amount <= 0) {
            return res.status(400).json({ message: "Amount must be a positive number" });
        }

        if (!startdate || !enddate) {
            return res.status(400).json({ message: "Start date and end date are required" });
        }

        const parsedStartDate = startdate instanceof Date ? startdate : new Date(startdate);
        const parsedEndDate = enddate instanceof Date ? enddate : new Date(enddate);

        if (Number.isNaN(parsedStartDate.getTime()) || Number.isNaN(parsedEndDate.getTime())) {
            return res.status(400).json({ message: "Invalid date format" });
        }

        if (parsedStartDate >= parsedEndDate) {
            return res.status(400).json({ message: "End date must be after start date" });
        }

        const normalizedName = name.trim().toLowerCase();
        const existingGoal = await prisma.goal.findFirst({
            where: {
                userId: userid,
                isActive: true,
                name: normalizedName,
            },
        });

        if (existingGoal) {
            return res.status(409).json({ message: "Same name goal already exists" });
        }

        const newGoal = await prisma.goal.create({
            data: {
                name: normalizedName,
                amount,
                startdate: parsedStartDate,
                enddate: parsedEndDate,
                userId: userid,
            },
        });

        return res.status(201).json(newGoal);
    } catch (err) {
        return res.status(500).json({ message: "Failed to add goal" });
    }
};

// ===================== ADD MONEY TO GOAL =====================
// User can only add money if (totalIncome - totalExpense) >= requested amount
export const addMoneyToGoal = async (req: Request, res: Response) => {
    try {
        const userid = req.user?.id;
        if (!userid) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const goalid = Number(req.params.goalid);
        if (!Number.isInteger(goalid) || goalid <= 0) {
            return res.status(400).json({ message: "Invalid goal id" });
        }

        const { amount } = req.body;
        if (typeof amount !== "number" || amount <= 0) {
            return res.status(400).json({ message: "Amount must be a positive number" });
        }

        // Find the goal and verify ownership
        const goal = await prisma.goal.findFirst({
            where: { id: goalid, userId: userid },
        });

        if (!goal) {
            return res.status(404).json({ message: "Goal not found" });
        }

        if (!goal.isActive) {
            return res.status(400).json({ message: "Cannot add money to an inactive goal" });
        }

        // Calculate total income and total expense for this user
        const totalIncomeResult = await prisma.income.aggregate({
            where: { userId: userid },
            _sum: { amount: true },
        });
        const totalExpenseResult = await prisma.expense.aggregate({
            where: { userId: userid },
            _sum: { amount: true },
        });

        const totalIncome = totalIncomeResult._sum.amount ?? 0;
        const totalExpense = totalExpenseResult._sum.amount ?? 0;
        const availableBalance = totalIncome - totalExpense;

        if (availableBalance < amount) {
            return res.status(400).json({
                message: `Insufficient balance. Available: ${availableBalance}, Requested: ${amount}`,
            });
        }

        // Check if adding money would exceed the goal target
        if (goal.totalMoney + amount > goal.amount) {
            return res.status(400).json({
                message: `Adding ${amount} would exceed the goal target. Current: ${goal.totalMoney}, Target: ${goal.amount}`,
            });
        }

        const updatedGoal = await prisma.goal.update({
            where: { id: goalid },
            data: {
                totalMoney: { increment: amount },
            },
        });

        return res.status(200).json(updatedGoal);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to add money to goal" });
    }
};

// ===================== REMOVE MONEY FROM SINGLE GOAL =====================
// User can remove at most the totalMoney already added to that goal
export const removeMoneyFromGoal = async (req: Request, res: Response) => {
    try {
        const userid = req.user?.id;
        if (!userid) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const goalid = Number(req.params.goalid);
        if (!Number.isInteger(goalid) || goalid <= 0) {
            return res.status(400).json({ message: "Invalid goal id" });
        }

        const { amount } = req.body;
        if (typeof amount !== "number" || amount <= 0) {
            return res.status(400).json({ message: "Amount must be a positive number" });
        }

        const goal = await prisma.goal.findFirst({
            where: { id: goalid, userId: userid },
        });

        if (!goal) {
            return res.status(404).json({ message: "Goal not found" });
        }

        if (amount > goal.totalMoney) {
            return res.status(400).json({
                message: `Cannot remove more than what is saved. Saved: ${goal.totalMoney}, Requested: ${amount}`,
            });
        }

        const updatedGoal = await prisma.goal.update({
            where: { id: goalid },
            data: {
                totalMoney: { decrement: amount },
            },
        });

        return res.status(200).json(updatedGoal);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to remove money from goal" });
    }
};

// ===================== REMOVE MONEY FROM MULTIPLE GOALS =====================
// Accepts an array of { goalid, amount } and removes money from each goal
// User can remove at most the totalMoney already added to each goal
export const removeMoneyFromGoals = async (req: Request, res: Response) => {
    try {
        const userid = req.user?.id;
        if (!userid) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { goals } = req.body;
        if (!Array.isArray(goals) || goals.length === 0) {
            return res.status(400).json({ message: "Goals must be a non-empty array" });
        }

        // Validate each entry
        for (const entry of goals) {
            if (!entry.goalid || typeof entry.goalid !== "number" || entry.goalid <= 0) {
                return res.status(400).json({ message: `Invalid goal id: ${entry.goalid}` });
            }
            if (typeof entry.amount !== "number" || entry.amount <= 0) {
                return res.status(400).json({ message: `Amount must be a positive number for goal id: ${entry.goalid}` });
            }
        }

        // Fetch all the goals in one query
        const goalIds = goals.map((g: { goalid: number }) => g.goalid);
        const existingGoals = await prisma.goal.findMany({
            where: { id: { in: goalIds }, userId: userid },
        });

        if (existingGoals.length !== goalIds.length) {
            const foundIds = existingGoals.map((g) => g.id);
            const missingIds = goalIds.filter((id: number) => !foundIds.includes(id));
            return res.status(404).json({ message: `Goals not found: ${missingIds.join(", ")}` });
        }

        // Validate removal amounts
        for (const entry of goals) {
            const goal = existingGoals.find((g) => g.id === entry.goalid);
            if (goal && entry.amount > goal.totalMoney) {
                return res.status(400).json({
                    message: `Cannot remove more than saved for goal "${goal.name}". Saved: ${goal.totalMoney}, Requested: ${entry.amount}`,
                });
            }
        }

        // Perform all updates in a transaction
        const updatedGoals = await prisma.$transaction(
            goals.map((entry: { goalid: number; amount: number }) =>
                prisma.goal.update({
                    where: { id: entry.goalid },
                    data: {
                        totalMoney: { decrement: entry.amount },
                    },
                })
            )
        );

        return res.status(200).json(updatedGoals);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to remove money from goals" });
    }
};

// ===================== UPDATE GOAL =====================
// User can only update an active goal. Only amount and enddate can be updated.
export const updateGoal = async (req: Request, res: Response) => {
    try {
        const userid = req.user?.id;
        if (!userid) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const goalid = Number(req.params.goalid);
        if (!Number.isInteger(goalid) || goalid <= 0) {
            return res.status(400).json({ message: "Invalid goal id" });
        }

        const { amount, enddate } = req.body;

        // Verify goal ownership
        const existingGoal = await prisma.goal.findFirst({
            where: { id: goalid, userId: userid },
        });

        if (!existingGoal) {
            return res.status(404).json({ message: "Goal not found" });
        }

        if (!existingGoal.isActive) {
            return res.status(400).json({ message: "Cannot update an inactive goal" });
        }

        const updateData: { amount?: number; enddate?: Date } = {};

        if (amount !== undefined) {
            if (typeof amount !== "number" || amount <= 0) {
                return res.status(400).json({ message: "Amount must be a positive number" });
            }
            // New target amount cannot be less than money already saved
            if (amount < existingGoal.totalMoney) {
                return res.status(400).json({
                    message: `New target amount cannot be less than money already saved (${existingGoal.totalMoney})`,
                });
            }
            updateData.amount = amount;
        }

        if (enddate !== undefined) {
            const parsedEndDate = enddate instanceof Date ? enddate : new Date(enddate);
            if (Number.isNaN(parsedEndDate.getTime())) {
                return res.status(400).json({ message: "Invalid date format" });
            }
            if (parsedEndDate <= existingGoal.startdate) {
                return res.status(400).json({ message: "End date must be after start date" });
            }
            updateData.enddate = parsedEndDate;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "Nothing to update. Provide amount or enddate." });
        }

        const updatedGoal = await prisma.goal.update({
            where: { id: goalid },
            data: updateData,
        });

        return res.status(200).json(updatedGoal);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to update goal" });
    }
};

// ===================== DELETE GOAL =====================
export const deleteGoal = async (req: Request, res: Response) => {
    try {
        const userid = req.user?.id;
        if (!userid) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const goalid = Number(req.params.goalid);
        if (!Number.isInteger(goalid) || goalid <= 0) {
            return res.status(400).json({ message: "Invalid goal id" });
        }

        const goal = await prisma.goal.findFirst({
            where: { id: goalid, userId: userid },
            select: { id: true },
        });

        if (!goal) {
            return res.status(404).json({ message: "Goal not found" });
        }

        await prisma.goal.delete({
            where: { id: goalid },
        });

        return res.status(200).json({ message: "Goal deleted successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to delete goal" });
    }
};

// ===================== GET TOTAL MONEY IN A GOAL =====================
export const totalMoneyInGoal = async (req: Request, res: Response) => {
    try {
        const userid = req.user?.id;
        if (!userid) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const goalid = Number(req.params.goalid);
        if (!Number.isInteger(goalid) || goalid <= 0) {
            return res.status(400).json({ message: "Invalid goal id" });
        }

        const goal = await prisma.goal.findFirst({
            where: { id: goalid, userId: userid },
            select: {
                id: true,
                name: true,
                amount: true,
                totalMoney: true,
                isActive: true,
            },
        });

        if (!goal) {
            return res.status(404).json({ message: "Goal not found" });
        }

        return res.status(200).json({
            id: goal.id,
            name: goal.name,
            targetAmount: goal.amount,
            totalMoney: goal.totalMoney,
            remaining: goal.amount - goal.totalMoney,
            isActive: goal.isActive,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch goal money" });
    }
};

// ===================== GET ALL GOALS =====================
export const getGoals = async (req: Request, res: Response) => {
    try {
        const userid = req.user?.id;
        if (!userid) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const goals = await prisma.goal.findMany({
            where: { userId: userid },
            orderBy: { createdAt: "desc" },
        });

        return res.status(200).json(goals);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch goals" });
    }
};