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

    findAll() {
        return this.eventsRepository.find();
    }

    findByOrganizer(organizerId: number) {
        return this.eventsRepository.find({ where: { organizerId } });
    }

    findOne(id: number) {
        return this.eventsRepository.findOneBy({ id });
    }

    // 👇 THIS WAS MISSING
    async remove(id: number) {
        return await this.eventsRepository.delete(id);
    }
    // src/events/events.service.ts
    async update(id: number, updateEventDto: UpdateEventDto) {
        return await this.eventsRepository.update(id, updateEventDto);
    }
}