import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoomsService } from '../rooms/rooms.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { ButtonCode } from 'src/enums/btn-code.enum';
import { getTemperatureName } from 'src/utils';
import { ButtonACCommand } from 'src/mqtt/ac/dto/ac-control.dto';

@Injectable()
export class AirConditionersService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => RoomsService))
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

  async update(id: string, data: any) {
    const ac = await this.prisma.airConditioner.findUnique({
      where: { id },
      include: { room: true },
    });

    if (!ac) throw new NotFoundException('Air conditioner not found');

    const updated = await this.prisma.airConditioner.update({
      where: { id },
      data: {
        ...(data.temperature !== undefined && {
          currentTemp: data.temperature,
        }),
        ...(data.status && { status: data.status }),
        ...(data.mode && { mode: data.mode }),
      },
      include: { brand: true, room: true },
    });

    // send mqtt command if status or temperature changed
    if (data.status || data.temperature !== undefined) {
      const btnCode = getTemperatureName(updated.currentTemp);
      const targetButton = data.status === 'ON' ? btnCode : ButtonCode.POWER_OFF;
      // const selectedIrButton = updated.brand.irButtons.find(
      //   (btn) => btn.buttonName === targetButton,
      // );
      // if (selectedIrButton) {
        // const command: ButtonACCommand = {
        //   buttonName: targetButton,
        //   irCode: selectedIrButton.irCode,
        //   brand: updated.brand.name,
        //   irName: selectedIrButton.irName,
        // };
        
        this.roomsService.sendIRButton(updated.roomId, {
          buttonName: targetButton,
          airConditionerId: updated.id,
        });
      // }
    }


    return updated;
  }

  async remove(id: string, userId: string, role: string) {
    const ac = await this.prisma.airConditioner.findUnique({
      where: { id },
      include: { room: true },
    });

    if (!ac) throw new NotFoundException('Air conditioner not found');

    await this.prisma.airConditioner.delete({ where: { id } });
    return { message: 'Air conditioner deleted successfully' };
  }
}
