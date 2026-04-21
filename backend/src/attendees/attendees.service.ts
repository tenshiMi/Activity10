import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendee } from './entities/attendee.entity';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AttendeesService {
  private transporter; 

  constructor(
    @InjectRepository(Attendee)
    private attendeeRepository: Repository<Attendee>,
  ) { 
    this.transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        // 🌟 FIX 1: Updated the login email
        user: 'harmony.events9@gmail.com', 
        // 🚨 IMPORTANT: You must generate a new Google App Password for this specific email account!
        pass: 'opod ndgn tuuy ogjr' 
      },
    });
  }

  async create(createAttendeeDto: CreateAttendeeDto) {
    // 🌟 FIX 4: DUPLICATE REGISTRATION BLOCKER
    const existingTicket = await this.attendeeRepository.findOne({
      where: { 
        email: createAttendeeDto.email, 
        eventId: createAttendeeDto.eventId 
      }
    });

    if (existingTicket && existingTicket.status !== 'Cancelled') {
      throw new BadRequestException('You are already registered for this event!');
    }

    const randomId = Math.floor(1000 + Math.random() * 9000);
    const ticketId = `TIX-${randomId}`;

    const newAttendee = this.attendeeRepository.create({
      ...createAttendeeDto,
      ticketId, 
      status: 'Pending'
    });

    const savedAttendee = await this.attendeeRepository.save(newAttendee);

    try {
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${ticketId}`;

      const mailOptions = {
        // 🌟 FIX 2: Updated the "From" address that the user sees in their inbox
        from: '"Harmony Events" <harmony.events9@gmail.com>',
        to: savedAttendee.email,
        subject: `🎫 Your Ticket Confirmed: ${ticketId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-w: 500px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">You're Going!</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">Registration Confirmed</p>
            </div>
            
            <div style="padding: 30px; text-align: center; background-color: #ffffff;">
              <p style="font-size: 16px; color: #4b5563; margin-bottom: 5px;">Hi <strong>${savedAttendee.name}</strong>,</p>
              <p style="font-size: 16px; color: #4b5563; margin-bottom: 20px;">Here is your official e-ticket. Present this QR code at the entrance.</p>
              
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 12px; display: inline-block;">
                <img src="${qrCodeUrl}" alt="Ticket QR Code" style="width: 200px; height: 200px;" />
                <p style="margin: 15px 0 0 0; font-family: monospace; font-size: 20px; font-weight: bold; letter-spacing: 2px; color: #111827;">
                  ${ticketId}
                </p>
              </div>

              <div style="margin-top: 30px; border-top: 1px dashed #d1d5db; padding-top: 20px;">
                <p style="font-size: 14px; color: #6b7280; margin: 0;">Need to cancel? You can manage your tickets in your dashboard at any time.</p>
              </div>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Ticket email sent to ${savedAttendee.email}`);
    } catch (error) {
      console.error("Failed to send ticket email:", error);
    }

    return savedAttendee;
  }

  findAll() {
    return this.attendeeRepository.find();
  }

  async checkRegistration(email: string, eventId: string) {
    const existingAttendee = await this.attendeeRepository.findOne({
      where: { email, eventId }
    });
    
    const isActuallyGoing = existingAttendee ? existingAttendee.status !== 'Cancelled' : false;
    
    return { 
      isRegistered: isActuallyGoing,
      status: existingAttendee?.status || null
    };
  }

  async scanTicket(rawTicketId: string) {
    const cleanTicketId = rawTicketId.trim();

    const attendee = await this.attendeeRepository.findOne({ 
      where: { ticketId: cleanTicketId } 
    });

    if (!attendee) {
      throw new NotFoundException('Ticket not found in the database.');
    }

    if (attendee.status === 'Checked In') {
      throw new BadRequestException('This ticket has already been scanned!');
    }

    if (attendee.status === 'Cancelled') {
      throw new BadRequestException('This ticket was cancelled.');
    }

    attendee.status = 'Checked In';
    attendee.checkedInAt = new Date(); 
    
    return await this.attendeeRepository.save(attendee);
  }

  async updateStatus(ticketId: string, status: string) {
    const attendee = await this.attendeeRepository.findOne({ where: { ticketId } });
    
    if (!attendee) {
      throw new NotFoundException(`Attendee with Ticket ID ${ticketId} not found`);
    }

    attendee.status = status;
    
    if (status === 'Checked In') {
      attendee.checkedInAt = new Date();
    } else if (status === 'Pending' || status === 'Cancelled') {
      attendee.checkedInAt = null;
    }

    return await this.attendeeRepository.save(attendee);
  }

  async remove(id: number) {
    const attendee = await this.attendeeRepository.findOneBy({ id });
    if (attendee) {
      attendee.status = 'Cancelled';
      attendee.checkedInAt = null; // Clear check-in if voided
      return this.attendeeRepository.save(attendee);
    }
    return null;
  }
}