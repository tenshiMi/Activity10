import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'User password', example: 'password123' })
  password: string;

  @ApiProperty({ description: 'User full name', example: 'John Doe' })
  name: string;

  @ApiProperty({ description: 'User role', example: 'attendee', enum: ['admin', 'organizer', 'attendee'] })
  role: string;

  @ApiProperty({ description: 'Whether the user is active', required: false, default: true })
  isActive?: boolean;
}