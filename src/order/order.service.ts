import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async createOrder(userId: number) {
    const cart =
      await this.prisma.cart.findUnique({
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

    if (
      !cart ||
      cart.items.length === 0
    ) {
      throw new BadRequestException(
        'Carrinho vazio',
      );
    }

    const total = cart.items.reduce(
      (sum, item) =>
        sum +
        item.quantity *
          item.product.price,
      0,
    );

    const order =
      await this.prisma.order.create({
        data: {
          userId,
          total,
          items: {
            create:
              cart.items.map(
                (item) => ({
                  productId:
                    item.productId,
                  quantity:
                    item.quantity,
                  price:
                    item.product
                      .price,
                }),
              ),
          },
        },
        include: {
          items: true,
        },
      });

    await this.prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    await this.prisma.cart.delete({
      where: {
        id: cart.id,
      },
    });

    return order;
  }

  async getAllOrders() {
    return this.prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async getOrder(id: number) {
    return this.prisma.order.findUnique({
      where: {
        id,
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

  async updateStatus(
    id: number,
    status: string,
  ) {
    return this.prisma.order.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }

  async deleteOrder(id: number) {
    await this.prisma.orderItem.deleteMany({
      where: {
        orderId: id,
      },
    });

    return this.prisma.order.delete({
      where: {
        id,
      },
    });
  }
}