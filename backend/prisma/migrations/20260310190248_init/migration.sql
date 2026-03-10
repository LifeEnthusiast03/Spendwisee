/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `provider_id` on the `User` table. All the data in the column will be lost.
  - Added the required column `lastname` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_provider_id_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
DROP COLUMN "provider_id",
ADD COLUMN     "firstname" TEXT,
ADD COLUMN     "lastname" TEXT NOT NULL;
