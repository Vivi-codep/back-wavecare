import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  //  CRIAR PRODUTO
  create(data: CreateProductDto) {
    return this.prisma.product.create({
      data,
    });
  }

  //  LISTAR PRODUTOS
  findAll() {
    return this.prisma.product.findMany();
  }

  //  BUSCAR PRODUTO POR ID
  findOne(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  //  ATUALIZAR PRODUTO
  update(id: number, data: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  //  DELETAR PRODUTO
  async remove(id: number) {
  const product = await this.prisma.product.delete({
    where: { id },
  });

  return {
    message: 'Produto deletado com sucesso',
    product,
  };
}
}