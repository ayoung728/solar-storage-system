import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS 設定，優先讀取環境變數，預設支援開發與容器環境端口
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
    : ['http://localhost:3000', 'http://localhost:5173'];
  
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  const port = process.env.PORT || 3002;
  await app.listen(port);
  console.log(`WebSocket service running on port ${port}`);
  console.log(`CORS origins: ${corsOrigins.join(', ')}`);
}

bootstrap();
