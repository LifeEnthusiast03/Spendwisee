-- AlterTable
ALTER TABLE "ExpenseBudget" ADD COLUMN     "fulfilledAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "periodEnd" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "periodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "IncomeGoal" ADD COLUMN     "fulfilledAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "periodEnd" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "periodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "ExpenseBudget_userId_category_isActive_idx" ON "ExpenseBudget"("userId", "category", "isActive");

-- CreateIndex
CREATE INDEX "IncomeGoal_userId_category_isActive_idx" ON "IncomeGoal"("userId", "category", "isActive");
