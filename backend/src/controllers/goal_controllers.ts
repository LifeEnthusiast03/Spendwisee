import { Request, Response } from "express";
import { goalService } from "../services/goal_service.js";
import { handleControllerError } from "../utils/errors.js";

export const addGoal = async (req: Request, res: Response) => {
  try {
    const { name, amount, startdate, enddate } = req.body;
    const userId = req.user?.id;
    const result = await goalService.addGoal(
      userId!,
      name,
      amount,
      startdate,
      enddate
    );
    return res.status(201).json(result);
  } catch (err) {
    return handleControllerError(res, err, "Failed to add goal");
  }
};

export const addMoneyToGoal = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const goalId = Number(req.params.goalid);
    const { amount } = req.body;
    const result = await goalService.addMoneyToGoal(userId!, goalId, amount);
    return res.status(200).json(result);
  } catch (err) {
    return handleControllerError(res, err, "Failed to add money to goal");
  }
};

export const removeMoneyFromGoal = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const goalId = Number(req.params.goalid);
    const { amount } = req.body;
    const result = await goalService.removeMoneyFromGoal(
      userId!,
      goalId,
      amount
    );
    return res.status(200).json(result);
  } catch (err) {
    return handleControllerError(res, err, "Failed to remove money from goal");
  }
};

export const removeMoneyFromGoals = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { goals } = req.body;
    const result = await goalService.removeMoneyFromGoals(userId!, goals);
    return res.status(200).json(result);
  } catch (err) {
    return handleControllerError(
      res,
      err,
      "Failed to remove money from goals"
    );
  }
};

export const updateGoal = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const goalId = Number(req.params.goalid);
    const { amount, enddate } = req.body;
    const result = await goalService.updateGoal(
      userId!,
      goalId,
      amount,
      enddate
    );
    return res.status(200).json(result);
  } catch (err) {
    return handleControllerError(res, err, "Failed to update goal");
  }
};

export const deleteGoal = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const goalId = Number(req.params.goalid);
    const result = await goalService.deleteGoal(userId!, goalId);
    return res.status(200).json(result);
  } catch (err) {
    return handleControllerError(res, err, "Failed to delete goal");
  }
};

export const totalMoneyInGoal = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const goalId = Number(req.params.goalid);
    const result = await goalService.totalMoneyInGoal(userId!, goalId);
    return res.status(200).json(result);
  } catch (err) {
    return handleControllerError(res, err, "Failed to fetch goal money");
  }
};

export const getGoals = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const result = await goalService.getGoals(userId!);
    return res.status(200).json(result);
  } catch (err) {
    return handleControllerError(res, err, "Failed to fetch goals");
  }
};