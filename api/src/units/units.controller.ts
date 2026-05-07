import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { UnitsService } from './units.service';
import { Unit } from './entities/unit.entity';

@Controller('api')
export class UnitsController {
  constructor(private readonly service: UnitsService) {}

  @Get('devices/:deviceId/units')
  async findByDevice(@Param('deviceId', ParseIntPipe) deviceId: number): Promise<Unit[]> {
    return this.service.findByDevice(deviceId);
  }

  @Post('devices/:deviceId/units')
  async create(@Param('deviceId', ParseIntPipe) deviceId: number, @Body() dto: Partial<Unit>): Promise<Unit> {
    return this.service.create(deviceId, dto);
  }

  @Get('units/:id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Unit> {
    return this.service.findOne(id);
  }

  @Put('units/:id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<Unit>): Promise<Unit> {
    return this.service.update(id, dto);
  }

  @Delete('units/:id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }
}
