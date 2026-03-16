import { Controller, Get, Post, Body, Param, Delete, HttpCode, HttpStatus, Patch, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user and send verification email' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // 🌟 FIX: Changed route to '/verify' and the body key to 'code' to match your React code!
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify user email using OTP' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  verifyEmail(@Body() body: { email: string; code: string }) {
    // We pass body.code into your service's OTP parameter
    return this.usersService.verifyEmailOtp(body.email, body.code);
  }

  @Post('admin')
  @ApiOperation({ summary: 'Admin direct user creation (No OTP)' })
  @ApiResponse({ status: 201, description: 'User created and saved to DB instantly' })
  createDirectly(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createDirectly(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user by ID (Partial Update)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  updatePartial(@Param('id') id: string, @Body() updateData: any) {
    return this.usersService.update(+id, updateData);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user by ID (Full Update)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  updateFull(@Param('id') id: string, @Body() updateData: any) {
    return this.usersService.update(+id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}