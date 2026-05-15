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
  async findAll(userId: string, role: string) {
    this.logger.log(`🔍 Find schedules | userId=${userId} | role=${role}`);

    const normalizedRole = (role || '').toUpperCase();

    // ================= ADMIN =================
    if (normalizedRole === 'ADMIN') {
      const data = await this.prisma.schedule.findMany({
        include: { room: true },
        orderBy: { createdAt: 'desc' },
      });

      this.logger.log(`✅ ADMIN fetched ${data.length} schedules`);
      return data;
    }

    // ================= USER =================
    // 1. Lấy tất cả room thuộc user
    const rooms = await this.prisma.room.findMany({
      where: { userId },
      select: { id: true },
    });

    const roomIds = rooms.map((r) => r.id);

    this.logger.log(`🏠 Rooms of user: ${JSON.stringify(roomIds)}`);

    if (roomIds.length === 0) {
      this.logger.warn('❌ User has no rooms');
      return [];
    }

    // 2. Query schedule theo roomIds
    const data = await this.prisma.schedule.findMany({
      where: {
        roomId: {
          in: roomIds,
        },
      },
      include: {
        room: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    this.logger.log(`✅ Found ${data.length} schedules`);

    // debug nếu vẫn rỗng
    if (data.length === 0) {
      await this.debugCheck(userId, roomIds);
    }

    return data;
  }

  // =========================
  // CREATE
  // =========================
  async create(userId: string, data: any) {
    const room = await this.prisma.room.findUnique({
      where: { id: data.roomId },
    });

    if (!room) {
      throw new NotFoundException('Phòng không tồn tại');
    }

    if (room.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền quản lý phòng này');
    }

    return this.prisma.schedule.create({
      data: {
        roomId: data.roomId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        isActive: data.isActive ?? true,
      },
      include: { room: true },
    });
  }

  // =========================
  // UPDATE
  // =========================
  async update(id: string, userId: string, data: any) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: { room: true },
    });

    if (!schedule) {
      throw new NotFoundException('Lịch trình không tồn tại');
    }

    if (schedule.room.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền sửa');
    }

    return this.prisma.schedule.update({
      where: { id },
      data,
      include: { room: true },
    });
  }

  // =========================
  // DELETE
  // =========================
  async remove(id: string, userId: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: { room: true },
    });

    if (!schedule) {
      throw new NotFoundException('Lịch trình không tồn tại');
    }

    if (schedule.room.userId !== userId) {
      throw new ForbiddenException('Không có quyền xóa');
    }

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
    this.logger.warn(`Sample schedule roomIds: ${JSON.stringify(someSchedules)}`);
    this.logger.warn('================================================');
  }
}