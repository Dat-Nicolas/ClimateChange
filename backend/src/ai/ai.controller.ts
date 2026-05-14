import {

  Body,
  Controller,
  Post

} from '@nestjs/common';

import { AiService } from './ai.service';
import { AcGateway } from 'src/mqtt/ac/ac.gateway';


@Controller('ai')

export class AiController {

  constructor(

    private readonly aiService: AiService,

    private readonly acGateway: AcGateway,
  ) {}

  @Post('detect')

  async detect(

    @Body()

    body: {

      roomId: string;

      count: number;
    },
  ) {

    const {

      roomId,

      count,

    } = body;

    // ============================
    // SAVE AI DATA
    // ============================

    const result =

      await this.aiService.detectPeople(

        roomId,

        { count }
      );

    // ============================
    // AUTO COMMAND
    // ============================

    const command =

      count > 0

        ? {

            status: 'ON',

            temperature: 24,
          }

        : {

            status: 'OFF',

            temperature: 28,
          };

    // ============================
    // MQTT EMIT
    // ============================

    this.acGateway.emitCommand(

      roomId,

      command
    );

    // ============================
    // RESPONSE
    // ============================

    return {

      success: true,

      result,

      command,
    };
  }
}