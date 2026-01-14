import { Controller, Get, Post, Body, Delete, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { AttendeesService } from './attendees.service';
import { CreateAttendeeDto } from './dto/create-attendee.dto';

@ApiTags('attendees')
@Controller('attendees')
export class AttendeesController {
  constructor(private readonly attendeesService: AttendeesService) { }

  @Post()
  @ApiOperation({ summary: 'Register a new attendee' })
  @ApiResponse({ status: 201, description: 'Attendee registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createAttendeeDto: CreateAttendeeDto) {
    return this.attendeesService.create(createAttendeeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all attendees' })
  @ApiResponse({ status: 200, description: 'List of attendees' })
  findAll() {
    return this.attendeesService.findAll();
  }

  @Get('check-registration')
  @ApiOperation({ summary: 'Check if attendee is registered for an event' })
  @ApiQuery({ name: 'email', description: 'Attendee email' })
  @ApiQuery({ name: 'eventId', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Registration status' })
  checkRegistration(@Query('email') email: string, @Query('eventId') eventId: string) {
    return this.attendeesService.checkRegistration(email, eventId);
  }

  @Post('scan')
  @ApiOperation({ summary: 'Scan attendee ticket' })
  @ApiBody({ schema: { type: 'object', properties: { ticketId: { type: 'string', example: 'ABC123' } } } })
  @ApiResponse({ status: 200, description: 'Ticket scanned successfully' })
  @ApiResponse({ status: 400, description: 'Invalid ticket' })
  async scan(@Body('ticketId') ticketId: string) {
    try {
      const updatedAttendee = await this.attendeesService.scanTicket(ticketId);
      return { success: true, attendee: updatedAttendee };
    } catch (error) {
      return { success: false, message: 'Invalid Ticket' };
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove attendee by ID' })
  @ApiParam({ name: 'id', description: 'Attendee ID' })
  @ApiResponse({ status: 200, description: 'Attendee removed successfully' })
  @ApiResponse({ status: 404, description: 'Attendee not found' })
  remove(@Param('id') id: string) {
    return this.attendeesService.remove(+id);
  }
}
