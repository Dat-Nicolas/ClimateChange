import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { AirConditionersService } from './air-conditioners.service';

import {
  CreateIRButtonDto,
  UpdateIRButtonDto,
} from '../ir-buttons/dto/create-ir-button.dto';

@ApiTags('Air Conditioners')
@ApiBearerAuth()
@Controller('air-conditioners')
export class AirConditionersController {
  constructor(
    private readonly acService: AirConditionersService,
  ) {}

  
  // =========================================================
  // AIR CONDITIONERS
  // =========================================================

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách điều hòa',
  })
  findAll(@Request() req) {
    return this.acService.findAll();
  }

  @Post()
  @ApiOperation({
    summary: 'Tạo điều hòa',
  })
  create(
    @Body() data: any,
    @Request() req,
  ) {
    return this.acService.create(
      data,
      req.user.userId,
      req.user.role,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết điều hòa',
  })
  findOne(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.acService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật điều hòa',
  })
  update(
    @Param('id') id: string,
    @Body() data: any,
    @Request() req,
  ) {
    return this.acService.update(
      id,
      data,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa điều hòa',
  })
  remove(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.acService.remove(
      id,
      req.user.userId,
      req.user.role,
    );
  }

  // =========================================================
  // AC CONTROL
  // =========================================================

  // @Patch(':id/power')
  // controlPower(
  //   @Param('id') acId: string,
  //   @Body() dto: RoomPowerDto,
  //   @Request() req,
  // ) {
  //   return this.acService.controlPower(
  //     acId,
  //     dto.isOn,
  //     req.user.userId,
  //     req.user.role,
  //   );
  // }

  // @Patch(':id/temperature')
  // controlTemperature(
  //   @Param('id') acId: string,
  //   @Body() dto: RoomTempControlDto,
  //   @Request() req,
  // ) {
  //   return this.acService.controlTemperature(
  //     acId,
  //     dto,
  //     req.user.userId,
  //     req.user.role,
  //   );
  // }
}