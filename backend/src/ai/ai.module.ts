import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AcModule } from '../mqtt/ac/ac.module';
import { RoomsModule } from 'src/rooms/rooms.module';
import { AirConditionersModule } from 'src/air-conditioners/air-conditioners.module';

@Module({
  imports: [AcModule, RoomsModule, AirConditionersModule],
  providers: [AiService],
  controllers: [AiController],
  exports: [AiService],
})
export class AiModule {}
