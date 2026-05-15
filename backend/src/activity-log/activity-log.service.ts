import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityLogService {
  constructor(private prisma: PrismaService) {}

  // ✅ Log (giữ nguyên)
  async log(
    roomId: string,
    userId: string | null,
    action: string,
    details?: any,
  ) {
    return this.prisma.activityLog.create({
      data: {
        roomId,
        userId,
        action,
        details: details || {},
      },
    });
  }

  // ✅ Lấy tất cả log (KHÔNG filter user nữa)
  async findAll(roomId?: string) {
    const where: any = {};

    if (roomId) {
      where.roomId = roomId;
    }

    return this.prisma.activityLog.findMany({
      where,
      include: {
        room: true,
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
  }

  // ✅ Lấy chi tiết log theo id
  async findOne(id: string) {
    const log = await this.prisma.activityLog.findUnique({
      where: { id },
      include: {
        room: true,
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!log) {
      throw new NotFoundException('Activity log not found');
    }

    return log;
  }
}