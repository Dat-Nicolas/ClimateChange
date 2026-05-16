import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import {
  IRButtonSendResult,
  SendIRButtonResponse,
} from './dto/ir-button-response.dto';
import { AcGateway } from 'src/mqtt/ac/ac.gateway';
import { SendIRButtonDto } from './dto/send-ir-button.dto';
import { ButtonACCommand } from 'src/mqtt/ac/dto/ac-control.dto';
import { UpdateRoomSettingsDto } from './dto/update-room-settings.dto';

@Injectable()
export class RoomsService {
  constructor(
    private prisma: PrismaService,
    private activityLog: ActivityLogService,
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

    await this.activityLog.log(room.id, userId, 'CREATE_ROOM', room);
    return room;
  }

  async update(id: string, data: any, userId: string, role: string) {
    await this.validateRoomAccess(id, userId, role);
    const room = await this.prisma.room.update({
      where: { id },
      data,
    });

    await this.activityLog.log(id, userId, 'UPDATE_ROOM', data);
    return room;
  }

  async remove(id: string, userId: string, role: string) {
    await this.validateRoomAccess(id, userId, role);
    const room = await this.prisma.room.delete({
      where: { id },
    });

    await this.activityLog.log(id, userId, 'DELETE_ROOM', { name: room.name });
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

  async updateSettings(
  roomId: string,
  data: UpdateRoomSettingsDto,
) {
  return this.prisma.room.update({
    where: {
      id: roomId,
    },

    data: {
      minPeopleToTurnOn:
        data.minPeopleToTurnOn,

      minTempToTurnOn:
        data.minTempToTurnOn,

      autoMode:
        data.autoMode,

      // ==========================
      // UPDATE ACS
      // ==========================

      airConditioners: {
        set: (data.airConditionerIds ?? []).map(
          (id: string) => ({
            id,
          }),
        ),
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

    const acs = await this.prisma.airConditioner.findMany({
      where: whereCondition,
      include: { brand: true },
    });

    if (acs.length === 0) {
      throw new NotFoundException('No air conditioner found in this room');
    }

    const results: IRButtonSendResult[] = [];

    for (const ac of acs) {
      // Tìm mã IR
      const irButton = await this.prisma.iRButton.findUnique({
        where: {
          brandId_buttonName: {
            brandId: ac.brandId,
            buttonName: dto.buttonName,
          },
        },
      });

      if (!irButton) {
        results.push({
          acId: ac.id,
          acName: ac.name,
          buttonName: dto.buttonName,
          sent: false,
          message: `Button ${dto.buttonName} not found for brand`,
        });
        continue;
      }

      // ====================== GỬI MQTT ======================
      const command: ButtonACCommand = {
        buttonName: dto.buttonName,
        irCode: irButton.irCode,
        irName: irButton.irName,
        brand: ac.brand.name,
      };

      this.acGateway.emitCommand(roomId, command);

      results.push({
        acId: ac.id,
        acName: ac.name,
        buttonName: dto.buttonName,
        irCode: irButton.irCode,
        sent: true,
      });
    }

    // // Log activity
    // await this.activityLog.log(roomId, userId, 'SEND_IR_BUTTON', {
    //   buttonName: buttonNameUpper,
    //   targetAc: dto.airConditionerId || 'all',
    //   count: results.length,
    // });

    return {
      message: 'IR command sent via MQTT',
      buttonName: dto.buttonName,
      results,
    };
  }
}
