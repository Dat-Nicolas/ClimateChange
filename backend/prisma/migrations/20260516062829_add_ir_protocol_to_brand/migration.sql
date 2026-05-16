/*
  Warnings:

  - Added the required column `irProtocol` to the `Brand` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "irProtocol" TEXT NOT NULL;
