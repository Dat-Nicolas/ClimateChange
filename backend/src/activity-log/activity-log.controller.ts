import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';

@Controller('activity-logs')
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  // ✅ Lấy danh sách (KHÔNG cần userId)
  @Get()
  findAll(@Query('roomId') roomId?: string) {
    return this.activityLogService.findAll(roomId);
  }

  // ✅ Lấy chi tiết theo id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activityLogService.findOne(id);
  }
}