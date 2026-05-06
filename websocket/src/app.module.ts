import { Module } from '@nestjs/common';
import { Gateway, GatewayModule } from './gateway';

@Module({
  imports: [],
  providers: [Gateway],
  controllers: [],
})
export class AppModule {}
