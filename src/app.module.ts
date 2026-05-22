import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaService } from './prisma/prisma.service';

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { CartModule } from './cart/cart.module';
import { CartService } from './cart/cart.service';
import { CartController } from './cart/cart.controller';

@Module({
  imports: [
    UserModule,
    AuthModule,
    ProductModule,
    CartModule,
  ],
  controllers: [AppController, CartController],
  providers: [AppService, PrismaService, CartService],
})
export class AppModule {}