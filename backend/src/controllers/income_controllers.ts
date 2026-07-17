import { Request, Response } from "express";
import { incomeService } from "../services/income_service.js";
import { handleControllerError } from "../utils/errors.js";

export const getIncome = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const result = await incomeService.getIncome(userId!);
    return res.status(200).json(result);
  } catch (err) {
    return handleControllerError(res, err, "Failed to fetch income try agian");
  }
};

export const addIncome = async (req: Request, res: Response) => {
  try {
    const { amount, catagory, note, date, adddate } = req.body;
    const userId = req.user?.id;
    const requestedDate = date ?? adddate;
    const result = await incomeService.addIncome(
      userId!,
      amount,
      catagory,
      note,
      requestedDate
    );
    return res.status(201).json(result);
  } catch (err) {
    return handleControllerError(res, err, "Failed to add income");
  }
};

export const getTotalIncome = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const result = await incomeService.getTotalIncome(userId!);
    return res.status(200).json(result);
  } catch (err) {
    return handleControllerError(res, err, "Failed to fetch income");
  }
};

export const getcatagoryIncome = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const result = await incomeService.getCategoryIncome(
      userId!,
      req.query.catagory
    );
    return res.status(200).json(result);
  } catch (err) {
    return handleControllerError(res, err, "Failed to fetch income");
  }
};

export const deleteIncome = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const incomeId = Number(req.params.incomeid);
    const result = await incomeService.deleteIncome(userId!, incomeId);
    return res.status(200).json(result);
  } catch (err) {
    return handleControllerError(res, err, "Failed to delete income");
  }
};