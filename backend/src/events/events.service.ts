import { Injectable } from '@nestjs/common';
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

    // 🌟 FIX: Uses Raw SQL to count attendees for Admin View
    async findAll() {
        return this.eventsRepository.query(`
            SELECT event.*, COUNT(attendee.id) as ticketsSold
            FROM event
            LEFT JOIN attendee ON event.id = attendee.eventId
            GROUP BY event.id
        `);
    }

    // 🌟 FIX: Uses Raw SQL to count attendees for Organizer View
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

    // This now "Soft Deletes" by toggling the archive status!
    async remove(id: number) {
        const event = await this.eventsRepository.findOneBy({ id });
        if (event) {
            // If it is archived, this un-archives it. If it is active, this archives it!
            return await this.eventsRepository.update(id, { isArchived: !event.isArchived });
        }
        return null;
    }

    async update(id: number, updateEventDto: UpdateEventDto) {
        return await this.eventsRepository.update(id, updateEventDto);
    }
}