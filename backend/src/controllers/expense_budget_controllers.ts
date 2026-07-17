import { Request, Response } from "express";
import { expenseBudgetService } from "../services/expense_budget_service.js";
import { handleControllerError } from "../utils/errors.js";

export const addExpenseBudget = async (req: Request, res: Response) => {
  try {
    const { catagory, amount, type } = req.body;
    const userId = req.user?.id;
    const result = await expenseBudgetService.addExpenseBudget(
      userId!,
      amount,
      type,
      catagory
    );
    return res.status(201).json(result);
  } catch (err) {
    return handleControllerError(res, err, "Failed to add expense budget");
  }
};

export const getExpenseBudgets = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const result = await expenseBudgetService.getExpenseBudgets(userId!);
    return res.status(200).json(result);
  } catch (err) {
    return handleControllerError(res, err, "Failed to fetch expense budgets");
  }
};

export const getExpenseBudgetByCategory = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const result = await expenseBudgetService.getExpenseBudgetByCategory(
      userId!,
      req.params.category
    );
    return res.status(200).json(result);
  } catch (err) {
    return handleControllerError(res, err, "Failed to fetch expense budgets");
  }
};

export const updateExpenseBudget = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const budgetId = Number(req.params.budgetid);
    const { amount, type } = req.body;
    const result = await expenseBudgetService.updateExpenseBudget(
      userId!,
      budgetId,
      amount,
      type
    );
    return res.status(200).json(result);
  } catch (err) {
    return handleControllerError(res, err, "Failed to update expense budget");
  }
};

export const deleteExpenseBudget = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const budgetId = Number(req.params.budgetid);
    const result = await expenseBudgetService.deleteExpenseBudget(
      userId!,
      budgetId
    );
    return res.status(200).json(result);
  } catch (err) {
    return handleControllerError(res, err, "Failed to delete expense budget");
  }
};
