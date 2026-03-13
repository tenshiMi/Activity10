import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule'; // 🌟 Added ScheduleModule
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from './events/events.module';
import { AttendeesModule } from './attendees/attendees.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ScheduleModule.forRoot(), // 🌟 Initialized ScheduleModule here!
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root', 
      password: '',     
      database: 'event_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, 
    }),
    EventsModule,
    AttendeesModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}