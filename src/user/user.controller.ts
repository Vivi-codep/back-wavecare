import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('register')
create(
  @Body() body: { name: string; email: string; password: string },
) {
  return this.userService.create(body);
}

@Post('login')
login(
  @Body() body: { email: string; password: string },
) {
  return this.userService.login(body);
}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; email?: string },
  ) {
    return this.userService.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(Number(id));
  }
}