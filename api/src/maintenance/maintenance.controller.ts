import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceRecord, MaintenanceStatus } from './entities/maintenance.entity';

@Controller('api/maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  async findAll(): Promise<MaintenanceRecord[]> {
    return this.maintenanceService.findAll();
  }

  @Get('stats')
  async getMaintenanceStats() {
    return this.maintenanceService.getMaintenanceStats();
  }

  @Get('upcoming')
  async getUpcomingMaintenance(): Promise<MaintenanceRecord[]> {
    return this.maintenanceService.getUpcomingMaintenance();
  }

  @Get('device/:deviceId')
  async getDeviceMaintenanceHistory(@Param('deviceId', ParseIntPipe) deviceId: number): Promise<MaintenanceRecord[]> {
    return this.maintenanceService.getDeviceMaintenanceHistory(deviceId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<MaintenanceRecord> {
    return this.maintenanceService.findOne(id);
  }

  @Post()
  async create(@Body() createMaintenanceDto: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    return this.maintenanceService.create(createMaintenanceDto);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: MaintenanceStatus,
  ): Promise<MaintenanceRecord> {
    return this.maintenanceService.updateStatus(id, status);
  }

  @Put(':id/complete')
  async completeMaintenance(
    @Param('id', ParseIntPipe) id: number,
    @Body() completionData: { estimatedCost?: number },
  ): Promise<MaintenanceRecord> {
    return this.maintenanceService.completeMaintenance(id, completionData);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.maintenanceService['remove'](id);
  }
}
