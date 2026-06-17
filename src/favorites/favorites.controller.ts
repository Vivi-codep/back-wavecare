import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getMyFavorites(@Req() req: Request) {
    const user = req.user as any;
    return this.favoritesService.getUserFavorites(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':productId')
  addFavorite(@Req() req: Request, @Param('productId') productId: string) {
    const user = req.user as any;
    return this.favoritesService.addFavorite(user.id, Number(productId));
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':productId')
  removeFavorite(@Req() req: Request, @Param('productId') productId: string) {
    const user = req.user as any;
    return this.favoritesService.removeFavorite(user.id, Number(productId));
  }

  @UseGuards(JwtAuthGuard)
  @Get(':productId/check')
  checkFavorite(@Req() req: Request, @Param('productId') productId: string) {
    const user = req.user as any;
    return this.favoritesService.isFavorite(user.id, Number(productId));
  }
}