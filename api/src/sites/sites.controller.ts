import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { SitesService } from './sites.service';
import { Site } from './entities/site.entity';

@Controller('api/sites')
export class SitesController {
  constructor(private readonly service: SitesService) {}

  @Get()
  async findAll(
    @Query('customerId') customerId?: number,
    @Query('search') search?: string,
  ): Promise<Site[]> {
    return this.service.findAll(customerId, search);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Site> {
    return this.service.findOne(id);
  }

  @Post()
  async create(@Body() dto: Partial<Site>): Promise<Site> {
    return this.service.create(dto);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<Site>): Promise<Site> {
    return this.service.update(id, dto);
  }

  @Put(':id/status')
  async updateStatus(@Param('id', ParseIntPipe) id: number, @Body('status') status: string): Promise<Site> {
    return this.service.updateStatus(id, status);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }
}
