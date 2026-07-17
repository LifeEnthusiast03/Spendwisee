import { Request, Response } from "express";
import { incomeGoalService } from "../services/income_goal_service.js";
import { handleControllerError } from "../utils/errors.js";

export const addIncomeGoal = async (req: Request, res: Response) => {
  try {
    const { amount, type, catagory } = req.body;
    const userId = req.user?.id;
    const result = await incomeGoalService.addIncomeGoal(
      userId!,
      amount,
      type,
      catagory
    );
    return res.status(201).json(result);
  } catch (err) {
    return handleControllerError(res, err, "Failed to add income goal");
  }
};

export const getIncomeGoals = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const result = await incomeGoalService.getIncomeGoals(userId!);
    return res.status(200).json(result);
  } catch (err) {
    return handleControllerError(res, err, "Failed to fetch income goals");
  }
};

export const getIncomeGoalByCategory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const result = await incomeGoalService.getIncomeGoalByCategory(
      userId!,
      req.params.category
    );
    return res.status(200).json(result);
  } catch (err) {
    return handleControllerError(res, err, "Failed to fetch income goals");
  }
};

export const updateIncomeGoal = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const goalId = Number(req.params.goalid);
    const { amount, type } = req.body;
    const result = await incomeGoalService.updateIncomeGoal(
      userId!,
      goalId,
      amount,
      type
    );
    return res.status(200).json(result);
  } catch (err) {
    return handleControllerError(res, err, "Failed to update income goal");
  }
};

export const deleteIncomeGoal = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const goalId = Number(req.params.goalid);
    const result = await incomeGoalService.deleteIncomeGoal(userId!, goalId);
    return res.status(200).json(result);
  } catch (err) {
    return handleControllerError(res, err, "Failed to delete income goal");
  }
};
