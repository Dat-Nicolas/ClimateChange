import { Body, Controller, Post } from '@nestjs/common';

import { AiService } from './ai.service';
import { AcGateway } from 'src/mqtt/ac/ac.gateway';
import { ButtonACCommand } from 'src/mqtt/ac/dto/ac-control.dto';
import { ButtonCode } from 'src/enums/btn-code.enum';
import { AirConditionersService } from 'src/air-conditioners/air-conditioners.service';
import { RoomsService } from 'src/rooms/rooms.service';
import { getTemperatureName } from 'src/utils';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly airConditionersService: AirConditionersService,
    private readonly roomsService: RoomsService,
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
    const { roomId, count } = body;

    const ac = await this.airConditionersService.findByRoomId(roomId);

    // ============================
    // SAVE AI DATA
    // ============================

    const result = await this.aiService.detectPeople(
      roomId,
      { count },
    );

    // ============================
    // AUTO COMMAND
    // ============================
    const acTemp = ac?.currentTemp;
    const btnCode = getTemperatureName(acTemp!);
    const room = await this.roomsService.findOne(roomId);
    const targetButton =
      count > room?.minPeopleToTurnOn! || count > 5
        ? btnCode
        : ButtonCode.POWER_OFF;
    const selectedIrButton = ac!.brand.irButtons.find(
      (btn) => btn.buttonName === targetButton,
    );

    if (!selectedIrButton) {
      throw new Error(`IR button not found for ${targetButton}`);
    }

    const command: ButtonACCommand = {
      buttonName: targetButton,
      irCode: selectedIrButton.irCode,
      brand: ac!.brand.name,
      irName: selectedIrButton.irName,
    };

    // ============================
    // MQTT EMIT
    // ============================

    this.acGateway.emitCommand(roomId, command);

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
