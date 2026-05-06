import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { TicketsModule } from './tickets/tickets.module';
import { DevicesModule } from './devices/devices.module';
import { AlertsModule } from './alerts/alerts.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'solar-postgres',
      port: parseInt(process.env.DATABASE_PORT) || 5432,
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'solar_storage',
      autoLoadEntities: true,
      synchronize: false,
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'solar-storage-jwt-secret-change-in-production',
      signOptions: { expiresIn: '24h' },
    }),
    AuthModule,
    TicketsModule,
    DevicesModule,
    AlertsModule,
    MaintenanceModule,
  ],
})
export class AppModule {}
