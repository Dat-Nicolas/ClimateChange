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
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

import { AirConditionersService } from './air-conditioners.service';

import { AirConditionerResponseDto } from './dto/air-conditioner-response.dto';

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
  @ApiOkResponse({ type: AirConditionerResponseDto, isArray: true })
  findAll(@Request() req) {
    return this.acService.findAll();
  }

  @Post()
  @ApiOperation({
    summary: 'Tạo điều hòa',
  })
  @ApiCreatedResponse({ type: AirConditionerResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @ApiNotFoundResponse({ description: 'Room not found' })
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
  @ApiOkResponse({ type: AirConditionerResponseDto })
  @ApiNotFoundResponse({ description: 'Air conditioner not found' })
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
  @ApiOkResponse({ type: AirConditionerResponseDto })
  @ApiNotFoundResponse({ description: 'Air conditioner not found' })
  update(
    @Param('id') id: string,
    @Body() data: any,
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
  @ApiOkResponse({
    description: 'Successful deletion',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Air conditioner deleted successfully' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Air conditioner not found' })
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
