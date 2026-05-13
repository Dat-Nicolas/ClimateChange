import { Module } from '@nestjs/common';
import { AirConditionersService } from './air-conditioners.service';
import { AirConditionersController } from './air-conditioners.controller';

@Module({
  providers: [AirConditionersService],
  controllers: [AirConditionersController]
})
export class AirConditionersModule {}
