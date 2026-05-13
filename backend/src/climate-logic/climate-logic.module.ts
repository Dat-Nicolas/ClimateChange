import { Module, Global } from '@nestjs/common';
import { ClimateLogicService } from './climate-logic.service';

@Global()
@Module({
  providers: [ClimateLogicService],
  exports: [ClimateLogicService],
})
export class ClimateLogicModule {}
