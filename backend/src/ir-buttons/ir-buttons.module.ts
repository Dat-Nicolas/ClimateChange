import { Module } from '@nestjs/common';
import { IrButtonsService } from './ir-buttons.service';
import { IrButtonsController } from './ir-buttons.controller';
import { RoomsModule } from 'src/rooms/rooms.module';

@Module({
  imports: [RoomsModule],
  controllers: [IrButtonsController],
  providers: [IrButtonsService],
})
export class IrButtonsModule {}
