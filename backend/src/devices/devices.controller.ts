import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { DevicesService } from './devices.service';

@Controller('device')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post('status')
  async updateStatus(@Body() body: { roomId: string; temperature: number; peopleCount?: number }) {
    return this.devicesService.updateStatus(body);
  }

  @Get('command/:roomId')
  async getCommands(@Param('roomId') roomId: string) {
    return this.devicesService.getCommands(roomId);
  }
}
