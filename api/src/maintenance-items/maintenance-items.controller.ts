import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { MaintenanceItemsService } from './maintenance-items.service';
import { MaintenanceItem } from './entities/maintenance-item.entity';

@Controller('api')
export class MaintenanceItemsController {
  constructor(private readonly service: MaintenanceItemsService) {}

  @Get('units/:unitId/items')
  async findByUnit(@Param('unitId', ParseIntPipe) unitId: number): Promise<MaintenanceItem[]> {
    return this.service.findByUnit(unitId);
  }

  @Post('units/:unitId/items')
  async create(@Param('unitId', ParseIntPipe) unitId: number, @Body() dto: Partial<MaintenanceItem>): Promise<MaintenanceItem> {
    return this.service.create(unitId, dto);
  }

  @Get('maintenance-items/:id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<MaintenanceItem> {
    return this.service.findOne(id);
  }

  @Put('maintenance-items/:id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<MaintenanceItem>): Promise<MaintenanceItem> {
    return this.service.update(id, dto);
  }

  @Delete('maintenance-items/:id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }
}
