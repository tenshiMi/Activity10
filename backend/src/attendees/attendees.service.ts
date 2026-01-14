import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendee } from './entities/attendee.entity';
import { CreateAttendeeDto } from './dto/create-attendee.dto';

@Injectable()
export class AttendeesService {
  constructor(
    @InjectRepository(Attendee)
    private attendeeRepository: Repository<Attendee>,
  ) { }

  create(createAttendeeDto: CreateAttendeeDto) {
    // Generate a simple random Ticket ID (e.g., "TIX-8473")
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const ticketId = `TIX-${randomId}`;

    const newAttendee = this.attendeeRepository.create({
      ...createAttendeeDto,
      ticketId, // Add the generated ID
      status: 'Pending'
    });

    return this.attendeeRepository.save(newAttendee);
  }

  findAll() {
    return this.attendeeRepository.find();
  }

  async checkRegistration(email: string, eventId: string) {
    const existingAttendee = await this.attendeeRepository.findOne({
      where: { email, eventId }
    });
    return { isRegistered: !!existingAttendee };
  }
  async scanTicket(ticketId: string) {
    // 1. Find the attendee by ticket ID
    const attendee = await this.attendeeRepository.findOneBy({ ticketId });

    if (!attendee) {
      throw new Error('Ticket not found');
    }

    // 2. Update status to "Checked In"
    attendee.status = 'Checked In';
    return this.attendeeRepository.save(attendee);
  }
  async remove(id: number) {
    return await this.attendeeRepository.delete(id);
  }
}

