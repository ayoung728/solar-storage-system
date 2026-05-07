import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkItemsService } from './work-items.service';
import { WorkItemsController } from './work-items.controller';
import { WorkItem } from './entities/work-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkItem])],
  controllers: [WorkItemsController],
  providers: [WorkItemsService],
  exports: [WorkItemsService],
})
export class WorkItemsModule {}
