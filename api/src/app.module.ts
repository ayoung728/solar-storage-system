import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { TicketsModule } from './tickets/tickets.module';
import { DevicesModule } from './devices/devices.module';
import { AlertsModule } from './alerts/alerts.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { SitesModule } from './sites/sites.module';
import { UnitsModule } from './units/units.module';
import { MaintenanceItemsModule } from './maintenance-items/maintenance-items.module';
import { WorkItemsModule } from './work-items/work-items.module';
import { DispatchPackagesModule } from './dispatch-packages/dispatch-packages.module';
import { ExecutionsModule } from './executions/executions.module';
import { ContractorsModule } from './contractors/contractors.module';
import { PaymentsModule } from './payments/payments.module';
import { EngineersModule } from './engineers/engineers.module';

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
    CustomersModule,
    SitesModule,
    UnitsModule,
    MaintenanceItemsModule,
    WorkItemsModule,
    DispatchPackagesModule,
    ExecutionsModule,
    ContractorsModule,
    PaymentsModule,
    EngineersModule,
  ],
})
export class AppModule {}
