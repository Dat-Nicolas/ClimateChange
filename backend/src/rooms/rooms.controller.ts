import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { UpdateRoomSettingsDto } from './dto/update-room-settings.dto';
import { SendIRButtonDto } from './dto/send-ir-button.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Rooms')
@ApiBearerAuth()
@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  // ====================== BASIC CRUD ======================
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả phòng' })
  findAll(@Request() req) {
    return this.roomsService.findAll(req.user.userId, req.user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết phòng' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.roomsService.findOne(id);
  }

  // ====================== SETTINGS ======================
  @Get(':id/settings')
  @ApiOperation({ summary: 'Lấy cài đặt của phòng' })
  getSettings(@Param('id') id: string, @Request() req) {
    return this.roomsService.getSettings(id, req.user?.userId, req.user?.role);
  }

  @Patch(':id/settings')
  @ApiOperation({ summary: 'Cập nhật cài đặt phòng' })
  updateSettings(
    @Param('id') id: string,
    @Body() updateRoomSettingsDto: UpdateRoomSettingsDto,
    @Request() req,
  ) {
    return this.roomsService.updateSettings(
      id,
      updateRoomSettingsDto,
      req.user?.userId,
      req.user?.role,
    );
  }

  // ====================== SEND IR BUTTON (MỚI) ======================
  @Post(':id/ac/send-button')
  @ApiOperation({
    summary: 'Gửi lệnh điều khiển bằng nút IR cụ thể',
    description: 'Ví dụ: POWER_ON, TEMP_25, MODE_COOL, FAN_SPEED_HIGH, ...',
  })
  @ApiBody({
    schema: {
      example: {
        buttonName: 'TEMP_26',
      },
    },
  })
  sendIRButton(
    @Param('id') roomId: string,
    @Body() dto: SendIRButtonDto,
    @Request() req,
  ) {
    return this.roomsService.sendIRButton(roomId, dto);
  }

  // ====================== CRUD ======================
  @Post()
  create(@Body() data: any, @Request() req) {
    return this.roomsService.create(data, req.user?.userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.roomsService.update(id, data, req.user?.userId, req.user?.role);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.roomsService.remove(id, req.user?.userId, req.user?.role);
  }
}
