import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceItemsService } from './maintenance-items.service';
import { MaintenanceItemsController } from './maintenance-items.controller';
import { MaintenanceItem } from './entities/maintenance-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MaintenanceItem])],
  controllers: [MaintenanceItemsController],
  providers: [MaintenanceItemsService],
  exports: [MaintenanceItemsService],
})
export class MaintenanceItemsModule {}
