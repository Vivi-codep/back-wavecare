import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async addItem(data: AddCartItemDto) {
    const product = await this.prisma.product.findUnique({
      where: {
        id: data.productId,
      },
    });

    if (!product) {
      throw new BadRequestException(
        'Produto não encontrado',
      );
    }

    let cart = await this.prisma.cart.findUnique({
      where: {
        userId: data.userId,
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          userId: data.userId,
        },
      });
    }

    const existingItem =
      await this.prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: data.productId,
        },
      });

    if (existingItem) {
      return this.prisma.cartItem.update({
        where: {
          id: existingItem.id,
        },
        data: {
          quantity:
            existingItem.quantity + data.quantity,
        },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        quantity: data.quantity,
        cartId: cart.id,
        productId: data.productId,
      },
    });
  }

  async getCart(userId: number) {
    return this.prisma.cart.findUnique({
      where: {
        userId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async updateQuantity(
    id: number,
    quantity: number,
  ) {
    const item =
      await this.prisma.cartItem.findUnique({
        where: {
          id,
        },
      });

    if (!item) {
      throw new BadRequestException(
        'Item não encontrado',
      );
    }

    return this.prisma.cartItem.update({
      where: {
        id,
      },
      data: {
        quantity,
      },
    });
  }

  async removeItem(id: number) {
    const item =
      await this.prisma.cartItem.findUnique({
        where: {
          id,
        },
      });

    if (!item) {
      throw new BadRequestException(
        'Item não encontrado',
      );
    }

    return this.prisma.cartItem.delete({
      where: {
        id,
      },
    });
  }

  async clearCart(userId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: {
        userId,
      },
    });

    if (!cart) {
      throw new BadRequestException(
        'Carrinho não encontrado',
      );
    }

    await this.prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return this.prisma.cart.delete({
      where: {
        id: cart.id,
      },
    });
  }
}