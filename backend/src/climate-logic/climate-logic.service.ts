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

    // Logic: 
    // 1. If no people -> Turn OFF
    // 2. If people & hot -> Turn ON to defaultTemp
    // 3. If people & cold -> Turn OFF
    
    if (currentPeople === 0) {
      targetStatus = ACStatus.OFF;
    } else {
      if (currentTemperature > maxTemp) {
        targetStatus = ACStatus.ON;
        targetTemp = defaultTemp;
      } else if (currentTemperature < minTemp) {
        targetStatus = ACStatus.OFF;
      }
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
