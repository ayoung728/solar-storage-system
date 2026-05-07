import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { DispatchPackagesService } from './dispatch-packages.service';
import { DispatchPackage, DispatchStatus, ExecutorType } from './entities/dispatch-package.entity';

@Controller('api/dispatch-packages')
export class DispatchPackagesController {
  constructor(private readonly service: DispatchPackagesService) {}

  @Get()
  async findAll(@Query('status') status?: string, @Query('engineerId') engineerId?: number): Promise<DispatchPackage[]> {
    return this.service.findAll(status, engineerId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<DispatchPackage> {
    return this.service.findOne(id);
  }

  @Post()
  async create(@Body() dto: {
    title?: string; priority?: string; scheduledDate?: string;
    executorType?: ExecutorType; engineerId?: number; contractorId?: number;
    notes?: string; workItemIds: number[]; createdBy?: number;
  }): Promise<DispatchPackage> {
    return this.service.create(dto);
  }

  @Post('suggest')
  async suggest(@Body('workItemIds') workItemIds: number[]): Promise<any[]> {
    return this.service.suggest(workItemIds);
  }

  @Put(':id/status')
  async updateStatus(@Param('id', ParseIntPipe) id: number, @Body('status') status: DispatchStatus): Promise<DispatchPackage> {
    return this.service.updateStatus(id, status);
  }

  @Put(':id/assign')
  async assign(@Param('id', ParseIntPipe) id: number, @Body() body: { engineerId?: number; contractorId?: number }): Promise<DispatchPackage> {
    if (body.engineerId) return this.service.assignEngineer(id, body.engineerId);
    if (body.contractorId) return this.service.assignContractor(id, body.contractorId);
    return this.service.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }
}
