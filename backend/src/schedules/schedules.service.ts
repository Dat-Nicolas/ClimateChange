import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchedulesService {
  private readonly logger = new Logger(SchedulesService.name);

  constructor(private prisma: PrismaService) {}

  // =========================
  // GET ALL SCHEDULES
  // =========================
  async findAll() {
  return this.prisma.schedule.findMany({
    include: { room: true },
    orderBy: { createdAt: 'desc' },
  });
}
  // =========================
  // CREATE
  // =========================
  async create(data: any) {
    const room = await this.prisma.room.findUnique({
      where: { id: data.roomId },
    });

    if (!room) throw new NotFoundException('Room not found');

    // Prisma model Schedule yêu cầu daysOfWeek: DayOfWeek[]
    const daysOfWeek = Array.isArray(data.daysOfWeek) ? data.daysOfWeek : [];

    // scheduleDate là String bắt buộc
    const scheduleDate =
      typeof data.scheduleDate === 'string' && data.scheduleDate.trim().length > 0
        ? data.scheduleDate
        : new Date().toISOString().slice(0, 10);

    return this.prisma.schedule.create({
      data: {
        roomId: data.roomId,
        scheduleDate,
        daysOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        isActive: data.isActive ?? true,
      },
      include: { room: true },
    });
  }

  async update(id: string, data: any) {
  return this.prisma.schedule.update({
    where: { id },
    data,
    include: { room: true },
  });
}
  // =========================
  // DELETE
  // =========================
  async remove(id: string) {
  return this.prisma.schedule.delete({
    where: { id },
  });
}

  // =========================
  // DEBUG
  // =========================
  private async debugCheck(userId: string, roomIds: string[]) {
    const roomsOfUser = await this.prisma.room.findMany({
      where: { userId },
      select: { id: true, name: true },
    });

    const someSchedules = await this.prisma.schedule.findMany({
      take: 5,
      select: { roomId: true },
    });

    this.logger.warn('================ DEBUG SCHEDULE ================');
    this.logger.warn(`UserId: ${userId}`);
    this.logger.warn(`User rooms: ${JSON.stringify(roomsOfUser)}`);
    this.logger.warn(`RoomIds used: ${JSON.stringify(roomIds)}`);
    this.logger.warn(
      `Sample schedule roomIds: ${JSON.stringify(someSchedules)}`,
    );
    this.logger.warn('================================================');
  }
}
