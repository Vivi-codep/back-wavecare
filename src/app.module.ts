import {
  Module,
  MiddlewareConsumer,
  NestModule,
} from '@nestjs/common';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaService } from './prisma/prisma.service';

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { QuizModule } from './quiz/quiz.module';

import { LoggerMiddleware } from './logger/logger.middleware';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
      exclude: ['/api'], // ✅ CORRIGIDO AQUI
    }),

    UserModule,
    AuthModule,
    ProductModule,
    CartModule,
    OrderModule,
    QuizModule,
  ],

  controllers: [AppController],

  providers: [
    AppService,
    PrismaService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }
}