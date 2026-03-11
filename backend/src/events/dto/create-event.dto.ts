import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ description: 'Event title', example: 'Tech Conference 2024' })
  title: string;

  @ApiProperty({ description: 'Event date', example: '2024-12-25' })
  date: string;

  @ApiProperty({ description: 'Event time', example: '10:00 AM' })
  time: string;

  @ApiProperty({ description: 'Event location', example: 'Convention Center' })
  location: string;

  @ApiProperty({ description: 'Event category', example: 'Conference / Summit' })
  category: string;

  @ApiProperty({ description: 'Event description', example: 'A conference about latest tech trends' })
  description: string;

  @ApiProperty({ description: 'Event price', example: '50.00' })
  price: string;

  // 🌟 NEW: Added the announcement field! (Optional because they might add it later)
  @ApiPropertyOptional({ description: 'Special announcement for attendees', example: 'Doors open at 5 PM' })
  announcement?: string;

  @ApiProperty({ description: 'Organizer ID', example: 1 })
  organizerId: number;
}