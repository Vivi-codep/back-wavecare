import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';

@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
  ) {}

  @Post()
  addItem(
    @Body() data: AddCartItemDto,
  ) {
    return this.cartService.addItem(data);
  }

  @Get(':userId')
  getCart(
    @Param('userId') userId: string,
  ) {
    return this.cartService.getCart(
      Number(userId),
    );
  }

  @Put(':id')
  updateQuantity(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ) {
    return this.cartService.updateQuantity(
      Number(id),
      quantity,
    );
  }

  @Delete(':id')
  removeItem(
    @Param('id') id: string,
  ) {
    return this.cartService.removeItem(
      Number(id),
    );
  }

  @Delete('clear/:userId')
  clearCart(
    @Param('userId') userId: string,
  ) {
    return this.cartService.clearCart(
      Number(userId),
    );
  }
}