import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm'; 
import { Cron, CronExpression } from '@nestjs/schedule'; 
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import * as nodemailer from 'nodemailer';

@Injectable()
export class UsersService {
  private pendingUsers = new Map<string, any>();

  private transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: 'rojanegacu21@gmail.com', 
      pass: 'frbi wfve gljn wukw',    
    },
  });

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password, email, ...rest } = createUserDto;
    
    const existingUser = await this.findOneByEmail(email);
    if (existingUser) {
      throw new BadRequestException('This email is already registered.');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    this.pendingUsers.set(email, {
      ...rest,
      email,
      password: hashedPassword,
      otp,
      expiresAt
    });

    const mailOptions = {
      from: 'rojanegacu21@gmail.com', 
      to: email,
      subject: 'Verify your Account',
      text: `Welcome! Your verification code is: ${otp}. It will expire in 15 minutes.`,
    };
    await this.transporter.sendMail(mailOptions);

    return { message: 'OTP sent. Please verify your email.' };
  }

  async createDirectly(createUserDto: CreateUserDto) {
    const { password, email, ...rest } = createUserDto;
    
    const existingUser = await this.findOneByEmail(email);
    if (existingUser) {
      throw new BadRequestException('This email is already registered.');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = this.usersRepository.create({
      ...rest,
      email,
      password: hashedPassword,
      isActive: true, 
    });

    return await this.usersRepository.save(newUser);
  }

  async verifyEmailOtp(email: string, otp: string) {
    const pendingUser = this.pendingUsers.get(email);
    if (!pendingUser) {
      throw new BadRequestException('No pending signup found. Please go back and sign up again.');
    }

    if (pendingUser.otp !== otp) {
      throw new BadRequestException('Invalid verification code');
    }
    
    if (new Date() > pendingUser.expiresAt) {
      this.pendingUsers.delete(email); 
      throw new BadRequestException('Verification code has expired. Please sign up again.');
    }

    const newUser = this.usersRepository.create({
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password,
      role: pendingUser.role,
      isActive: true, 
      resetOtp: null,
      resetOtpExpires: null
    });

    await this.usersRepository.save(newUser);
    this.pendingUsers.delete(email);

    return { message: 'Email verified successfully! You can now log in.' };
  }

  async activateGoogleUser(email: string, name: string, tempPassword: string) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(tempPassword, saltRounds);

    const newUser = this.usersRepository.create({
      name,
      email,
      password: hashedPassword,
      role: 'Attendee',
      isActive: true, 
    });

    return await this.usersRepository.save(newUser);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  findAll() {
    return this.usersRepository.find();
  }

  async remove(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (user) {
      return await this.usersRepository.update(id, { isActive: !user.isActive });
    }
    return null;
  }

  // 🌟 FIX: Updated this method to sync changes to the Attendee table!
  async update(id: number, updateData: Partial<User>) {
    const existingUser = await this.usersRepository.findOne({ where: { id } });
    if (!existingUser) throw new NotFoundException('User not found');

    // 1. Update the User profile
    await this.usersRepository.update(id, updateData);

    // 2. If the name or email changed, automatically update their Tickets!
    if (updateData.name || updateData.email) {
      const newName = updateData.name || existingUser.name;
      const newEmail = updateData.email || existingUser.email;

      await this.usersRepository.query(
        `UPDATE attendee SET name = ?, email = ? WHERE email = ?`,
        [newName, newEmail, existingUser.email]
      );
    }

    return this.usersRepository.findOne({ where: { id } });
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleArchivedUsersCleanup() {
    console.log('🧹 Running background cleanup for archived users...');
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const usersToDelete = await this.usersRepository.find({
      where: {
        isArchived: true,
        archivedAt: LessThan(sixtyDaysAgo),
      },
    });

    if (usersToDelete.length > 0) {
      await this.usersRepository.remove(usersToDelete);
      console.log(`✅ Permanently deleted ${usersToDelete.length} expired accounts from the database.`);
    } 
  }
}