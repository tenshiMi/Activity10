import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Not } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import * as nodemailer from 'nodemailer';

interface PendingUser {
  name: string;
  email: string;
  password?: string;
  role?: string;
  username?: string | null;
  avatarUrl?: string | null;
  eventReminders?: boolean;
  bookingUpdates?: boolean;
  marketingEmails?: boolean;
  darkMode?: boolean;
  otp: string;
  expiresAt: Date;
}

@Injectable()
export class UsersService {
  private pendingUsers = new Map<string, PendingUser>();

  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'harmony.events9@gmail.com',
      pass: 'banm cbtr rtae llrm',
    },
  });

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password, email, ...rest } = createUserDto;
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await this.findOneByEmail(normalizedEmail);
    if (existingUser) {
      throw new BadRequestException('This email is already registered.');
    }

    if (rest.username) {
      const existingUsername = await this.usersRepository.findOne({
        where: { username: rest.username.trim() },
      });
      if (existingUsername) {
        throw new BadRequestException('This username is already taken.');
      }
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    this.pendingUsers.set(normalizedEmail, {
      name: rest.name,
      username: rest.username?.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: rest.role, 
      otp,
      expiresAt,
    } as PendingUser);

    const mailOptions = {
      from: 'harmony.events@gmail.com',
      to: normalizedEmail,
      subject: 'Verify your Account',
      text: `Welcome! Your verification code is: ${otp}. It will expire in 15 minutes.`,
    };

    try {
      console.log(`\n=========================================`);
      console.log(`📩 [DEV MODE] OTP CODE FOR ${normalizedEmail}: ${otp}`);
      console.log(`=========================================\n`);
      
      await this.transporter.sendMail(mailOptions);
    } catch (error: any) {
      console.error('🚨 Nodemailer Error (Safe Fallback Active):', error.message);
    }

    return { message: 'OTP sent. Please verify your email.' };
  }

  async createDirectly(createUserDto: CreateUserDto) {
    const { password, email, ...rest } = createUserDto;
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await this.findOneByEmail(normalizedEmail);
    if (existingUser) {
      throw new BadRequestException('This email is already registered.');
    }

    if (rest.username) {
      const existingUsername = await this.usersRepository.findOne({
        where: { username: rest.username.trim() },
      });
      if (existingUsername) {
        throw new BadRequestException('This username is already taken.');
      }
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = this.usersRepository.create({
      ...rest,
      email: normalizedEmail,
      username: rest.username?.trim() || null,
      password: hashedPassword,
      isActive: true,
    });

    return await this.usersRepository.save(newUser);
  }

  async verifyEmailOtp(email: string, otp: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const pendingUser = this.pendingUsers.get(normalizedEmail);

    if (!pendingUser) {
      throw new BadRequestException('No pending signup found. Please go back and sign up again.');
    }

    if (pendingUser.otp !== otp) {
      throw new BadRequestException('Invalid verification code');
    }

    if (new Date() > pendingUser.expiresAt) {
      this.pendingUsers.delete(normalizedEmail);
      throw new BadRequestException('Verification code has expired. Please sign up again.');
    }

    if (pendingUser.username) {
      const existingUsername = await this.usersRepository.findOne({
        where: { username: pendingUser.username.trim() },
      });
      if (existingUsername) {
        throw new BadRequestException('This username is already taken.');
      }
    }

    const newUser = this.usersRepository.create({
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password,
      role: pendingUser.role,
      username: pendingUser.username?.trim() || null,
      avatarUrl: pendingUser.avatarUrl || null,
      eventReminders: pendingUser.eventReminders ?? true,
      bookingUpdates: pendingUser.bookingUpdates ?? true,
      marketingEmails: pendingUser.marketingEmails ?? false,
      darkMode: pendingUser.darkMode ?? false,
      isActive: true,
      resetOtp: null,
      resetOtpExpires: null,
      pendingEmail: null,
      pendingEmailOtp: null,
      pendingEmailOtpExpires: null,
    });

    await this.usersRepository.save(newUser);
    this.pendingUsers.delete(normalizedEmail);

    return { message: 'Email verified successfully! You can now log in.' };
  }

  async activateGoogleUser(email: string, name: string, tempPassword: string) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(tempPassword, saltRounds);

    const newUser = this.usersRepository.create({
      name,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: 'Attendee',
      isActive: true,
      eventReminders: true,
      bookingUpdates: true,
      marketingEmails: false,
      darkMode: false,
    });

    return await this.usersRepository.save(newUser);
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email: email.trim().toLowerCase() },
    });
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

  async sendEmailChangeOtp(id: number, newEmail: string, currentPassword: string) {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!currentPassword?.trim()) {
      throw new BadRequestException('Current password is required.');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect.');
    }

    const normalizedNewEmail = newEmail.trim().toLowerCase();

    if (normalizedNewEmail === user.email) {
      throw new BadRequestException('New email must be different from current email.');
    }

    const existingEmailOwner = await this.usersRepository.findOne({
      where: { email: normalizedNewEmail, id: Not(id) },
    });

    if (existingEmailOwner) {
      throw new BadRequestException('This email is already registered.');
    }

    const existingPendingOwner = await this.usersRepository.findOne({
      where: { pendingEmail: normalizedNewEmail, id: Not(id) },
    });

    if (existingPendingOwner) {
      throw new BadRequestException('This email is already waiting for verification.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await this.usersRepository.update(id, {
      pendingEmail: normalizedNewEmail,
      pendingEmailOtp: otp,
      pendingEmailOtpExpires: expiresAt,
    });

    try {
      console.log(`\n=========================================`);
      console.log(`📩 [DEV MODE] OTP CODE FOR EMAIL CHANGE: ${otp}`);
      console.log(`=========================================\n`);
      
      await this.transporter.sendMail({
        from: 'harmony.events@gmail.com',
        to: normalizedNewEmail,
        subject: 'Confirm your new email address',
        text: `Your Harmony Events email change verification code is: ${otp}. It will expire in 15 minutes.`,
      });
    } catch (error: any) {
      console.error('🚨 Nodemailer Error:', error.message);
    }

    return { message: 'Verification code sent successfully to your new email address.' };
  }

  async verifyEmailChangeOtp(id: number, code: string) {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.pendingEmail || !user.pendingEmailOtp || !user.pendingEmailOtpExpires) {
      throw new BadRequestException('No pending email change found.');
    }

    if (user.pendingEmailOtp !== code) {
      throw new BadRequestException('Invalid verification code.');
    }

    if (new Date() > new Date(user.pendingEmailOtpExpires)) {
      await this.usersRepository.update(id, {
        pendingEmail: null,
        pendingEmailOtp: null,
        pendingEmailOtpExpires: null,
      });
      throw new BadRequestException('Verification code has expired.');
    }

    const oldEmail = user.email;
    const newEmail = String(user.pendingEmail);

    const emailOwner = await this.usersRepository.findOne({
      where: { email: newEmail, id: Not(id) },
    });

    if (emailOwner) {
      throw new BadRequestException('This email is already registered.');
    }

    await this.usersRepository.update(id, {
      email: newEmail,
      pendingEmail: null,
      pendingEmailOtp: null,
      pendingEmailOtpExpires: null,
    });

    await this.usersRepository.query(
      `UPDATE attendee SET email = ? WHERE email = ?`,
      [newEmail, oldEmail],
    );

    return this.usersRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateData: UpdateUserDto & {
      currentPassword?: string;
      newPassword?: string;
      password?: string;
    },
  ) {
    const existingUser = await this.usersRepository.findOne({ where: { id } });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const sanitizedUpdate: any = {};

    if (typeof updateData.name !== 'undefined') sanitizedUpdate.name = updateData.name;

    if (typeof updateData.email !== 'undefined' && updateData.email.trim().toLowerCase() !== existingUser.email) {
      throw new BadRequestException('Use the email verification flow before changing your email.');
    }

    if (typeof updateData.username !== 'undefined') {
      const normalizedUsername = updateData.username?.trim() || null;
      if (normalizedUsername) {
        const usernameOwner = await this.usersRepository.findOne({
          where: { username: normalizedUsername, id: Not(id) },
        });
        if (usernameOwner) throw new BadRequestException('This username is already taken.');
      }
      sanitizedUpdate.username = normalizedUsername;
    }

    if (typeof updateData.avatarUrl !== 'undefined') sanitizedUpdate.avatarUrl = updateData.avatarUrl || null;
    if (typeof updateData.isActive !== 'undefined') sanitizedUpdate.isActive = updateData.isActive;
    if (typeof updateData.isArchived !== 'undefined') sanitizedUpdate.isArchived = updateData.isArchived;
    if (typeof updateData.archivedAt !== 'undefined') sanitizedUpdate.archivedAt = updateData.archivedAt;
    if (typeof updateData.resetOtp !== 'undefined') sanitizedUpdate.resetOtp = updateData.resetOtp;
    if (typeof updateData.resetOtpExpires !== 'undefined') sanitizedUpdate.resetOtpExpires = updateData.resetOtpExpires;
    if (typeof updateData.eventReminders !== 'undefined') sanitizedUpdate.eventReminders = updateData.eventReminders;
    if (typeof updateData.bookingUpdates !== 'undefined') sanitizedUpdate.bookingUpdates = updateData.bookingUpdates;
    if (typeof updateData.marketingEmails !== 'undefined') sanitizedUpdate.marketingEmails = updateData.marketingEmails;
    if (typeof updateData.darkMode !== 'undefined') sanitizedUpdate.darkMode = updateData.darkMode;

    // 🌟 FIX: Hash the password when an Admin forces a password update directly
    if (typeof updateData.password !== 'undefined') {
      sanitizedUpdate.password = await bcrypt.hash(String(updateData.password), 10);
    }

    // Handles the normal user profile password change (needs current password validation)
    if (updateData.newPassword) {
      if (!updateData.currentPassword) {
        throw new BadRequestException('Current password is required to change password.');
      }

      const isPasswordValid = await bcrypt.compare(String(updateData.currentPassword), existingUser.password);
      if (!isPasswordValid) throw new BadRequestException('Current password is incorrect.');

      const hashedPassword = await bcrypt.hash(String(updateData.newPassword), 10);
      sanitizedUpdate.password = hashedPassword;
    }

    await this.usersRepository.update(id, sanitizedUpdate);

    if (updateData.name) {
      await this.usersRepository.query(
        `UPDATE attendee SET name = ? WHERE email = ?`,
        [updateData.name, existingUser.email],
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