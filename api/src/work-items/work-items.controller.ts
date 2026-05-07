import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { WorkItemsService } from './work-items.service';
import { WorkItem, WorkItemStatus } from './entities/work-item.entity';

@Controller('api/work-items')
export class WorkItemsController {
  constructor(private readonly service: WorkItemsService) {}

  @Get()
  async findAll(
    @Query('siteId') siteId?: number,
    @Query('status') status?: string,
    @Query('source') source?: string,
  ): Promise<WorkItem[]> {
    return this.service.findAll(siteId, status, source);
  }

  @Get('pool')
  async findPool(): Promise<WorkItem[]> {
    return this.service.findPool();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<WorkItem> {
    return this.service.findOne(id);
  }

  @Post()
  async create(@Body() dto: Partial<WorkItem>): Promise<WorkItem> {
    return this.service.create(dto);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<WorkItem>): Promise<WorkItem> {
    return this.service.update(id, dto);
  }

  @Put(':id/status')
  async updateStatus(@Param('id', ParseIntPipe) id: number, @Body('status') status: WorkItemStatus): Promise<WorkItem> {
    return this.service.updateStatus(id, status);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }
}
