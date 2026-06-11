/*
  Warnings:

  - You are about to alter the column `status` on the `order` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.
  - You are about to alter the column `paymentMethod` on the `order` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.
  - You are about to alter the column `paymentStatus` on the `order` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.

*/
-- AlterTable
ALTER TABLE `order` MODIFY `status` ENUM('pending', 'confirmed', 'canceled', 'shipped', 'delivered') NOT NULL DEFAULT 'pending',
    MODIFY `paymentMethod` ENUM('pix', 'card', 'boleto') NULL,
    MODIFY `paymentStatus` ENUM('pending', 'paid', 'failed') NOT NULL DEFAULT 'pending';
