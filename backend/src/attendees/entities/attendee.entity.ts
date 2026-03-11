import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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
}