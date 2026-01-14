import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs'; // Use the JS version we installed

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // 1. Verify Email and Password
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    
    // If user exists AND password matches
    if (user && await bcrypt.compare(pass, user.password)) {
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
}