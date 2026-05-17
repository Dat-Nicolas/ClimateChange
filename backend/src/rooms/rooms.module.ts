import { forwardRef, Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { AcModule } from 'src/mqtt/ac/ac.module';
import { AirConditionersModule } from 'src/air-conditioners/air-conditioners.module';
import { ActivityLogService } from 'src/activity-log/activity-log.service';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';

@Module({
  imports: [forwardRef(() => AirConditionersModule), AcModule],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}
