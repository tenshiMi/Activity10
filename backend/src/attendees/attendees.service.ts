import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendee } from './entities/attendee.entity';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import * as nodemailer from 'nodemailer'; // 🌟 1. IMPORT NODEMAILER

@Injectable()
export class AttendeesService {
  private transporter; // 🌟 2. DECLARE TRANSPORTER

  constructor(
    @InjectRepository(Attendee)
    private attendeeRepository: Repository<Attendee>,
  ) { 
    // 🌟 3. SETUP YOUR EMAIL TRANSPORTER
    this.transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: 'rojanegacu21@gmail.com', // Your Gmail address
        pass: 'frbi wfve gljn wukw'       // REPLACE WITH YOUR GMAIL APP PASSWORD
      },
    });
  }

  // 🌟 4. MAKE CREATE METHOD ASYNC
  async create(createAttendeeDto: CreateAttendeeDto) {
    // Generate a simple random Ticket ID (e.g., "TIX-8473")
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const ticketId = `TIX-${randomId}`;

    const newAttendee = this.attendeeRepository.create({
      ...createAttendeeDto,
      ticketId, 
      status: 'Pending'
    });

    // Save to the database FIRST
    const savedAttendee = await this.attendeeRepository.save(newAttendee);

    // 🌟 5. SEND THE E-TICKET EMAIL!
    try {
      // Use a free API to generate the QR image directly inside the email!
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
      // We log the error but DON'T throw it, so the user still gets registered in the database even if the email fails.
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

  // 🌟 UPGRADED: Changes status instead of erasing from database
  async remove(id: number) {
    const attendee = await this.attendeeRepository.findOneBy({ id });
    if (attendee) {
      attendee.status = 'Cancelled';
      return this.attendeeRepository.save(attendee);
    }
    return null;
  }
}