import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule'; 
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { EventsModule } from './events/events.module';
import { AttendeesModule } from './attendees/attendees.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notifications/notifications.module'; 

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'frontend', 'dist'),
      exclude: ['/api*', '/auth*', '/events*', '/attendees*', '/users*', '/notifications*'],
    }),
    ScheduleModule.forRoot(), 
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
    NotificationsModule, 
  ],
})
export class AppModule {}
