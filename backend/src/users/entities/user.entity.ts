import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn} from 'typeorm';

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

  @Column({ default: false })
  isArchived: boolean;

  @Column({ type: 'timestamp', nullable: true })
  archivedAt: Date; 

  @CreateDateColumn()
  createdAt: Date;

  // 🌟 NEW: Add Username
  @Column({ nullable: true, unique: true })
  username: string;

  // 🌟 NEW: Add Avatar URL (Set type to 'text' to handle long Base64 image strings!)
  @Column({ type: 'text', nullable: true })
  avatarUrl: string;
  
}