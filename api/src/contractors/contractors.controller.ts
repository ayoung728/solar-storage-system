import { Controller, Get, Post, Put, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ContractorsService } from './contractors.service';
import { Contractor } from './entities/contractor.entity';

@Controller('api/contractors')
export class ContractorsController {
  constructor(private readonly service: ContractorsService) {}

  @Get()
  async findAll(): Promise<Contractor[]> {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Contractor> {
    return this.service.findOne(id);
  }

  @Post()
  async create(@Body() dto: Partial<Contractor>): Promise<Contractor> {
    return this.service.create(dto);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<Contractor>): Promise<Contractor> {
    return this.service.update(id, dto);
  }

  @Put(':id/status')
  async updateStatus(@Param('id', ParseIntPipe) id: number, @Body('isActive') isActive: boolean): Promise<Contractor> {
    return this.service.updateStatus(id, isActive);
  }
}
