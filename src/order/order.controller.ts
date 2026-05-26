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
import { DirectOrderDto } from './dto/direct-order.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('direct')
  createDirectOrder(
    @Body() data: DirectOrderDto,
    @Req() req: Request,
  ) {
    return this.orderService.createDirectOrder(
      (req.user as any).id,
      data.productId,
      data.quantity,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':userId')
  createOrder(
    @Param('userId') userId: string,
    @Req() req: Request,
  ) {
    const user = req.user as any;

    if (
      user.role !== 'admin' &&
      user.id !== Number(userId)
    ) {
      throw new ForbiddenException(
        'Você não pode criar pedido para outro usuário',
      );
    }

    return this.orderService.createOrder(
      Number(userId),
    );
  }

  @UseGuards(
    JwtAuthGuard,
    AdminGuard,
  )
  @Get()
  getAllOrders() {
    return this.orderService.getAllOrders();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getOrder(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    return this.orderService.getOrder(
      Number(id),
      req.user as any,
    );
  }

  @UseGuards(
    JwtAuthGuard,
    AdminGuard,
  )
  @Put(':id')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.orderService.updateStatus(
      Number(id),
      status,
    );
  }

  @UseGuards(
    JwtAuthGuard,
    AdminGuard,
  )
  @Delete(':id')
  deleteOrder(
    @Param('id') id: string,
  ) {
    return this.orderService.deleteOrder(
      Number(id),
    );
  }
}