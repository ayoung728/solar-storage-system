import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExecutionsService } from './executions.service';
import { ExecutionsController } from './executions.controller';
import { ExecutionRecord } from './entities/execution-record.entity';
import { ExecutionPhoto } from './entities/execution-photo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExecutionRecord, ExecutionPhoto])],
  controllers: [ExecutionsController],
  providers: [ExecutionsService],
  exports: [ExecutionsService],
})
export class ExecutionsModule {}
