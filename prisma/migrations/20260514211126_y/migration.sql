/*
  Warnings:

  - You are about to drop the column `foto` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `product` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `foto`,
    DROP COLUMN `role`;

-- DropTable
DROP TABLE `product`;
