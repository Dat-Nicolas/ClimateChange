import { Controller, Get, Post, Body, Patch, Param, Delete, Query , Request } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
findAll(@Request() req) {
  const userId = req?.user?.userId;
  const role = req?.user?.role;

  return this.schedulesService.findAll(userId, role);
}

@Post()
create(@Request() req, @Body() data: any) {
  const userId = req?.user?.userId;
  return this.schedulesService.create(userId, data);
}

@Patch(':id')
update(@Param('id') id: string, @Request() req, @Body() data: any) {
  const userId = req?.user?.userId;
  return this.schedulesService.update(id, userId, data);
}

@Delete(':id')
remove(@Param('id') id: string, @Request() req) {
  const userId = req?.user?.userId;
  return this.schedulesService.remove(id, userId);
}
}