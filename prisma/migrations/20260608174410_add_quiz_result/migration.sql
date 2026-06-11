-- DropForeignKey
ALTER TABLE `cart` DROP FOREIGN KEY `Cart_userId_fkey`;

-- DropForeignKey
ALTER TABLE `cartitem` DROP FOREIGN KEY `CartItem_cartId_fkey`;

-- DropForeignKey
ALTER TABLE `cartitem` DROP FOREIGN KEY `CartItem_productId_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_userId_fkey`;

-- DropForeignKey
ALTER TABLE `orderitem` DROP FOREIGN KEY `OrderItem_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `orderitem` DROP FOREIGN KEY `OrderItem_productId_fkey`;

-- CreateTable
CREATE TABLE `quiz_results` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `city` VARCHAR(50) NOT NULL,
    `hairType` VARCHAR(50) NOT NULL,
    `beachFrequency` VARCHAR(50) NOT NULL,
    `sunProtection` VARCHAR(50) NOT NULL,
    `wetHair` VARCHAR(50) NOT NULL,
    `hairState` VARCHAR(50) NOT NULL,
    `chemicalProcess` VARCHAR(50) NOT NULL,
    `season` VARCHAR(20) NOT NULL,
    `diagnosis` VARCHAR(50) NOT NULL,
    `recommendedKit` VARCHAR(100) NOT NULL,
    `scores` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cart` ADD CONSTRAINT `cart_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cartitem` ADD CONSTRAINT `cartitem_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `cart`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cartitem` ADD CONSTRAINT `cartitem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderitem` ADD CONSTRAINT `orderitem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderitem` ADD CONSTRAINT `orderitem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz_results` ADD CONSTRAINT `quiz_results_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `cart` RENAME INDEX `Cart_userId_key` TO `cart_userId_key`;
