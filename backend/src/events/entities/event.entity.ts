import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Event {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    date: string; 

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
    
    @Column({ nullable: true }) 
    announcement: string;

    @Column()
    organizerId: number; 

    @Column({ default: false })
    isArchived: boolean;

    @Column({ nullable: true })
    imageUrl: string;

    @Column({ nullable: true })
    bannerUrl: string;

    @Column({ type: 'int', default: 0 })
    capacity: number;

    @Column({ default: 'Pending' })
    status: string;
}