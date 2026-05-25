import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
  ) {}

  @Post(':userId')
  createOrder(
    @Param('userId') userId: string,
  ) {
    return this.orderService.createOrder(
      Number(userId),
    );
  }

  @Get()
  getAllOrders() {
    return this.orderService.getAllOrders();
  }

  @Get(':id')
  getOrder(
    @Param('id') id: string,
  ) {
    return this.orderService.getOrder(
      Number(id),
    );
  }

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

  @Delete(':id')
  deleteOrder(
    @Param('id') id: string,
  ) {
    return this.orderService.deleteOrder(
      Number(id),
    );
  }
}