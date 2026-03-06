import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true }) // Emails must be unique
  email: string;

  @Column()
  password: string; // We will store this Encrypted (Hashed)

  @Column()
  name: string;

  @Column({ default: 'Attendee' }) // Default role
  role: string; // 'Admin', 'Organizer', 'Attendee', 'Staff'

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'varchar', nullable: true })
  resetOtp: string | null;

  @Column({ type: 'datetime', nullable: true })
  resetOtpExpires: Date | null;
}