// quiz.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // ajuste o caminho
import { QuizDto } from './dto/quiz.dto';

@Injectable()
export class QuizService {
  constructor(private readonly prisma: PrismaService) {}

  async getResult(data: QuizDto, userId?: number) {
    // ── pontuação (igual ao que sua dev fez) ──────────────────────────
    let hydration = 0;
    let reconstruction = 0;
    let nutrition = 0;
    let maintenance = 0;

    switch (data.city) {
      case 'caraguatatuba':
      case 'sao-sebastiao':
      case 'ilhabela':
      case 'ubatuba':
        hydration += 1;
        break;
    }
    switch (data.hairType) {
      case 'liso':       maintenance  += 1; break;
      case 'ondulado':   nutrition    += 1; break;
      case 'cacheado':   hydration    += 2; break;
      case 'crespo':     hydration    += 3; break;
    }
    switch (data.beachFrequency) {
      case 'todo-dia':      hydration += 3; break;
      case 'fim-semana':    hydration += 2; break;
      case 'algumas-vezes': hydration += 1; break;
    }
    switch (data.sunProtection) {
      case 'nunca':    hydration += 2; break;
      case 'as-vezes': hydration += 1; break;
    }
    switch (data.wetHair) {
      case 'sempre':  hydration += 2; break;
      case 'as-vezes': hydration += 1; break;
      case 'piscina': hydration += 1; break;
    }
    switch (data.hairState) {
      case 'ressecado':  hydration     += 4; break;
      case 'quebradico': reconstruction += 4; break;
      case 'opaco':      nutrition      += 4; break;
      case 'saudavel':   maintenance    += 4; break;
    }
    switch (data.chemicalProcess) {
      case 'coloracao':    reconstruction += 3; break;
      case 'alisamento':   reconstruction += 2; break;
      case 'texturizacao': nutrition      += 1; break;
      case 'natural':      maintenance    += 1; break;
    }

    const scores = { hydration, reconstruction, nutrition, maintenance };
    const diagnosis = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];

    const recommendedKits = {
      hydration:      { verao: 'Summer Essential Kit',        outono: 'Autumn Essential Care Kit',  inverno: 'Winter Hydration Essential Kit', primavera: 'Spring Essential Kit'    },
      reconstruction: { verao: 'Summer Full Protection',      outono: 'Autumn Full Nutrition',       inverno: 'Winter Deep Care Kit',           primavera: 'Spring Full Bloom'       },
      nutrition:      { verao: 'Summer Total Protection',     outono: 'Autumn Total Nutrition',      inverno: 'Winter Ultimate Care Kit',       primavera: 'Spring Total Bloom'      },
      maintenance:    { verao: 'Summer Definition Duo',       outono: 'Autumn Definition Duo',       inverno: 'Winter Curl Definition Duo',     primavera: 'Spring Definition Duo'   },
    };

    const recommendedKit =
      recommendedKits[diagnosis as keyof typeof recommendedKits][
        data.season as 'verao' | 'outono' | 'inverno' | 'primavera'
      ];

    // ── salva no banco ────────────────────────────────────────────────
    await this.prisma.quizResult.create({
      data: {
        userId:         userId ?? null,
        city:           data.city,
        hairType:       data.hairType,
        beachFrequency: data.beachFrequency,
        sunProtection:  data.sunProtection,
        wetHair:        data.wetHair,
        hairState:      data.hairState,
        chemicalProcess: data.chemicalProcess,
        season:         data.season,
        diagnosis,
        recommendedKit,
        scores,
      },
    });

    return { diagnosis, scores, season: data.season, recommendedKit };
  }
}