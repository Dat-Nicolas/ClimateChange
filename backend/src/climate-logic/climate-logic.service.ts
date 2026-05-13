import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ACStatus } from '@prisma/client';

@Injectable()
export class ClimateLogicService {
  constructor(private prisma: PrismaService) {}

  async processAutomation(roomId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: { airConditioners: true },
    });

    if (!room || !room.autoMode) return;

    const { currentTemperature, currentPeople, maxTemp, minTemp, defaultTemp } = room;

    let targetStatus: ACStatus | null = null;
    let targetTemp: number = defaultTemp;

    // New logic:
    // - If no people -> Turn OFF
    // - If at least 1 person -> Turn ON to defaultTemp

    if (currentPeople === 0) {
      targetStatus = ACStatus.OFF;
    } else {
      targetStatus = ACStatus.ON;
      targetTemp = defaultTemp;
    }

    // Update all ACs in the room if logic applies
    if (targetStatus !== null) {
      for (const ac of room.airConditioners) {
        if (ac.status !== targetStatus || (targetStatus === ACStatus.ON && ac.currentTemp !== targetTemp)) {
          await this.prisma.airConditioner.update({
            where: { id: ac.id },
            data: {
              status: targetStatus,
              currentTemp: targetTemp,
            },
          });
        }
      }
    }
  }
}
