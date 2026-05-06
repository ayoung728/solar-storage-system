import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { Device, DeviceStatus, DeviceType } from './entities/device.entity';

@Controller('api/devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  async findAll(): Promise<Device[]> {
    return this.devicesService.findAll();
  }

  @Get('stats')
  async getDeviceStats() {
    return this.devicesService.getDeviceStats();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Device> {
    return this.devicesService.findOne(id);
  }

  @Post()
  async create(@Body() createDeviceDto: Partial<Device>): Promise<Device> {
    return this.devicesService.create(createDeviceDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDeviceDto: Partial<Device>,
  ): Promise<Device> {
    return this.devicesService.update(id, updateDeviceDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.devicesService.remove(id);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: DeviceStatus,
  ): Promise<Device> {
    return this.devicesService.updateStatus(id, status);
  }

  @Put(':id/telemetry')
  async updateTelemetry(
    @Param('id', ParseIntPipe) id: number,
    @Body('telemetryData') telemetryData: any,
  ): Promise<Device> {
    return this.devicesService.updateTelemetryData(id, telemetryData);
  }
}
