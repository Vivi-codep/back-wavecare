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

  // 🔹 BUSCAR UM USUÁRIO
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

  // 🔹 DELETAR PRÓPRIA CONTA (usuário comum)
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
  }

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

  // 🔹 PERFIL DO USUÁRIO (COM QUIZ)
  async getMyProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        telefone: true,
        cidade: true,
        foto: true,
        role: true,
        quizResults: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            hairType: true,
            hairState: true,
            beachFrequency: true,
            season: true,
            diagnosis: true,
            recommendedKit: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) throw new BadRequestException('Usuário não encontrado');

    const quiz = user.quizResults[0] ?? null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      telefone: user.telefone,
      cidade: user.cidade,
      foto: user.foto,
      role: user.role,
      capilar: quiz
        ? {
            tipo: quiz.hairType,
            preocupacao: quiz.hairState,
            frequenciaPreia: quiz.beachFrequency,
            estacaoCritica: quiz.season,
            diagnosis: quiz.diagnosis,
            recommendedKit: quiz.recommendedKit,
            updatedAt: quiz.createdAt,
          }
        : null,
    };
  }

  // 🔹 DELETAR USUÁRIO COMO ADMIN
  async removeByAdmin(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    if (user.role === 'admin') {
      throw new BadRequestException('Não é possível deletar um administrador');
    }

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

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'Usuário excluído com sucesso' };
  }
}