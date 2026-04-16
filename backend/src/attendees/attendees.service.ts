import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'; // 🌟 Added BadRequestException
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
        user: 'rojanegacu21@gmail.com', 
        pass: 'frbi wfve gljn wukw' 
      },
    });
  }

  async create(createAttendeeDto: CreateAttendeeDto) {
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
        from: '"Harmony Events" <rojanegacu21@gmail.com>',
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
    
    // 🌟 FIX: It now checks if they exist AND that their status is NOT Cancelled!
    const isActuallyGoing = existingAttendee ? existingAttendee.status !== 'Cancelled' : false;
    
    return { 
      isRegistered: isActuallyGoing,
      status: existingAttendee?.status || null
    };
  }

  // 🌟 COMPLETELY REWRITTEN SCANNER LOGIC
  async scanTicket(rawTicketId: string) {
    // 1. Clean the input to remove hidden spaces/newlines from the scanner hardware
    const cleanTicketId = rawTicketId.trim();

    const attendee = await this.attendeeRepository.findOne({ 
      where: { ticketId: cleanTicketId } 
    });

    // 2. Clear error if it genuinely doesn't exist
    if (!attendee) {
      throw new NotFoundException('Ticket not found in the database.');
    }

    // 3. Prevent double-scanning
    if (attendee.status === 'Checked In') {
      throw new BadRequestException('This ticket has already been scanned!');
    }

    // 4. Prevent cancelled tickets from entering
    if (attendee.status === 'Cancelled') {
      throw new BadRequestException('This ticket was cancelled.');
    }

    // 5. If it passes all checks (Pending, Confirmed, etc.), Check them in!
    attendee.status = 'Checked In';
    return await this.attendeeRepository.save(attendee);
  }

  // 🌟 NEW: The function that updates status in MySQL
  async updateStatus(ticketId: string, status: string) {
    const attendee = await this.attendeeRepository.findOne({ where: { ticketId } });
    
    if (!attendee) {
      throw new NotFoundException(`Attendee with Ticket ID ${ticketId} not found`);
    }

    attendee.status = status;
    return await this.attendeeRepository.save(attendee);
  }

  async remove(id: number) {
    const attendee = await this.attendeeRepository.findOneBy({ id });
    if (attendee) {
      attendee.status = 'Cancelled';
      return this.attendeeRepository.save(attendee);
    }
    return null;
  }
}