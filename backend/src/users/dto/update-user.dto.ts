import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  isActive?: boolean;
  isArchived?: boolean;
  archivedAt?: Date;
  resetOtp?: string;
  resetOtpExpires?: Date;

  // 🌟 NEW: Add these so NestJS knows to accept them from the frontend!
  username?: string;
  avatarUrl?: string;
}