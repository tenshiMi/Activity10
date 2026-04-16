import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm'; // 🌟 Added LessThan
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Cron, CronExpression } from '@nestjs/schedule'; // 🌟 Added Cron imports

@Injectable()
export class EventsService implements OnModuleInit {
    constructor(
        @InjectRepository(Event)
        private eventsRepository: Repository<Event>,
    ) { }

    create(createEventDto: CreateEventDto) {
        return this.eventsRepository.save(createEventDto);
    }

    async findAll() {
        return this.eventsRepository.query(`
            SELECT event.*, COUNT(attendee.id) as ticketsSold
            FROM event
            LEFT JOIN attendee ON event.id = attendee.eventId
            GROUP BY event.id
        `);
    }

    async findByOrganizer(organizerId: number) {
        return this.eventsRepository.query(`
            SELECT event.*, COUNT(attendee.id) as ticketsSold
            FROM event
            LEFT JOIN attendee ON event.id = attendee.eventId
            WHERE event.organizerId = ?
            GROUP BY event.id
        `, [organizerId]);
    }

    findOne(id: number) {
        return this.eventsRepository.findOneBy({ id });
    }

    async remove(id: number) {
        const event = await this.eventsRepository.findOneBy({ id });
        if (event) {
            return await this.eventsRepository.update(id, { isArchived: !event.isArchived });
        }
        return null;
    }

    async update(id: number, updateEventDto: UpdateEventDto) {
        return await this.eventsRepository.update(id, updateEventDto);
    }

    async updateStatus(id: number, status: string) {
        const event = await this.eventsRepository.findOneBy({ id });
        if (!event) {
            throw new NotFoundException('Event not found');
        }
        
        return await this.eventsRepository.update(id, { status });
    }

    // ==========================================
    // 🌟 NEW: RUNS ON SERVER STARTUP
    // ==========================================
    async onModuleInit() {
        console.log('🚀 Server starting: Running initial sweep for expired events...');
        await this.autoCompleteExpiredEvents();
    }

    // ==========================================
    // 🌟 AUTOMATED MIDNIGHT EVENT COMPLETION
    // ==========================================
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async autoCompleteExpiredEvents() {
        console.log('🔄 Running background check for expired events...');
        
        // 1. Get today's date
        const today = new Date();
        
        // 🌟 FIX: Convert it to a 'YYYY-MM-DD' string to match your database format!
        const todayString = today.toISOString().split('T')[0];

        // 2. Find all active events whose date string is older than today's date string
        const expiredEvents = await this.eventsRepository.find({
            where: {
                status: 'Published', 
                date: LessThan(todayString), // Pass the string here instead!
            },
        });

        if (expiredEvents.length > 0) {
            // Loop through and update their status to 'Completed'
            for (const event of expiredEvents) {
                event.status = 'Completed';
            }
            
            await this.eventsRepository.save(expiredEvents);
            console.log(`✅ Automatically moved ${expiredEvents.length} events to Completed status.`);
        }
    }
}