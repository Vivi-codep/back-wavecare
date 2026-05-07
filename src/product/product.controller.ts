import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { ProductService } from './product.service';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}

  //  CRIAR PRODUTO (ADMIN)
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  create(@Body() body: CreateProductDto) {
    return this.productService.create(body);
  }

  //  LISTAR PRODUTOS (PÚBLICO)
  @Get()
  findAll() {
    return this.productService.findAll();
  }

  //  BUSCAR PRODUTO POR ID (PÚBLICO)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  //  ATUALIZAR PRODUTO (ADMIN)
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductDto,
  ) {
    return this.productService.update(id, body);
  }

  //  DELETAR PRODUTO (ADMIN)
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }
}