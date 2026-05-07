import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Customer } from './entities/customer.entity';

@Controller('api/customers')
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

  @Get()
  async findAll(@Query('search') search?: string): Promise<Customer[]> {
    return this.service.findAll(search);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Customer> {
    return this.service.findOne(id);
  }

  @Get(':id/sites')
  async findSites(@Param('id', ParseIntPipe) id: number): Promise<Customer> {
    return this.service.findOne(id);
  }

  @Post()
  async create(@Body() dto: Partial<Customer>): Promise<Customer> {
    return this.service.create(dto);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<Customer>): Promise<Customer> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }
}
