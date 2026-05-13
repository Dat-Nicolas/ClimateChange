import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityLogService {
  constructor(private prisma: PrismaService) {}

  async log(roomId: string, userId: string | null, action: string, details?: any) {
    return this.prisma.activityLog.create({
      data: {
        roomId,
        userId,
        action,
        details: details || {},
      },
    });
  }

  async findAll(roomId: string | undefined, userId: string, role: string) {
    const where: any = {};
    
    if (roomId) {
      where.roomId = roomId;
    }

    // If not ADMIN, only show logs for rooms the user owns
    if (role !== 'ADMIN') {
      where.room = { userId };
    }

    return this.prisma.activityLog.findMany({
      where,
      include: {
        room: true,
        user: {
          select: { fullName: true, email: true },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
  }
}
