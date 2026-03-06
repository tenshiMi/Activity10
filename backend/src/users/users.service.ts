import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // 1. Create User with Hashed Password
  async create(createUserDto: CreateUserDto) {
    const { password, ...rest } = createUserDto;
    
    // Hash the password (encryption)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Save with the hashed password
    return this.usersRepository.save({
      ...rest,
      password: hashedPassword,
    });
  }

  // 2. Find by Email (For Login)
  // Update the return type to allow null
  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  findAll() {
    return this.usersRepository.find();
  }

  async remove(id: number) {
    return await this.usersRepository.delete(id);
  }

  // ==========================================
  // NEW METHOD: Update User (For OTP & Password Reset)
  // ==========================================
  async update(id: number, updateData: Partial<User>) {
    await this.usersRepository.update(id, updateData);
    return this.usersRepository.findOne({ where: { id } });
  }
}