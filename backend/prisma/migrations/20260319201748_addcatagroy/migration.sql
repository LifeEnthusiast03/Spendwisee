-- AlterTable
ALTER TABLE "ExpenseBudget" ADD COLUMN     "category" "IncomeCategory" NOT NULL DEFAULT 'OTHER';

-- AlterTable
ALTER TABLE "IncomeGoal" ADD COLUMN     "category" "IncomeCategory" NOT NULL DEFAULT 'OTHER';
