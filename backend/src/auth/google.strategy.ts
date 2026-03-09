import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private usersService: UsersService) {
    super({
      clientID: 'process.env.GOOGLE_CLIENT_ID',         // <-- PASTE YOUR ID HERE
      clientSecret: 'process.env.GOOGLE_CLIENT_SECRET', // <-- PASTE YOUR SECRET HERE
      callbackURL: 'http://localhost:3000/auth/google/callback', // Must match Google Console exactly
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const { name, emails } = profile;
    const email = emails[0].value;
    const fullName = `${name.givenName} ${name.familyName}`;

    // Check if user already exists in your database
    let user = await this.usersService.findOneByEmail(email);

    // If they don't exist, we create a new account for them instantly!
    if (!user) {
      // We create a random temporary password because Google users don't need passwords to log in
      const tempPassword = Math.random().toString(36).slice(-10) + 'A1!'; 
      
      const payload = {
        name: fullName,
        email: email,
        password: tempPassword, 
        role: 'Attendee' // Default role
      };
      
      // Use your existing user creation logic
      await this.usersService.create(payload);
      
      // Since your create method currently saves them to memory and waits for an OTP, 
      // we need to immediately activate them in the real DB because Google already verified their email!
      user = await this.usersService.activateGoogleUser(email, fullName, tempPassword);
    }

    done(null, user);
  }
}