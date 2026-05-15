import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoomsService } from '../rooms/rooms.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import {
  CreateIRButtonDto,
  UpdateIRButtonDto,
} from '../ir-buttons/dto/create-ir-button.dto';
import { ButtonCode } from 'src/enums/btn-code.enum';

@Injectable()
export class AirConditionersService {
  constructor(
    private prisma: PrismaService,
    private roomsService: RoomsService,
    private activityLog: ActivityLogService,
  ) {}

  async findByRoomId(roomId: string) {
  return this.prisma.airConditioner.findFirst({
    where: {
      roomId,
    },
    include: {
      brand: {
        include: {
          irButtons: true,
        },
      },
      room: true,
    },
  });
}
  // ====================== VALIDATION ======================
  private async validateAcAccess(acId: string, userId: string, role: string) {
    const ac = await this.prisma.airConditioner.findUnique({
      where: { id: acId },
      include: { room: true, brand: true },
    });

    if (!ac) throw new NotFoundException('Air conditioner not found');

    await this.roomsService.validateRoomAccess(ac.roomId, userId, role);
    return ac;
  }

  // ====================== AC CRUD ======================
  async findAll() {
    return this.prisma.airConditioner.findMany({
      include: {
        brand: true,
        room: { select: { id: true, name: true, location: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const ac = await this.prisma.airConditioner.findUnique({
      where: { id },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            irButtons: {
              select: {
                id: true,
                buttonName: true,
                irCode: true,
                irName: true,
              },
            },
          },
        },
        room: { select: { id: true, name: true, location: true } },
      },
    });

    if (!ac) throw new NotFoundException('Air conditioner not found');

    return ac;
  }

  async create(data: any, userId: string, role: string) {
    await this.roomsService.validateRoomAccess(data.roomId, userId, role);

    const ac = await this.prisma.airConditioner.create({
      data: {
        name: data.name,
        brandId: data.brandId,
        roomId: data.roomId,
        status: data.status || 'OFF',
        currentTemp: data.currentTemp || 26,
        mode: data.mode || 'COOL',
      },
      include: { brand: true, room: true },
    });

    await this.activityLog.log(data.roomId, userId, 'CREATE_AC', {
      acName: ac.name,
    });
    return ac;
  }

  async update(id: string, data: any, ) {
    const updated = await this.prisma.airConditioner.update({
      where: { id },
      data,
      include: { brand: true, room: true },
    });

    return updated;
  }

  async remove(id: string, userId: string, role: string) {
    const ac = await this.validateAcAccess(id, userId, role);

    await this.prisma.airConditioner.delete({ where: { id } });

    await this.activityLog.log(ac.roomId, userId, 'DELETE_AC', {
      acName: ac.name,
    });
    return { message: 'Air conditioner deleted successfully' };
  }
}
