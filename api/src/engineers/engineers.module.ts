import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EngineersService } from './engineers.service';
import { EngineersController } from './engineers.controller';
import { Engineer } from './entities/engineer.entity';
import { EngineerSchedule } from './entities/engineer-schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Engineer, EngineerSchedule])],
  controllers: [EngineersController],
  providers: [EngineersService],
  exports: [EngineersService],
})
export class EngineersModule {}
