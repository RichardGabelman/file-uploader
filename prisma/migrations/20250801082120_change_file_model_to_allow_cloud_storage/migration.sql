/*
  Warnings:

  - You are about to drop the column `fileUrl` on the `File` table. All the data in the column will be lost.
  - Added the required column `storageKey` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storageUrl` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" DROP COLUMN "fileUrl",
ADD COLUMN     "storageKey" TEXT NOT NULL,
ADD COLUMN     "storageUrl" TEXT NOT NULL;
