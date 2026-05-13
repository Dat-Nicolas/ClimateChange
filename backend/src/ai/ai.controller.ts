import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('detect')
  async detect(
    @Body() body: { roomId: string; count?: number; image?: string },
  ) {
    return this.aiService.detectPeople(body.roomId, body);
  }
}
