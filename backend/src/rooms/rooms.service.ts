import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  IRButtonSendResult,
} from './dto/ir-button-response.dto';
import { AcGateway } from 'src/mqtt/ac/ac.gateway';
import { SendIRButtonDto } from './dto/send-ir-button.dto';
import { ButtonACCommand } from 'src/mqtt/ac/dto/ac-control.dto';
import { UpdateRoomSettingsDto } from './dto/update-room-settings.dto';
import { AirConditionersService } from 'src/air-conditioners/air-conditioners.service';
import { getTemperatureName } from 'src/utils';

@Injectable()
export class RoomsService {
  constructor(
    private prisma: PrismaService,
    private airConditionersService: AirConditionersService,
    private acGateway: AcGateway,
  ) {}

  async validateRoomAccess(roomId: string, userId: string, role: string) {
    if (role === 'ADMIN') return true;

    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.userId !== userId) {
      throw new ForbiddenException('You do not have access to this room');
    }

    return true;
  }

  async findAll() {
    return this.prisma.room.findMany({
      include: { airConditioners: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.room.findUnique({
      where: { id },
      include: {
        airConditioners: { include: { brand: true } },
        schedules: true,
      },
    });
  }

  async create(data: any, userId: string) {
    const room = await this.prisma.room.create({
      data: {
        ...data,
        userId,
      },
    });

    return room;
  }

  async update(id: string, data: any, userId: string, role: string) {
    await this.validateRoomAccess(id, userId, role);
    const room = await this.prisma.room.update({
      where: { id },
      data,
    });

    return room;
  }

  async remove(id: string, userId: string, role: string) {
    await this.validateRoomAccess(id, userId, role);
    const room = await this.prisma.room.delete({
      where: { id },
    });

    return room;
  }

  async getSettings(roomId: string, userId: string, role: string) {
    return this.prisma.room.findUnique({
      where: { id: roomId },
      select: {
        id: true,
        name: true,
        minPeopleToTurnOn: true,
        minTempToTurnOn: true,
        acAutoControlEnabled: true,
        autoMode: true,
        startTime: true,
        endTime: true,
      },
    });
  }

  async updateSettings(roomId: string, data: UpdateRoomSettingsDto) {
    return this.prisma.room.update({
      where: {
        id: roomId,
      },

      data: {
        minPeopleToTurnOn: data.minPeopleToTurnOn,

        minTempToTurnOn: data.minTempToTurnOn,

        autoMode: data.autoMode,

        // ==========================
        // UPDATE ACS
        // ==========================

        airConditioners: {
          set: (data.airConditionerIds ?? []).map((id: string) => ({
            id,
          })),
        },
      },

      include: {
        airConditioners: true,
      },
    });
  }
  async sendIRButton(roomId: string, dto: SendIRButtonDto) {
    // await this.validateRoomAccess(roomId, userId, role);

    // Lấy danh sách điều hòa trong phòng
    const whereCondition: any = { roomId };
    if (dto.airConditionerId) {
      whereCondition.id = dto.airConditionerId;
    }

    const ac = await this.airConditionersService.findByRoomId(roomId);

    const results: IRButtonSendResult[] = [];

    // for (const ac of acs) {
    // Tìm mã IR
    const acTemp = ac?.currentTemp;
    const btnCode = getTemperatureName(acTemp!);
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        airConditioners: { include: { brand: true } },
        schedules: true,
      },
    });

    const selectedIrButton = ac!.brand.irButtons.find(
      (btn) => btn.buttonName === dto.buttonName,
    );

    if (!selectedIrButton) {
      throw new Error(`IR button not found for ${dto.buttonName}`);
    }

    const command: ButtonACCommand = {
      buttonName: dto.buttonName,
      irCode: selectedIrButton.irCode,
      brand: ac!.brand.name,
      irName: selectedIrButton.irName,
    };

    // ====================== GỬI MQTT ======================
    this.acGateway.emitCommand(roomId, command);

    results.push({
      acId: ac!.id,
      acName: ac!.name,
      buttonName: dto.buttonName,
      irCode: selectedIrButton.irCode,
      sent: true,
    });
    return {
      message: 'IR command sent via MQTT',
      buttonName: dto.buttonName,
      results,
    };
  }
}
