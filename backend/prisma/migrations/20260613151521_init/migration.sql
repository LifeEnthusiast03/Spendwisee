/*
  Warnings:

  - You are about to drop the column `isActive` on the `ExpenseBudget` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `IncomeGoal` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ExpenseBudget_userId_category_isActive_idx";

-- DropIndex
DROP INDEX "IncomeGoal_userId_category_isActive_idx";

-- AlterTable
ALTER TABLE "ExpenseBudget" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "IncomeGoal" DROP COLUMN "isActive";

-- CreateIndex
CREATE INDEX "ExpenseBudget_userId_category_periodStart_periodEnd_idx" ON "ExpenseBudget"("userId", "category", "periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "IncomeGoal_userId_category_periodStart_periodEnd_idx" ON "IncomeGoal"("userId", "category", "periodStart", "periodEnd");
