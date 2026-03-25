import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Notification } from './entities/notification.entity';

@Module({
  // 🌟 CRITICAL: This tells TypeORM to create the table!
  imports: [TypeOrmModule.forFeature([Notification])], 
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}