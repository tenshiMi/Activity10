import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { existsSync } from 'fs';
import { join } from 'path';

dotenv.config();

async function bootstrap() {
  // 🌟 FIX: Disable the default 100kb body parser so our 50mb rule actually works!
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  app.enableCors({ origin: true, credentials: true });

  // Now the JSON payload limit of 50mb will successfully allow profile pictures
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

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

  // SPA fallback for React Router (only if a built frontend exists)
  const frontendDistPath = join(__dirname, '..', '..', 'frontend', 'dist');
  const frontendIndexPath = join(frontendDistPath, 'index.html');
  if (existsSync(frontendIndexPath)) {
    app.use((req, res, next) => {
      if (req.method !== 'GET') return next();
      if (req.path.startsWith('/api')) return next();
      if (req.path.startsWith('/auth')) return next();
      if (req.path.startsWith('/events')) return next();
      if (req.path.startsWith('/attendees')) return next();
      if (req.path.startsWith('/users')) return next();
      if (req.path.startsWith('/notifications')) return next();
      if (req.path.includes('.')) return next();
      return res.sendFile(frontendIndexPath);
    });
  }

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();