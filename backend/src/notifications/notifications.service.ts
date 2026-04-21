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

  // 🌟 NEW: Broadcast to all attendees instantly!
  async broadcastToAttendees(title: string, message: string, type: string) {
    // 1. Fetch all User IDs where the role is 'Attendee'
    const attendees = await this.notificationsRepo.query(
      `SELECT id FROM user WHERE role = 'Attendee'`
    );

    if (!attendees || attendees.length === 0) {
      return { message: 'No attendees found to notify.' };
    }

    // 2. Map them into an array of notification objects
    const notificationsToInsert = attendees.map(attendee => ({
      userId: attendee.id,
      title: title,
      message: message,
      type: type,
      isRead: false
    }));

    // 3. BULK INSERT: This runs a SINGLE lightning-fast query into the database instead of thousands!
    await this.notificationsRepo
      .createQueryBuilder()
      .insert()
      .into(Notification)
      .values(notificationsToInsert)
      .execute();

    return { message: `Successfully broadcasted to ${attendees.length} attendees!` };
  }
}