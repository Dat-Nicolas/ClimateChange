import { Module } from '@nestjs/common';
import { AcGateway } from './ac.gateway';
import { AirConditionersModule } from '../../air-conditioners/air-conditioners.module';

@Module({
  imports: [AirConditionersModule],
  providers: [AcGateway],
  exports: [AcGateway],
})
export class AcModule {}
