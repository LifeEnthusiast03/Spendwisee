import ExcelJS from "exceljs";
import { prisma } from "../lib/prisma.js";
import { catagorywisedata } from "../utils/catagorywisedata.js";
import { UnauthorizedError } from "../utils/errors.js";

// ─── Allowed range values ────────────────────────────────────────────────────
export type ExportRange = "this_month" | "last_3" | "last_6" | "all_time";

const VALID_RANGES: ExportRange[] = [
  "this_month",
  "last_3",
  "last_6",
  "all_time",
];

class ExportService {
  private readonly prisma = prisma;

  // ── Private helpers ────────────────────────────────────────────────────────

  private isValidRange(value: unknown): value is ExportRange {
    return (
      typeof value === "string" && (VALID_RANGES as string[]).includes(value)
    );
  }

  private getStartDate(range: ExportRange): Date | undefined {
    const now = new Date();
    switch (range) {
      case "this_month":
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case "last_3": {
        const d = new Date(now);
        d.setMonth(d.getMonth() - 3);
        return d;
      }
      case "last_6": {
        const d = new Date(now);
        d.setMonth(d.getMonth() - 6);
        return d;
      }
      case "all_time":
      default:
        return undefined;
    }
  }

  private styleHeaderRow(row: ExcelJS.Row, fillColor: string): void {
    row.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: fillColor },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        bottom: { style: "thin", color: { argb: "FFD0D0D0" } },
      };
    });
    row.height = 24;
  }

  private autoSizeColumns(sheet: ExcelJS.Worksheet): void {
    sheet.columns.forEach((col) => {
      if (!col || !col.eachCell) return;
      let maxLen = (col.header as string)?.length ?? 10;
      col.eachCell({ includeEmpty: false }, (cell) => {
        const cellLen = cell.value ? String(cell.value).length : 0;
        if (cellLen > maxLen) maxLen = cellLen;
      });
      col.width = Math.min(maxLen + 4, 50);
    });
  }

  private fmtAmount(n: number): string {
    return `₹${new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
    }).format(n)}`;
  }

  // ── Public method ──────────────────────────────────────────────────────────

  async buildWorkbook(
    userId: number,
    range: ExportRange
  ): Promise<{ workbook: ExcelJS.Workbook; filename: string }> {
    if (!userId) throw new UnauthorizedError();

    const validRange = this.isValidRange(range) ? range : "all_time";
    const since = this.getStartDate(validRange);
    const dateFilter = since ? { gte: since } : undefined;

    const [incomes, expenses] = await Promise.all([
      this.prisma.income.findMany({
        where: { userId, ...(dateFilter ? { date: dateFilter } : {}) },
        orderBy: { date: "desc" },
      }),
      this.prisma.expense.findMany({
        where: { userId, ...(dateFilter ? { date: dateFilter } : {}) },
        orderBy: { date: "desc" },
      }),
    ]);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "SpendWise";
    workbook.created = new Date();

    // ── Sheet 1: Income ──────────────────────────────────────────────────────
    const incomeSheet = workbook.addWorksheet("Income");
    incomeSheet.columns = [
      { header: "Date", key: "date", width: 14 },
      { header: "Category", key: "category", width: 18 },
      { header: "Amount", key: "amount", width: 16 },
      { header: "Note", key: "note", width: 32 },
    ];
    this.styleHeaderRow(incomeSheet.getRow(1), "FF059669");
    incomes.forEach((inc) => {
      incomeSheet.addRow({
        date: new Date(inc.date).toLocaleDateString("en-IN"),
        category: inc.category,
        amount: this.fmtAmount(inc.amount),
        note: inc.note ?? "",
      });
    });
    this.autoSizeColumns(incomeSheet);

    // ── Sheet 2: Expenses ────────────────────────────────────────────────────
    const expenseSheet = workbook.addWorksheet("Expenses");
    expenseSheet.columns = [
      { header: "Date", key: "date", width: 14 },
      { header: "Category", key: "category", width: 18 },
      { header: "Amount", key: "amount", width: 16 },
      { header: "Note", key: "note", width: 32 },
    ];
    this.styleHeaderRow(expenseSheet.getRow(1), "FFE11D48");
    expenses.forEach((exp) => {
      expenseSheet.addRow({
        date: new Date(exp.date).toLocaleDateString("en-IN"),
        category: exp.category,
        amount: this.fmtAmount(exp.amount),
        note: exp.note ?? "",
      });
    });
    this.autoSizeColumns(expenseSheet);

    // ── Sheet 3: Summary ─────────────────────────────────────────────────────
    const summarySheet = workbook.addWorksheet("Summary");
    summarySheet.columns = [
      { header: "Category", key: "category", width: 24 },
      { header: "Type", key: "type", width: 12 },
      { header: "Total", key: "total", width: 18 },
    ];
    this.styleHeaderRow(summarySheet.getRow(1), "FF1E3A5F");

    const incomeTotals = catagorywisedata(incomes);
    Object.entries(incomeTotals).forEach(([cat, total]) => {
      summarySheet.addRow({
        category: cat,
        type: "Income",
        total: this.fmtAmount(total),
      });
    });

    const expenseTotals = catagorywisedata(expenses);
    Object.entries(expenseTotals).forEach(([cat, total]) => {
      summarySheet.addRow({
        category: cat,
        type: "Expense",
        total: this.fmtAmount(total),
      });
    });

    summarySheet.addRow({});

    const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
    const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
    const netSavings = totalIncome - totalExpense;

    const footerData = [
      { category: "Total Income", type: "", total: this.fmtAmount(totalIncome) },
      { category: "Total Expenses", type: "", total: this.fmtAmount(totalExpense) },
      { category: "Net Savings", type: "", total: this.fmtAmount(netSavings) },
    ];

    footerData.forEach((f) => {
      const row = summarySheet.addRow(f);
      row.eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: netSavings >= 0 ? "FFD1FAE5" : "FFFFE4E6" },
        };
      });
    });

    this.autoSizeColumns(summarySheet);

    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `spendwise-export-${validRange}-${dateStr}.xlsx`;

    return { workbook, filename };
  }
}

export const exportService = new ExportService();
