import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { Alert, AlertSeverity, AlertStatus } from './entities/alert.entity';

@Controller('api/alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  async findAll(): Promise<Alert[]> {
    return this.alertsService.findAll();
  }

  @Get('stats')
  async getAlertStats() {
    return this.alertsService.getAlertStats();
  }

  @Get('critical')
  async getCriticalAlerts(): Promise<Alert[]> {
    return this.alertsService.getCriticalAlerts();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Alert> {
    return this.alertsService.findOne(id);
  }

  @Post()
  async create(@Body() createAlertDto: Partial<Alert>): Promise<Alert> {
    return this.alertsService.create(createAlertDto);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: AlertStatus,
  ): Promise<Alert> {
    return this.alertsService.updateStatus(id, status);
  }

  @Delete('resolved')
  async clearResolvedAlerts() {
    return this.alertsService.clearResolvedAlerts();
  }
}
