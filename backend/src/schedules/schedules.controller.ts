import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { SchedulesService } from './schedules.service';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  findAll(@Request() req) {
    return this.schedulesService.findAll(req.user.userId, req.user.role);
  }

  @Post()
  create(@Request() req, @Body() data: any) {
    return this.schedulesService.create(req.user.userId, data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req, @Body() data: any) {
    return this.schedulesService.update(id, req.user.userId, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.schedulesService.remove(id, req.user.userId);
  }
}
