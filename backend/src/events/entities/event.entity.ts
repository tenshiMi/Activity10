import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Event {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    date: string; // Storing as string for simplicity, can be Date

    @Column()
    time: string;

    @Column()
    location: string;

    @Column()
    category: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column()
    price: string;
    
    @Column({ nullable: true }) // Allow it to be empty initially
    announcement: string;

    @Column()
    organizerId: number; // Add organizer ID to associate events with creators

    @Column({ default: false })
    isArchived: boolean;
}