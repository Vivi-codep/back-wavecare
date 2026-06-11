import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
  ) { }

  async createOrder(userId: number) {
    const cart =
      await this.prisma.cart.findUnique({
        where: { userId },
        include: {
          items: { include: { product: true } },
        },
      });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Carrinho vazio');
    }
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new BadRequestException(
          `Estoque insuficiente para ${item.product.name}`,
        );
      }
    }

    const total = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0,
    );

    const order = await this.prisma.order.create({
      data: {
        userId,
        total,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
      },
    });
    for (const item of cart.items) {
      await this.prisma.product.update({
        where: {
          id: item.productId,
        },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    await this.prisma.cart.delete({ where: { id: cart.id } });

    return order;
  }

  async createDirectOrder(
    userId: number,
    productId: number,
    quantity: number,
  ) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new BadRequestException('Produto não encontrado');
    }

    return this.prisma.order.create({
      data: {
        userId,
        total: product.price * quantity,
        items: {
          create: [{ productId, quantity, price: product.price }],
        },
      },
      include: {
        items: { include: { product: true } },
      },
    });
  }

  async getAllOrders() {
    return this.prisma.order.findMany({
      include: {
        items: { include: { product: true } },
      },
    });
  }

  async getOrder(id: number, user: any) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
      },
    });

    if (!order) {
      throw new BadRequestException('Pedido não encontrado');
    }

    if (user.role !== 'admin' && order.userId !== user.id) {
      throw new ForbiddenException('Você não pode ver esse pedido');
    }

    return order;
  }

  async updateStatus(id: number, status: string) {
    return this.prisma.order.update({
      where: { id },
      data: { status },
    });
  }

  async deleteOrder(id: number) {
    await this.prisma.orderItem.deleteMany({ where: { orderId: id } });
    return this.prisma.order.delete({ where: { id } });
  }

  // ↓ NOVO
  async getUserOrders(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}