import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common'; // <--- Ensure Delete is imported
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@ApiTags('events')
@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new event' })
    @ApiResponse({ status: 201, description: 'Event created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    create(@Body() createEventDto: CreateEventDto) {
        return this.eventsService.create(createEventDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all events' })
    @ApiResponse({ status: 200, description: 'List of events' })
    findAll() {
        return this.eventsService.findAll();
    }

    @Get('organizer/:organizerId')
    @ApiOperation({ summary: 'Get events by organizer ID' })
    @ApiParam({ name: 'organizerId', description: 'Organizer ID' })
    @ApiResponse({ status: 200, description: 'List of events for the organizer' })
    findByOrganizer(@Param('organizerId') organizerId: string) {
        return this.eventsService.findByOrganizer(+organizerId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get event by ID' })
    @ApiParam({ name: 'id', description: 'Event ID' })
    @ApiResponse({ status: 200, description: 'Event details' })
    @ApiResponse({ status: 404, description: 'Event not found' })
    findOne(@Param('id') id: string) {
        return this.eventsService.findOne(+id);
    }

    // 👇 THIS CONNECTS THE URL TO THE SERVICE
    @Delete(':id')
    @ApiOperation({ summary: 'Delete event by ID' })
    @ApiParam({ name: 'id', description: 'Event ID' })
    @ApiResponse({ status: 200, description: 'Event deleted successfully' })
    @ApiResponse({ status: 404, description: 'Event not found' })
    remove(@Param('id') id: string) {
        return this.eventsService.remove(+id);
    }

    @Get('summary/stats')
    @ApiOperation({ summary: 'Get event statistics' })
    @ApiResponse({ status: 200, description: 'Event statistics' })
    async getStats() {
        const allEvents = await this.eventsService.findAll();

        // Calculate totals
        const totalEvents = allEvents.length;
        // Calculate revenue (assuming price is a number string)
        const totalRevenue = allEvents.reduce((sum, event) => {
            const price = parseFloat(event.price) || 0;
            return sum + price; // This is a simple estimation
        }, 0);

        return {
            totalEvents,
            totalRevenue,
            // You would normally inject AttendeesService to get this count,
            // but let's send 0 or a placeholder if we don't want to break the file structure yet.
            totalAttendees: 0
        };
    }

    // src/events/events.controller.ts
    @Put(':id')
    @ApiOperation({ summary: 'Update event by ID' })
    @ApiParam({ name: 'id', description: 'Event ID' })
    @ApiResponse({ status: 200, description: 'Event updated successfully' })
    @ApiResponse({ status: 404, description: 'Event not found' })
    update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
        return this.eventsService.update(+id, updateEventDto);
    }
}