import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class UpdateRoomSettingsDto {
  @ApiPropertyOptional({ description: 'Số người tối thiểu để bật điều hòa' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minPeopleToTurnOn?: number;

  @ApiPropertyOptional({
    description: 'Nhiệt độ phòng tối thiểu để tự động bật AC (°C)',
  })
  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(40)
  minTempToTurnOn?: number;

  @ApiPropertyOptional({
    description: 'Cho phép hệ thống tự động điều khiển AC',
  })
  @IsOptional()
  @IsBoolean()
  acAutoControlEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Bật chế độ tự động' })
  @IsOptional()
  @IsBoolean()
  autoMode?: boolean;

  @ApiPropertyOptional({ description: 'ID của điều hòa' })
  @IsOptional()
  airConditionerIds?: string[];
}
