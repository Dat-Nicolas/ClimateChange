import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('activity-logs')
@UseGuards(JwtAuthGuard)
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get()
  findAll(@Query('roomId') roomId: string, @Request() req) {
    return this.activityLogService.findAll(roomId, req.user.userId, req.user.role);
  }
}
