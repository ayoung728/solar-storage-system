import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { Ticket, TicketStatus, TicketPriority } from './entities/ticket.entity';

@Controller('api/tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  // IMPORTANT: Static routes must be defined BEFORE parameterized routes
  // to avoid Express capturing 'statistics' or 'priority' as :id

  @Get('statistics')
  async getStatistics(): Promise<any> {
    return this.ticketsService.getStatistics();
  }

  @Get('priority/:priority')
  async findByPriority(@Param('priority') priority: TicketPriority): Promise<Ticket[]> {
    return this.ticketsService.findByPriority(priority);
  }

  @Get()
  async findAll(@Query('status') status?: TicketStatus): Promise<Ticket[]> {
    if (status) {
      return this.ticketsService.findByStatus(status);
    }
    return this.ticketsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Ticket> {
    return this.ticketsService.findOne(id);
  }

  @Post()
  async create(@Body() createTicketDto: Partial<Ticket>): Promise<Ticket> {
    return this.ticketsService.create(createTicketDto);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updateTicketDto: Partial<Ticket>): Promise<Ticket> {
    return this.ticketsService.update(id, updateTicketDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.ticketsService.remove(id);
  }
}
