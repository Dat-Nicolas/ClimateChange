import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ButtonCode } from 'src/enums/btn-code.enum';

export class CreateIRButtonDto {
  @ApiProperty({ example: 'daVinci123' })
  @IsString()
  @IsNotEmpty()
  brandId!: string;

  @ApiProperty({ example: 'POWER_ON' })
  @IsString()
  @IsNotEmpty()
  buttonName!: ButtonCode;

  @ApiProperty({ example: '0x1234567890ABCDEF' })
  @IsString()
  @IsNotEmpty()
  irCode!: string;

  @ApiProperty({ example: 'COOLIX' })
  @IsString()
  @IsNotEmpty()
  irName!: string;

  @ApiPropertyOptional({ example: 'Nút bật điều hòa' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateIRButtonDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  irCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  irName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(ButtonCode)
  buttonName?: ButtonCode;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
