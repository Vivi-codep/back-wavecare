import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizDto } from './dto/quiz.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  getResult(@Body() data: QuizDto, @Req() req: any) {
    const userId: number | undefined = req.user?.id ?? req.user?.sub;
    return this.quizService.getResult(data, userId);
  }
}