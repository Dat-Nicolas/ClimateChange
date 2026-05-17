import { ApiProperty } from '@nestjs/swagger';
import { ACMode, ACStatus } from '@prisma/client';

/**
 * Note: Đây là DTO response để Swagger mô tả đúng body trả về từ Prisma.
 * Không dùng cho request payload.
 */

export class RoomBriefResponseDto {
  @ApiProperty({ example: 'ac_room_id_uuid' })
  id!: string;

  @ApiProperty({ example: 'Phòng A' })
  name!: string;

  @ApiProperty({ example: 'Tầng 2' })
  location!: string;
}

export class IRButtonBriefResponseDto {
  @ApiProperty({ example: 'ir_button_id_uuid' })
  id!: string;

  @ApiProperty({ example: 'POWER_ON' })
  buttonName!: string;

  @ApiProperty({ example: '0x1234567890ABCDEF' })
  irCode!: string;

  @ApiProperty({ example: 'Bật nguồn' })
  irName!: string;
}

export class BrandBriefResponseDto {
  @ApiProperty({ example: 'brand_id_uuid' })
  id!: string;

  @ApiProperty({ example: 'DaVinci' })
  name!: string;

  @ApiProperty({ type: IRButtonBriefResponseDto, isArray: true })
  irButtons!: IRButtonBriefResponseDto[];
}

export class AirConditionerResponseDto {
  @ApiProperty({ example: 'ac_id_uuid' })
  id!: string;

  @ApiProperty({ example: 'brand_id_uuid' })
  brandId!: string;

  @ApiProperty({ example: 'room_id_uuid' })
  roomId!: string;

  @ApiProperty({ enum: ACStatus, example: 'OFF' })
  status!: ACStatus;

  @ApiProperty({ example: 26 })
  currentTemp!: number;

  @ApiProperty({ enum: ACMode, example: 'COOL' })
  mode!: ACMode;

  @ApiProperty({ example: 'Điều hòa Phòng A' })
  name!: string;

  @ApiProperty({ type: BrandBriefResponseDto })
  brand!: BrandBriefResponseDto;

  @ApiProperty({ type: RoomBriefResponseDto })
  room!: RoomBriefResponseDto;

  @ApiProperty({ example: '2026-05-16T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-05-16T10:00:00.000Z' })
  updatedAt!: Date;
}
