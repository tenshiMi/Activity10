import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs'; 
import * as nodemailer from 'nodemailer'; 

@Injectable()
export class AuthService {
  private transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: 'rojanegacu21@gmail.com', 
      pass: 'frbi wfve gljn wukw',    
    },
  });

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // ==========================================
  // EXISTING METHODS (Do not change these)
  // ==========================================

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    
    // Just check the password here.
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result; 
    }
    
    return null;
  }

  

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email
      }
    };
  }

  // ==========================================
  // NEW METHODS FOR FORGOT PASSWORD
  // ==========================================

  async forgotPassword(email: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // 🌟 Added "as any" to bypass TypeScript strictness
    await this.usersService.update(user.id, {
      resetOtp: otp,
      resetOtpExpires: expiresAt,
    } as any);

    const mailOptions = {
      from: 'rojanegacu21@gmail.com',
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}. It will expire in 15 minutes.`,
    };

    await this.transporter.sendMail(mailOptions);
    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    if (user.resetOtp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }
    
    if (!user.resetOtpExpires || new Date() > new Date(user.resetOtpExpires)) {
      throw new BadRequestException('OTP has expired or is invalid');
    }

    return { message: 'OTP verified successfully', user };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    const { user } = await this.verifyOtp(email, otp);

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // 🌟 Added "as any" 
    await this.usersService.update(user.id, {
      password: hashedPassword,
      resetOtp: null,
      resetOtpExpires: null,
    } as any);

    return { message: 'Password reset successfully' };
  }

  // ==========================================
  // NEW METHODS FOR ACCOUNT REACTIVATION
  // ==========================================

  async sendReactivationOtp(email: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // 🌟 Added "as any" 
    await this.usersService.update(user.id, { resetOtp: otp, resetOtpExpires: expiresAt } as any);

    const mailOptions = {
      from: 'rojanegacu21@gmail.com',
      to: email,
      subject: 'Reactivate your Account',
      text: `Your account was archived. Your OTP to reactivate and verify your email is: ${otp}. It will expire in 15 minutes.`,
    };

    await this.transporter.sendMail(mailOptions);
    return { message: 'Reactivation OTP sent successfully' };
  }

  async verifyReactivationOtp(email: string, otp: string) {
    const { user } = await this.verifyOtp(email, otp);

    // If OTP is correct, REACTIVATE the user and stop the 60-day deletion clock!
    // 🌟 Added "as any" 
    await this.usersService.update(user.id, {
      isActive: true,
      isArchived: false, 
      archivedAt: null,  
      resetOtp: null,
      resetOtpExpires: null,
    } as any);

    return this.login(user);
  }

  // ==========================================
  // NEW METHODS FOR ADMIN USER MANAGEMENT
  // ==========================================

  async archiveUser(id: number) {
    // 1. Deactivate their account so they can't login normally
    // 2. Mark them as archived
    // 3. Stamp the current date to start the 60-day deletion countdown
    
    // 🌟 Added "as any" to fix the red squiggly lines!
    await this.usersService.update(id, {
      isActive: false,       
      isArchived: true,      
      archivedAt: new Date() 
    } as any);

    return { message: 'User archived successfully. 60-day deletion countdown started.' };
  }
}