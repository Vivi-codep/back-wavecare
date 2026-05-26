import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';

import { Request } from 'express';

import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  addItem(
    @Body() data: AddCartItemDto,
    @Req() req: Request,
  ) {
    return this.cartService.addItem({
      ...data,
      userId: (req.user as any).id,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  getCart(
    @Param('userId') userId: string,
    @Req() req: Request,
  ) {
    const user = req.user as any;

    if (
      user.role !== 'admin' &&
      user.id !== Number(userId)
    ) {
      throw new ForbiddenException(
        'Você não pode ver outro carrinho',
      );
    }

    return this.cartService.getCart(
      Number(userId),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  updateQuantity(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
    @Req() req: Request,
  ) {
    return this.cartService.updateQuantity(
      Number(id),
      quantity,
      req.user as any,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  removeItem(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    return this.cartService.removeItem(
      Number(id),
      req.user as any,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('clear/:userId')
  clearCart(
    @Param('userId') userId: string,
    @Req() req: Request,
  ) {
    const user = req.user as any;

    if (
      user.role !== 'admin' &&
      user.id !== Number(userId)
    ) {
      throw new ForbiddenException(
        'Você não pode apagar outro carrinho',
      );
    }

    return this.cartService.clearCart(
      Number(userId),
    );
  }
}