import { Controller, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AirConditionersService } from './air-conditioners.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('air-conditioners')
@UseGuards(JwtAuthGuard)
export class AirConditionersController {
  constructor(private readonly acService: AirConditionersService) {}

  @Post(':id/control')
  control(@Param('id') id: string, @Body() commandData: any, @Request() req) {
    return this.acService.control(id, commandData, req.user.userId, req.user.role);
  }

  @Post()
  create(@Body() data: any, @Request() req) {
    return this.acService.create(data, req.user.userId, req.user.role);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.acService.update(id, data, req.user.userId, req.user.role);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.acService.remove(id, req.user.userId, req.user.role);
  }
}
