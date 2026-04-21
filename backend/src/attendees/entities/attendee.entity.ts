import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Attendee {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column({ nullable: true })
    company: string;

    @Column()
    eventId: string;

    @Column({ default: 'Pending' })
    status: string;

    @Column()
    ticketId: string;

    @Column({ default: '0' })
    amountPaid: string;

    // 🌟 FIX 1: Added Check-in timestamp
    @Column({ type: 'timestamp', nullable: true })
    checkedInAt: Date | null;

    // 🌟 FIX 2: Added Registration timestamp
    @CreateDateColumn()
    createdAt: Date;

    // 🌟 FIX 3: Added Last Updated timestamp
    @UpdateDateColumn()
    updatedAt: Date;
}