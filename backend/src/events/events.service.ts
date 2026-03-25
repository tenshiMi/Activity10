import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
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
}