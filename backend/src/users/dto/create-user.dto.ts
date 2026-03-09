import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, IsBoolean, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'User password', example: 'Password123!' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/, {
    message: 'Password must be at least 6 characters long and contain 1 uppercase letter, 1 number, and 1 special character',
  })
  password: string;

  @ApiProperty({ description: 'User full name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'User role', example: 'attendee', enum: ['admin', 'organizer', 'attendee'] })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({ description: 'Whether the user is active', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}