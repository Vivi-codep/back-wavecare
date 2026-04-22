import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
async create(data: { 
  name: string; 
  email: string; 
  password: string;
  telefone?: string;
  cidade?: string;
}) {
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
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new BadRequestException('Email já cadastrado');
    }

    throw new BadRequestException('Erro ao cadastrar usuário');
  }
}
  findAll() {
    return this.prisma.user.findMany();
  }

 update(id: number, data: {
  name?: string;
  email?: string;
  telefone?: string;
  cidade?: string;
}) {
  return this.prisma.user.update({
    where: { id },
    data,
  });
}

  remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
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

  return {
    message: 'Login realizado com sucesso',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
}
}