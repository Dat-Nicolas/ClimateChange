import { Module } from '@nestjs/common';
import { AirConditionersService } from './air-conditioners.service';
import { AirConditionersController } from './air-conditioners.controller';
import { RoomsModule } from '../rooms/rooms.module';

@Module({
  imports: [RoomsModule],
  providers: [AirConditionersService],
  controllers: [AirConditionersController],
  exports: [AirConditionersService],
})
export class AirConditionersModule {}