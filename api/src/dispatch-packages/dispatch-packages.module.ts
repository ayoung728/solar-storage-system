import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DispatchPackagesService } from './dispatch-packages.service';
import { DispatchPackagesController } from './dispatch-packages.controller';
import { DispatchPackage } from './entities/dispatch-package.entity';
import { DispatchPackageItem } from './entities/dispatch-package-item.entity';
import { WorkItem } from '../work-items/entities/work-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DispatchPackage, DispatchPackageItem, WorkItem])],
  controllers: [DispatchPackagesController],
  providers: [DispatchPackagesService],
  exports: [DispatchPackagesService],
})
export class DispatchPackagesModule {}
