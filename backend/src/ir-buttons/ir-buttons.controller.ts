import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { IrButtonsService } from './ir-buttons.service';
import { ApiOperation } from '@nestjs/swagger';
import { CreateIRButtonDto, UpdateIRButtonDto } from './dto/create-ir-button.dto';

@Controller('ir-buttons')
export class IrButtonsController {
  constructor(private readonly irButtonsService: IrButtonsService) {}

  // =========================================================
    // IR BUTTONS
    // =========================================================
  
    @Post('')
    @ApiOperation({ summary: 'Tạo nút IR mới' })
    createIRButton(
      @Body() dto: CreateIRButtonDto,
    ) {
      return this.irButtonsService.createIRButton(dto);
    }
  
    @Get('')
    @ApiOperation({ summary: 'Lấy tất cả IR buttons' })
    getAllIRButtons() {
      return this.irButtonsService.getAllIRButtons();
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết IR button' })
    getIRButton(
      @Param('id') id: string,
    ) {
      return this.irButtonsService.getIRButton(
        id,
      );
    }
  
    @Patch(':id')
    @ApiOperation({ summary: 'Cập nhật IR button' })
    updateIRButton(
      @Param('id') id: string,
      @Body() dto: UpdateIRButtonDto,
    ) {
  
      console.log(">>>>>>")
      return this.irButtonsService.updateIRButton(id, dto);
    }
  
    @Delete(':id')
    @ApiOperation({ summary: 'Xóa IR button' })
    deleteIRButton(
      @Param('id') id: string,
    ) {
      return this.irButtonsService.deleteIRButton(
        id,
      );
    }
  
    @Get('brands/:brandId/ir-buttons')
    @ApiOperation({
      summary: 'Lấy danh sách IR buttons theo hãng',
    })
    getIRButtonsByBrand(
      @Param('brandId') brandId: string,
    ) {
      return this.irButtonsService.getIRButtonsByBrand(
        brandId,
      );
    }
  
}
