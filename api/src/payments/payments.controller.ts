import { Controller, Get, Post, Put, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentRecord } from './entities/payment-record.entity';

@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Get()
  async findAll(@Query('status') status?: string): Promise<PaymentRecord[]> {
    return this.service.findAll(status);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PaymentRecord> {
    return this.service.findOne(id);
  }

  @Post()
  async create(@Body() dto: Partial<PaymentRecord>): Promise<PaymentRecord> {
    return this.service.create(dto);
  }

  @Put(':id/approve')
  async approve(@Param('id', ParseIntPipe) id: number): Promise<PaymentRecord> {
    return this.service.approve(id);
  }

  @Put(':id/pay')
  async markPaid(@Param('id', ParseIntPipe) id: number, @Body('paidDate') paidDate?: string): Promise<PaymentRecord> {
    return this.service.markPaid(id, paidDate);
  }

  @Put(':id/reject')
  async reject(@Param('id', ParseIntPipe) id: number, @Body('notes') notes?: string): Promise<PaymentRecord> {
    return this.service.reject(id, notes);
  }
}
