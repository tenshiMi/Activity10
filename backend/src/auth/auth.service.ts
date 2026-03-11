import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs'; // Kept your existing bcryptjs
import * as nodemailer from 'nodemailer'; // NEW: For sending emails

@Injectable()
export class AuthService {
  // NEW: Setup Nodemailer transporter
  private transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: 'rojanegacu21@gmail.com', // Replace with your email
      pass: 'frbi wfve gljn wukw',    // Replace with your Google App Password
    },
  });

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // ==========================================
  // EXISTING METHODS (Do not change these)
  // ==========================================

  // 1. Verify Email and Password
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    
    // If user exists AND password matches
    if (user && await bcrypt.compare(pass, user.password)) {
      
      // 🌟 NEW: Block login if they are archived/inactive!
      if (!user.isActive) {
        throw new UnauthorizedException('INACTIVE_ACCOUNT');
      }

      const { password, ...result } = user;
      return result; // Return user without password
    }
    return null;
  }

  // 2. Generate Token
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
    // 1. Find user using your existing UsersService
    const user = await this.usersService.findOneByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    // 2. Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 3. Set expiration time (15 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // 4. Update the user record via UsersService
    await this.usersService.update(user.id, {
      resetOtp: otp,
      resetOtpExpires: expiresAt,
    });

    // 5. Send Email
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

    // Check if OTP matches
    if (user.resetOtp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }
    
   // Check if OTP is expired or doesn't exist
    if (!user.resetOtpExpires || new Date() > new Date(user.resetOtpExpires)) {
      throw new BadRequestException('OTP has expired or is invalid');
    }

    return { message: 'OTP verified successfully', user };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    // 1. Verify again to get the user safely
    const { user } = await this.verifyOtp(email, otp);

    // 2. Hash the new password using bcryptjs
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // 3. Update password and clear the OTP fields
    await this.usersService.update(user.id, {
      password: hashedPassword,
      resetOtp: null,
      resetOtpExpires: null,
    });

    return { message: 'Password reset successfully' };
  }

  // ==========================================
  // NEW METHODS FOR ACCOUNT REACTIVATION
  // ==========================================

  async sendReactivationOtp(email: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    // Generate OTP & Expiration
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Save OTP to user record
    await this.usersService.update(user.id, { resetOtp: otp, resetOtpExpires: expiresAt });

    // Send the email
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
    // Reuse the exact same validation logic from forgot password
    const { user } = await this.verifyOtp(email, otp);

    // If OTP is correct, REACTIVATE the user!
    await this.usersService.update(user.id, {
      isActive: true,
      resetOtp: null,
      resetOtpExpires: null,
    });

    // Auto-login the user by generating a brand new JWT token
    return this.login(user);
  }
}