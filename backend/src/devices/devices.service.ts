import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { ClimateLogicService } from '../climate-logic/climate-logic.service';

@Injectable()
export class DevicesService {
  constructor(
    private prisma: PrismaService,
    private activityLog: ActivityLogService,
    private climateLogic: ClimateLogicService,
  ) {}

  async updateStatus(data: { roomId: string; temperature: number; peopleCount?: number }) {
    const { roomId, temperature, peopleCount } = data;

    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Update room data
    await this.prisma.room.update({
      where: { id: roomId },
      data: {
        currentTemperature: temperature,
        currentPeople: peopleCount !== undefined ? peopleCount : room.currentPeople,
      },
    });

    // Create sensor log
    await this.prisma.sensorLog.create({
      data: {
        roomId,
        temperature,
        peopleCount: peopleCount !== undefined ? peopleCount : room.currentPeople,
      },
    });

    // Process automation logic
    await this.climateLogic.processAutomation(roomId);

    return { success: true, message: 'Status updated' };
  }

  async getCommands(roomId: string) {
    const acs = await this.prisma.airConditioner.findMany({
      where: { roomId },
      include: { brand: true },
    });

    // Generate IR commands for all ACs in the room
    const commands = acs.map(ac => ({
      acId: ac.id,
      acName: ac.name,
      status: ac.status,
      temperature: ac.currentTemp,
      mode: ac.mode,
      irCommand: {
        protocol: ac.brand.irProtocol,
        payload: {
          ...((ac.brand.irConfig as any) || {}),
          status: ac.status,
          temp: ac.currentTemp,
          mode: ac.mode,
        },
      },
    }));

    return {
      roomId,
      timestamp: new Date(),
      commands,
    };
  }
}
