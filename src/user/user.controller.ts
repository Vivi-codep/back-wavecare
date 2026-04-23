import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('register')
  create(@Body() body: CreateUserDto) {
    return this.userService.create(body);
  }

  @Post('login')
  login(@Body() body: LoginUserDto) {
    return this.userService.login(body);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserDto,
  ) {
    return this.userService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}