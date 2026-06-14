import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';

import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  // CADASTRO
  @Post('register')
  create(@Body() body: CreateUserDto) {
    return this.userService.create(body);
  }

  // LOGIN
  @Post('login')
  login(@Body() body: LoginUserDto) {
    return this.userService.login(body);
  }

  // LISTAR USUÁRIOS (SÓ ADMIN)
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  // BUSCAR PRÓPRIO USUÁRIO
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as any;
    if (user.id !== id) {
      throw new ForbiddenException('Acesso negado');
    }
    return this.userService.findOne(id);
  }

  // ATUALIZAR PRÓPRIO USUÁRIO
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Body() body: UpdateUserDto,
  ) {
    const user = req.user as any;
    if (user.id !== id) {
      throw new ForbiddenException('Você não pode editar outra conta');
    }
    return this.userService.update(id, body);
  }

  // DELETAR PRÓPRIO USUÁRIO
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as any;
    if (user.id !== id) {
      throw new ForbiddenException('Você não pode deletar outra conta');
    }
    return this.userService.remove(id);
  }

  // ALTERAR PRÓPRIA FOTO
  @UseGuards(JwtAuthGuard)
  @Put('upload/:id')
  @UseInterceptors(FileInterceptor('file', { dest: './uploads' }))
  uploadFoto(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user = req.user as any;
    if (user.id !== id) {
      throw new ForbiddenException('Você não pode alterar a foto de outra conta');
    }
    if (!file) {
      throw new BadRequestException('Arquivo não enviado');
    }
    return this.userService.update(id, { foto: `/uploads/${file.filename}` });
  }

  // DELETAR PRÓPRIA FOTO
  @UseGuards(JwtAuthGuard)
  @Delete('foto/:id')
  deleteFoto(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as any;
    if (user.id !== id) {
      throw new ForbiddenException('Você não pode deletar a foto de outra conta');
    }
    return this.userService.deleteFoto(id);
  }

  //Quiz
  @UseGuards(JwtAuthGuard)
  @Get('me/profile')
  getMyProfile(@Req() req: Request) {
    const user = req.user as any;
    return this.userService.getMyProfile(user.id);
  }
}