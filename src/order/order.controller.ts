import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';

import { Request } from 'express';
import { OrderService } from './order.service';
import {
  OrderStatus,
  PaymentMethod,
} from '@prisma/client';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // 🛒 CART ORDER
  @UseGuards(JwtAuthGuard)
  @Post()
  createOrder(
    @Req() req: Request,
    @Body('paymentMethod') paymentMethod: PaymentMethod,
  ) {
    const user = req.user as any;

    return this.orderService.createOrder(
      user.id,
      paymentMethod,
    );
  }

  // 🧾 DIRECT ORDER
  @UseGuards(JwtAuthGuard)
  @Post('direct')
  createDirectOrder(
    @Req() req: Request,
    @Body() body: any,
  ) {
    const user = req.user as any;

    return this.orderService.createDirectOrder(
      user.id,
      Number(body.productId),
      Number(body.quantity),
      body.paymentMethod,
    );
  }

  // 💳 CONFIRM PAYMENT
  @UseGuards(JwtAuthGuard)
  @Put(':id/pay')
  confirmPayment(@Param('id') id: string) {
    return this.orderService.confirmPayment(Number(id));
  }

  // 📦 ADMIN
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  getAllOrders() {
    return this.orderService.getAllOrders();
  }

  // 👤 USER ORDERS
  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  getUserOrders(
    @Param('userId') userId: string,
    @Req() req: Request,
  ) {
    const user = req.user as any;

    if (user.role !== 'admin' && user.id !== Number(userId)) {
      throw new ForbiddenException('Acesso negado');
    }

    return this.orderService.getUserOrders(Number(userId));
  }

  // 📦 ONE ORDER
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getOrder(@Param('id') id: string, @Req() req: Request) {
    return this.orderService.getOrder(Number(id), req.user as any);
  }

  // ✏️ STATUS
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':id')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ) {
    return this.orderService.updateStatus(Number(id), status);
  }

  // 🗑️ DELETE
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  deleteOrder(@Param('id') id: string) {
    return this.orderService.deleteOrder(Number(id));
  }
}