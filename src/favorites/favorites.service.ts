import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async getUserFavorites(userId: number) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
    return favorites.map((f) => f.product);
  }

  async addFavorite(userId: number, productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new BadRequestException('Produto não encontrado');

    // evita erro de duplicado se já existir
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) return existing;

    return this.prisma.favorite.create({
      data: { userId, productId },
    });
  }

  async removeFavorite(userId: number, productId: number) {
    await this.prisma.favorite.deleteMany({
      where: { userId, productId },
    });
    return { success: true };
  }

  async isFavorite(userId: number, productId: number) {
    const fav = await this.prisma.favorite.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    return !!fav;
  }
}