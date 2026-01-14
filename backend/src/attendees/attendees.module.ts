import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // <--- Import
import { AttendeesService } from './attendees.service';
import { AttendeesController } from './attendees.controller';
import { Attendee } from './entities/attendee.entity'; // <--- Import

@Module({
  imports: [TypeOrmModule.forFeature([Attendee])], // <--- Add this
  controllers: [AttendeesController],
  providers: [AttendeesService],
})
export class AttendeesModule {}