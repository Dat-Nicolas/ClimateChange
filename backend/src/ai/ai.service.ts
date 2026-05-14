import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Injectable()
export class AiService {
  constructor(
    private prisma: PrismaService,
    private activityLog: ActivityLogService,
  ) {}

  async detectPeople(roomId: string, data: { count?: number; image?: string }) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const count: number =
      typeof data.count === 'number'
        ? data.count
        : Math.floor(Math.random() * 10);

    await this.prisma.room.update({
      where: { id: roomId },
      data: { currentPeople: count },
    });

    const log = await this.prisma.sensorLog.create({
      data: {
        roomId,
        peopleCount: count,
        temperature: room.currentTemperature,
      },
    });

    await this.activityLog.log(roomId, null, 'AI_DETECTION', {
      detectedCount: count,
      sensorLogId: log.id,
    });

    return {
      success: true,
      roomId,
      count,
      timestamp: log.timestamp,
    };
  }
}
