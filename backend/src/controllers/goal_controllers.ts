import {prisma} from "../lib/prisma.js"
import { Request, Response } from "express";

export const addGoal =async(req:Request,res:Response)=>{
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
    }
    catch (err) {
        return res.status(500).json({ message: "Failed to add goal" });
    }
}
export const addMoneyToGoal =async()=>{
        
}
export const removeMoneyFromGoal =async()=>{

}
export const updateGoal =async()=>{

}
export const deleteGoal =async()=>{

}
export const totalMoneyInGoal =async()=>{

}