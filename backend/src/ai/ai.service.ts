import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { ClimateLogicService } from '../climate-logic/climate-logic.service';

@Injectable()
export class AiService {
  constructor(
    private prisma: PrismaService,
    private activityLog: ActivityLogService,
    private climateLogic: ClimateLogicService,
  ) {}

  async detectPeople(roomId: string, data: { count?: number; image?: string }) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // In a real scenario, you'd process an image here.
    // For now, we take the count from the request or simulate it.
    const count: number =
      typeof data.count === 'number'
        ? data.count
        : Math.floor(Math.random() * 10);

    // Update room occupancy
    await this.prisma.room.update({
      where: { id: roomId },
      data: { currentPeople: count },
    });

    // Create sensor log
    const log = await this.prisma.sensorLog.create({
      data: {
        roomId,
        peopleCount: count,
        temperature: room.currentTemperature,
      },
    });

    // Log the AI activity
    await this.activityLog.log(roomId, null, 'AI_DETECTION', {
      detectedCount: count,
      sensorLogId: log.id,
    });

    // Process automation logic
    await this.climateLogic.processAutomation(roomId);

    return {
      success: true,
      roomId,
      count,
      timestamp: log.timestamp,
    };
  }
}
