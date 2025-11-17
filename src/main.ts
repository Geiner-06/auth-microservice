import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CertificateGuard } from './guards/certificate.guard';
import * as dotenv from 'dotenv';

// Load environment variables before anything else
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita un pipe global para validar automáticamente todos los DTOs
  // que usen decoradores de class-validator.
  app.useGlobalPipes(new ValidationPipe());
  
  app.enableCors({
    origin: 'http://localhost:5173', // El origen de tu app de React
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalGuards(new CertificateGuard());
  
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();
