import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepo: Repository<Notification>,
  ) {}

  // Automatically fired when an admin approves/rejects an event
  async createNotification(userId: number, title: string, message: string, type: string) {
    const notification = this.notificationsRepo.create({ userId, title, message, type });
    return await this.notificationsRepo.save(notification);
  }

  // Fetches unread notifications for the bell icon
  async getUserNotifications(userId: number) {
    return await this.notificationsRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' }, // Newest first
    });
  }

  // Marks them as read when the user clicks the bell
  async markAsRead(id: number) {
    return await this.notificationsRepo.update(id, { isRead: true });
  }
}