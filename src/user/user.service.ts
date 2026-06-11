import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  // 🔹 CADASTRO
  async create(data: CreateUserDto) {
    if (!data.name || !data.email || !data.password) {
      throw new BadRequestException('Dados inválidos');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    try {
      return await this.prisma.user.create({
        data: {
          ...data,
          password: hashedPassword,
        },
        select: {
          id: true,
          name: true,
          email: true,
          telefone: true,
          cidade: true,
          foto: true,
          role: true,
        },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('Email já cadastrado');
      }

      throw new BadRequestException('Erro ao cadastrar usuário');
    }
  }

  // 🔹 LISTAR USUÁRIOS
  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        telefone: true,
        cidade: true,
        foto: true,
        role: true,
      },
    });
  }

    async findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        telefone: true,
        cidade: true,
        foto: true,
        role: true,
      },
    });
  }

  // 🔹 ATUALIZAR USUÁRIO
  async update(id: number, data: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        telefone: true,
        cidade: true,
        foto: true,
        role: true,
      },
    });
  }

async remove(id: number) {
  await this.prisma.cartItem.deleteMany({
    where: { cart: { userId: id } },
  });
  await this.prisma.cart.deleteMany({
    where: { userId: id },
  });
  await this.prisma.orderItem.deleteMany({
    where: { order: { userId: id } },
  });
  await this.prisma.order.deleteMany({
    where: { userId: id },
  });
  await this.prisma.quizResult.deleteMany({
    where: { userId: id },
  });

  const user = await this.prisma.user.delete({
    where: { id },
  });

  return user;
};

  // 🔹 DELETAR FOTO
  async deleteFoto(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    const refs = await this.prisma.$queryRaw`
    SELECT TABLE_NAME, CONSTRAINT_NAME 
    FROM information_schema.KEY_COLUMN_USAGE 
    WHERE COLUMN_NAME = 'userId' 
    AND REFERENCED_TABLE_NAME = 'user'
    AND TABLE_SCHEMA = DATABASE()
  `;
  console.log('TABELAS COM userId:', JSON.stringify(refs));

    if (!user || !user.foto) {
      throw new BadRequestException('Usuário não tem foto');
    }

    const filePath = path.join(
      __dirname,
      '..',
      '..',
      user.foto,
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        foto: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        foto: true,
        role: true,
      },
    });
  }

  // 🔹 LOGIN
  async login(data: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const passwordMatch = await bcrypt.compare(
      data.password,
      user.password,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const access_token = this.authService.generateToken(user);

    return {
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        foto: user.foto,
        role: user.role,
      },
      access_token,
    };
  }
}