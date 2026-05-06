import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS 設定，允許 Frontend 存取
  app.enableCors({
    origin: 'http://localhost:5173', // Vite 開發伺服器
    credentials: true,
  });

  const port = process.env.WS_PORT || 3002;
  await app.listen(port);
  console.log(`WebSocket service running on port ${port}`);
}

bootstrap();
