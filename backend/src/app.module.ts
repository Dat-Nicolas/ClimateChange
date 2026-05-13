import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { RoomsModule } from './rooms/rooms.module';
import { AirConditionersModule } from './air-conditioners/air-conditioners.module';

@Module({
  imports: [AuthModule, PrismaModule, ActivityLogModule, RoomsModule, AirConditionersModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
