import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoomsService } from '../rooms/rooms.service';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Injectable()
export class AirConditionersService {
  constructor(
    private prisma: PrismaService,
    private roomsService: RoomsService,
    private activityLog: ActivityLogService,
  ) {}

  async control(acId: string, commandData: any, userId: string, role: string) {
    const ac = await this.prisma.airConditioner.findUnique({
      where: { id: acId },
      include: { brand: true, room: true },
    });

    if (!ac) {
      throw new NotFoundException('Air conditioner not found');
    }

    // Check access to the room where the AC is located
    await this.roomsService.validateRoomAccess(ac.roomId, userId, role);

    // Update AC state in database
    const updatedAc = await this.prisma.airConditioner.update({
      where: { id: acId },
      data: {
        status: commandData.status || ac.status,
        currentTemp: commandData.temperature || ac.currentTemp,
        mode: commandData.mode || ac.mode,
      },
    });

    // Generate IR Command for ESP32
    const irCommand = {
      protocol: ac.brand.irProtocol,
      payload: {
        ...((ac.brand.irConfig as any) || {}),
        status: updatedAc.status,
        temp: updatedAc.currentTemp,
        mode: updatedAc.mode,
      },
    };

    // Log activity
    await this.activityLog.log(ac.roomId, userId, 'CONTROL_AC', {
      acName: ac.name,
      command: commandData,
      irCommand,
    });

    return {
      message: 'Command sent successfully',
      ac: updatedAc,
      irCommand, // Crucial for IoT device
    };
  }

  async create(data: any, userId: string, role: string) {
    await this.roomsService.validateRoomAccess(data.roomId, userId, role);
    
    const ac = await this.prisma.airConditioner.create({
      data,
    });

    await this.activityLog.log(ac.roomId, userId, 'CREATE_AC', ac);
    return ac;
  }

  async update(id: string, data: any, userId: string, role: string) {
    const ac = await this.prisma.airConditioner.findUnique({
      where: { id },
    });

    if (!ac) throw new NotFoundException('AC not found');

    await this.roomsService.validateRoomAccess(ac.roomId, userId, role);

    const updatedAc = await this.prisma.airConditioner.update({
      where: { id },
      data,
    });

    await this.activityLog.log(ac.roomId, userId, 'UPDATE_AC', data);
    return updatedAc;
  }

  async remove(id: string, userId: string, role: string) {
    const ac = await this.prisma.airConditioner.findUnique({
      where: { id },
    });

    if (!ac) throw new NotFoundException('AC not found');

    await this.roomsService.validateRoomAccess(ac.roomId, userId, role);

    await this.prisma.airConditioner.delete({
      where: { id },
    });

    await this.activityLog.log(ac.roomId, userId, 'DELETE_AC', { name: ac.name });
    return { message: 'AC deleted' };
  }
}
