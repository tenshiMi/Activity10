import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Event Management API')
    .setDescription('API for managing events, attendees, users, and authentication')
    .setVersion('1.0')
    .addTag('events', 'Event management endpoints')
    .addTag('attendees', 'Attendee management endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('auth', 'Authentication endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
