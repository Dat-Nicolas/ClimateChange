import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Injectable()
export class RoomsService {
  constructor(
    private prisma: PrismaService,
    private activityLog: ActivityLogService,
  ) {}

  async validateRoomAccess(roomId: string, userId: string, role: string) {
    if (role === 'ADMIN') return true;

    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.userId !== userId) {
      throw new ForbiddenException('You do not have access to this room');
    }

    return true;
  }

  async findAll(userId: string, role: string) {
    if (role === 'ADMIN') {
      return this.prisma.room.findMany({
        include: { airConditioners: true },
      });
    }

    return this.prisma.room.findMany({
      where: { userId },
      include: { airConditioners: true },
    });
  }

  async findOne(id: string, userId: string, role: string) {
    await this.validateRoomAccess(id, userId, role);
    return this.prisma.room.findUnique({
      where: { id },
      include: { 
        airConditioners: { include: { brand: true } },
        schedules: true,
      },
    });
  }

  async create(data: any, userId: string) {
    const room = await this.prisma.room.create({
      data: {
        ...data,
        userId,
      },
    });

    await this.activityLog.log(room.id, userId, 'CREATE_ROOM', room);
    return room;
  }

  async update(id: string, data: any, userId: string, role: string) {
    await this.validateRoomAccess(id, userId, role);
    const room = await this.prisma.room.update({
      where: { id },
      data,
    });

    await this.activityLog.log(id, userId, 'UPDATE_ROOM', data);
    return room;
  }

  async remove(id: string, userId: string, role: string) {
    await this.validateRoomAccess(id, userId, role);
    const room = await this.prisma.room.delete({
      where: { id },
    });

    await this.activityLog.log(id, userId, 'DELETE_ROOM', { name: room.name });
    return room;
  }
}
