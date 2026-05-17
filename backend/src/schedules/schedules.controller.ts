import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service';
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  findAll() {
    return this.schedulesService.findAll();
  }

  @Post()
  create(@Body() data: any) {
    return this.schedulesService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.schedulesService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schedulesService.remove(id);
  }
}

