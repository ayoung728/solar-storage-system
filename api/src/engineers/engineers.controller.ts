import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { EngineersService } from './engineers.service';
import { Engineer } from './entities/engineer.entity';
import { EngineerSchedule } from './entities/engineer-schedule.entity';

@Controller('api')
export class EngineersController {
  constructor(private readonly service: EngineersService) {}

  // Engineers CRUD
  @Get('engineers')
  async findAll(): Promise<Engineer[]> {
    return this.service.findAll();
  }

  @Get('engineers/:id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Engineer> {
    return this.service.findOne(id);
  }

  @Post('engineers')
  async create(@Body() dto: Partial<Engineer>): Promise<Engineer> {
    return this.service.create(dto);
  }

  @Put('engineers/:id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<Engineer>): Promise<Engineer> {
    return this.service.update(id, dto);
  }

  @Put('engineers/:id/status')
  async updateStatus(@Param('id', ParseIntPipe) id: number, @Body('isActive') isActive: boolean): Promise<Engineer> {
    return this.service.updateStatus(id, isActive);
  }

  // Schedule
  @Get('engineers/:id/schedule')
  async getSchedule(@Param('id', ParseIntPipe) id: number, @Query('month') month: string): Promise<EngineerSchedule[]> {
    return this.service.getSchedule(id, month);
  }

  @Get('schedules/today')
  async getToday(): Promise<any[]> {
    return this.service.getTodaySchedule();
  }

  @Post('schedules/generate')
  async generate(@Body('year') year: number, @Body('month') month: number): Promise<{ created: number }> {
    return this.service.generateSchedule(year, month);
  }

  @Post('schedules')
  async addSchedule(@Body() dto: { engineerId: number; workDate: string; shift: string; note?: string }): Promise<EngineerSchedule> {
    return this.service.addSchedule(dto);
  }

  @Put('schedules/:id')
  async updateSchedule(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<EngineerSchedule>): Promise<EngineerSchedule> {
    return this.service.updateSchedule(id, dto);
  }

  @Delete('schedules/:id')
  async removeSchedule(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.removeSchedule(id);
  }

  @Post('schedules/swap')
  async swap(@Body('id1') id1: number, @Body('id2') id2: number): Promise<void> {
    return this.service.swapSchedule(id1, id2);
  }
}
