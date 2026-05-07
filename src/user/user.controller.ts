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
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UseGuards } from '@nestjs/common';
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

  // LISTAR USUÁRIOS
@UseGuards(JwtAuthGuard, AdminGuard)
@Get()
findAll() {
  return this.userService.findAll();
}
  // ATUALIZAR USUÁRIO
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserDto,
  ) {
    return this.userService.update(id, body);
  }

  // DELETAR USUÁRIO
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }

  // 🔥 ALTERAR FOTO
  @Put('upload/:id')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: './uploads',
    }),
  )
  uploadFoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo não enviado');
    }

    return this.userService.update(id, {
      foto: `/uploads/${file.filename}`,
    });
  }

  // DELETAR FOTO
  @Delete('foto/:id')
  deleteFoto(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteFoto(id);
  }
}