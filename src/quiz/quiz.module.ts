import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { PrismaService } from '../prisma/prisma.service'; // ← ajuste se o caminho for diferente

@Module({
  controllers: [QuizController],
  providers: [QuizService, PrismaService], // ← adiciona aqui
})
export class QuizModule {}