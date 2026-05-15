import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ButtonCode } from 'src/enums/btn-code.enum';

export class SendIRButtonDto {
  @ApiProperty({
    description: 'Tên nút IR cần gửi (ví dụ: POWER_ON, TEMP_25)',
    example: 'TEMP_26',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  buttonName!: ButtonCode;

  @ApiProperty({
    description: 'ID của điều hòa cụ thể (nếu chỉ muốn gửi cho 1 điều hòa). Nếu không truyền sẽ gửi cho tất cả điều hòa trong phòng.',
    example: 'ac_123456',
    required: false,
  })
  @IsOptional()
  @IsString()
  airConditionerId?: string;
}