import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  // The ID of the Organizer who should receive this alert
  @Column()
  userId: number;

  @Column()
  title: string;

  @Column()
  message: string;

  // Types can be: 'APPROVAL', 'TICKET', or 'SYSTEM'
  @Column({ default: 'SYSTEM' })
  type: string;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}