import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: 'SECRET_KEY_123', // In a real app, use env variables
      signOptions: { expiresIn: '1h' }, // Token expires in 1 hour
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}