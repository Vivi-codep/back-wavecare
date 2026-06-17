import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from '@prisma/client';



@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  // 🛒 CART ORDER
  async createOrder(userId: number, paymentMethod: PaymentMethod) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Carrinho vazio');
    }

    const total = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0,
    );

    const order = await this.prisma.order.create({
      data: {
        userId,
        total,
        status: OrderStatus.pending,
        paymentStatus: PaymentStatus.pending, // ✅ SEM LÓGICA DE PAGAMENTO AQUI
        paymentMethod,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    await this.prisma.cart.delete({
      where: { id: cart.id },
    });

    return order;
  }

  // 🧾 DIRECT ORDER
  async createDirectOrder(
    userId: number,
    productId: number,
    quantity: number,
    paymentMethod: PaymentMethod,
  ) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) throw new BadRequestException('Produto não encontrado');
    if (product.stock < quantity)
      throw new BadRequestException('Estoque insuficiente');

    return this.prisma.order.create({
      data: {
        userId,
        total: product.price * quantity,
        status: OrderStatus.pending,
        paymentStatus: PaymentStatus.pending, // ✅ SEMPRE PENDING
        paymentMethod,
        items: {
          create: [
            {
              productId,
              quantity,
              price: product.price,
            },
          ],
        },
      },
      include: { items: { include: { product: true } } },
    });
  }

  // 💳 CONFIRM PAYMENT (ÚNICO LUGAR QUE PAGA)
  async confirmPayment(id: number, paymentMethod?: PaymentMethod) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });

    if (!order) throw new BadRequestException('Pedido não encontrado');
    if (order.paymentStatus === PaymentStatus.paid) {
      throw new BadRequestException('Pedido já pago');
    }

    for (const item of order.items) {
      if (item.product.stock < item.quantity) {
        throw new BadRequestException('Estoque insuficiente');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return tx.order.update({
        where: { id },
        data: {
          status: OrderStatus.confirmed,
          paymentStatus: PaymentStatus.paid,
          ...(paymentMethod ? { paymentMethod } : {}), // ← salva o método se veio
        },
        include: { items: { include: { product: true } } }, // ← retorna items populados
      });
    });
  }

  getAllOrders() {
    return this.prisma.order.findMany({
      include: {
        items: { include: { product: true } },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }


  async getOrder(id: number, user: any) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });

    if (!order) throw new BadRequestException('Pedido não encontrado');

    if (user.role !== 'admin' && order.userId !== user.id) {
      throw new ForbiddenException('Sem acesso');
    }

    return order;
  }

updateStatus(id: number, status: string) {
  const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'canceled'];
  if (!validStatuses.includes(status)) {
    throw new BadRequestException('Status inválido');
  }
  return this.prisma.order.update({
    where: { id },
    data: { status: status as OrderStatus },
    include: {
      items: { include: { product: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

  async deleteOrder(id: number) {
  await this.prisma.orderItem.deleteMany({
    where: { orderId: id },
  });
  return this.prisma.order.delete({
    where: { id },
  });
}

  getUserOrders(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}