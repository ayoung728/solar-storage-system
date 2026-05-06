import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

// DNS 啟動重試：容器環境中 postgres 主機名解析可能延遲
async function waitForDatabase(retries = 10, delayMs = 2000) {
  const { Client } = require('pg');
  for (let i = 0; i < retries; i++) {
    try {
      const client = new Client({
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        user: process.env.DATABASE_USER || 'solar_admin',
        password: process.env.DATABASE_PASSWORD || 'solar_secure_password_2024',
        database: process.env.DATABASE_NAME || 'solar_storage',
        connectionTimeoutMillis: 3000,
      });
      await client.connect();
      await client.end();
      console.log('Database connection established');
      return;
    } catch (err: any) {
      console.log(`Waiting for database (attempt ${i + 1}/${retries}): ${err.message}`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  console.warn('Database not reachable after all retries, starting anyway...');
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable validation pipe for DTO validation
  app.useGlobalPipes(new ValidationPipe());
  
  // Enable CORS
  app.enableCors();
  
  // Health check endpoint (for Docker healthcheck)
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get('/api/health', (_req: any, res: any) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  const port = process.env.PORT || 8000;
  
  // Wait for database before starting
  await waitForDatabase();
  await app.listen(port);
  console.log(`API Server running on http://localhost:${port}`);
}

bootstrap();
