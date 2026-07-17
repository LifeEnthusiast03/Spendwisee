import { Request, Response } from "express";
import { exportService, ExportRange } from "../services/export_service.js";
import { handleControllerError } from "../utils/errors.js";

export const exportTransactions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const range = (req.query["range"] ?? "all_time") as ExportRange;

    const { workbook, filename } = await exportService.buildWorkbook(
      userId!,
      range
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("[exportTransactions] error:", err);
    if (!res.headersSent) {
      handleControllerError(res, err, "Failed to generate export");
    }
  }
};
