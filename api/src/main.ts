import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable validation pipe for DTO validation
  app.useGlobalPipes(new ValidationPipe());
  
  // Enable CORS
  app.enableCors();
  
  const port = process.env.API_PORT || 8000;
  await app.listen(port);
  console.log(`API Server running on http://localhost:${port}`);
}

bootstrap();
