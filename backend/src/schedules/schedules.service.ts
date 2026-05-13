import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchedulesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, role: string) {
    if (role === 'ADMIN') {
      return this.prisma.schedule.findMany({
        include: { room: true },
      });
    }
    return this.prisma.schedule.findMany({
      where: {
        room: { userId },
      },
      include: { room: true },
    });
  }

  async create(userId: string, data: any) {
    // Validate Room ownership
    const room = await this.prisma.room.findUnique({
      where: { id: data.roomId },
    });

    if (!room) throw new NotFoundException('Room not found');
    if (room.userId !== userId) throw new ForbiddenException('You do not own this room');

    return this.prisma.schedule.create({
      data: {
        roomId: data.roomId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        isActive: data.isActive ?? true,
      },
    });
  }

  async update(id: string, userId: string, data: any) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: { room: true },
    });

    if (!schedule) throw new NotFoundException('Schedule not found');
    if (schedule.room.userId !== userId) throw new ForbiddenException('Access denied');

    return this.prisma.schedule.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, userId: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: { room: true },
    });

    if (!schedule) throw new NotFoundException('Schedule not found');
    if (schedule.room.userId !== userId) throw new ForbiddenException('Access denied');

    return this.prisma.schedule.delete({
      where: { id },
    });
  }
}
