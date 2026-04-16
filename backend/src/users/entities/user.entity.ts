import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number; // 🌟 FIX: Added '!' to all properties

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  name!: string;

  @Column({ default: 'Attendee' })
  role!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'varchar', nullable: true })
  resetOtp!: string | null;

  @Column({ type: 'datetime', nullable: true })
  resetOtpExpires!: Date | null;

  @Column({ default: false })
  isArchived!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  archivedAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // 🌟 FIX: Explicitly tell TypeORM this is a varchar (string)
  @Column({ type: 'varchar', nullable: true, unique: true })
  username!: string | null;

  @Column({ type: 'text', nullable: true })
  avatarUrl!: string | null;

  // Preferences
  @Column({ default: true })
  eventReminders!: boolean;

  @Column({ default: true })
  bookingUpdates!: boolean;

  @Column({ default: false })
  marketingEmails!: boolean;

  @Column({ default: false })
  darkMode!: boolean;

  // Email change OTP flow
  // 🌟 FIX: Explicitly tell TypeORM this is a varchar
  @Column({ type: 'varchar', nullable: true, unique: true })
  pendingEmail!: string | null;

  @Column({ type: 'varchar', nullable: true })
  pendingEmailOtp!: string | null;

  @Column({ type: 'datetime', nullable: true })
  pendingEmailOtpExpires!: Date | null;
}