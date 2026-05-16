import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { RoomsModule } from './rooms/rooms.module';
import { AirConditionersModule } from './air-conditioners/air-conditioners.module';
import { AiModule } from './ai/ai.module';
import { BrandsModule } from './brands/brands.module';
import { SchedulesModule } from './schedules/schedules.module';
import { AcModule } from './mqtt/ac/ac.module';
import { IrButtonsModule } from './ir-buttons/ir-buttons.module';
import { WeatherModule } from './weather/weather.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    ActivityLogModule,
    RoomsModule,
    AirConditionersModule,
    AiModule,
    BrandsModule,
    SchedulesModule,
    AcModule,
    IrButtonsModule,
    WeatherModule
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
