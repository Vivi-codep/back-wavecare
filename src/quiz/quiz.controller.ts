import { Body, Controller, Post } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizDto } from './dto/quiz.dto';

@Controller('quiz')
export class QuizController {
  constructor(
    private readonly quizService: QuizService,
  ) {}

  @Post()
  getResult(
    @Body() data: QuizDto,
  ) {
    return this.quizService.getResult(data);
  }
}