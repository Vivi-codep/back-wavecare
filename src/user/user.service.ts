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

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        telefone: true,
        cidade: true,
      },
    });
  }

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
      },
    });
  }

  async remove(id: number) {
    const user = await this.prisma.user.delete({
      where: { id },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      telefone: user.telefone,
      cidade: user.cidade,
    };
  }

  // 🔥 AGORA NO LUGAR CERTO
  async deleteFoto(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

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
      },
    });
  }

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
      },
      access_token,
    };
  }
}