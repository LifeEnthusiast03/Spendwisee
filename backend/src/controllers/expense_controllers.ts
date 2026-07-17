import { Request, Response } from "express";
import { expenseService } from "../services/expense_service.js";
import { handleControllerError } from "../utils/errors.js";

export const getExpense = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const result = await expenseService.getExpense(userId!);
    return res.status(200).json(result);
  } catch (err) {
    return handleControllerError(res, err, "Failed to fetch expense");
  }
};

export const addExpense = async (req: Request, res: Response) => {
  try {
    const { amount, catagory, note, date, adddate } = req.body;
    const userId = req.user?.id;
    const requestedDate = date ?? adddate;
    const result = await expenseService.addExpense(
      userId!,
      amount,
      catagory,
      note,
      requestedDate
    );
    return res.status(201).json(result);
  } catch (err) {
    return handleControllerError(res, err, "Failed to add expense");
  }
};

export const getTotalExpense = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const result = await expenseService.getTotalExpense(userId!);
    return res.status(200).json(result);
  } catch (err) {
    return handleControllerError(res, err, "Failed to fetch expense");
  }
};

export const getcatagoryExpense = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const result = await expenseService.getCategoryExpense(
      userId!,
      req.query.catagory
    );
    return res.status(200).json(result);
  } catch (err) {
    return handleControllerError(res, err, "Failed to fetch expense");
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const expenseId = Number(req.params.expenseid);
    const result = await expenseService.deleteExpense(userId!, expenseId);
    return res.status(200).json(result);
  } catch (err) {
    return handleControllerError(res, err, "Failed to delete expense");
  }
};
