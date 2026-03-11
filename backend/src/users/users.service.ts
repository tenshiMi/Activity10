import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import * as nodemailer from 'nodemailer';

@Injectable()
export class UsersService {
  // 🌟 NEW: Temporary memory storage for unverified signups
  private pendingUsers = new Map<string, any>();

  // Setup Nodemailer transporter
  private transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: 'rojanegacu21@gmail.com', // <-- Put your real email here
      pass: 'frbi wfve gljn wukw',    // <-- Put your 16-character App Password here
    },
  });

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // 1. Create User (Temporarily in Memory) & Send OTP
  async create(createUserDto: CreateUserDto) {
    const { password, email, ...rest } = createUserDto;
    
    // Check if user already exists in the REAL database
    const existingUser = await this.findOneByEmail(email);
    if (existingUser) {
      throw new BadRequestException('This email is already registered.');
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate a 6-digit OTP and set expiration (15 mins)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // 🌟 SAVE TO TEMPORARY MEMORY INSTEAD OF MYSQL DATABASE
    // If they change their email and resubmit, it just safely overwrites memory!
    this.pendingUsers.set(email, {
      ...rest,
      email,
      password: hashedPassword,
      otp,
      expiresAt
    });

    // Send the Verification Email
    const mailOptions = {
      from: 'rojanegacu21@gmail.com', // <-- Put your real email here
      to: email,
      subject: 'Verify your Account',
      text: `Welcome! Your verification code is: ${otp}. It will expire in 15 minutes.`,
    };
    await this.transporter.sendMail(mailOptions);

    return { message: 'OTP sent. Please verify your email.' };
  }

  // 2. Verify Email OTP and Save to Database
  async verifyEmailOtp(email: string, otp: string) {
    // Look for the user in temporary memory
    const pendingUser = this.pendingUsers.get(email);
    if (!pendingUser) {
      throw new BadRequestException('No pending signup found. Please go back and sign up again.');
    }

    // Check if OTP is wrong
    if (pendingUser.otp !== otp) {
      throw new BadRequestException('Invalid verification code');
    }
    
    // Check if OTP expired
    if (new Date() > pendingUser.expiresAt) {
      this.pendingUsers.delete(email); // Clean up expired memory
      throw new BadRequestException('Verification code has expired. Please sign up again.');
    }

    // 🌟 OTP IS CORRECT! NOW we save them to the real MySQL database
    const newUser = this.usersRepository.create({
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password,
      role: pendingUser.role,
      isActive: true, // They are fully verified and active
      resetOtp: null,
      resetOtpExpires: null
    });

    await this.usersRepository.save(newUser);

    // Clean them out of temporary memory since they are safely in the DB now
    this.pendingUsers.delete(email);

    return { message: 'Email verified successfully! You can now log in.' };
  }

  // ==========================================
  // 🌟 NEW: Bypass OTP for Google Login
  // ==========================================
  async activateGoogleUser(email: string, name: string, tempPassword: string) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(tempPassword, saltRounds);

    const newUser = this.usersRepository.create({
      name,
      email,
      password: hashedPassword,
      role: 'Attendee',
      isActive: true, // Auto-activate because Google vouches for them
    });

    return await this.usersRepository.save(newUser);
  }

  // 3. Find by Email (For Login)
  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  findAll() {
    return this.usersRepository.find();
  }

  // 🌟 CHANGED: Soft-Delete by toggling isActive status
  async remove(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (user) {
      // If active, it deactivates them. If inactive, it reactivates them!
      return await this.usersRepository.update(id, { isActive: !user.isActive });
    }
    return null;
  }

  // Update User (For Forgot Password Reset)
  async update(id: number, updateData: Partial<User>) {
    await this.usersRepository.update(id, updateData);
    return this.usersRepository.findOne({ where: { id } });
  }
}