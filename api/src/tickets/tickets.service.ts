import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus, TicketPriority } from './entities/ticket.entity';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
  ) {}

  async findAll(): Promise<Ticket[]> {
    return this.ticketsRepository.find({ order: { createdAt: 'DESC' } as any });
  }

  async findOne(id: number): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOne({ where: { id } });
    if (!ticket) {
      throw new NotFoundException(`Ticket #${id} not found`);
    }
    return ticket;
  }

  async create(createTicketDto: Partial<Ticket>): Promise<Ticket> {
    const ticket = this.ticketsRepository.create({
      ...createTicketDto as any,
      status: TicketStatus.OPEN,
      priority: createTicketDto.priority || TicketPriority.MEDIUM,
    });
    return this.ticketsRepository.save(ticket) as unknown as Promise<Ticket>;
  }

  async update(id: number, updateTicketDto: Partial<Ticket>): Promise<Ticket> {
    const ticket = await this.findOne(id);
    
    if (updateTicketDto.status === TicketStatus.RESOLVED && !(ticket as any).resolved_at) {
      (ticket as any).resolved_at = new Date();
    }
    
    Object.assign(ticket, updateTicketDto);
    return this.ticketsRepository.save(ticket);
  }

  async remove(id: number): Promise<void> {
    const ticket = await this.findOne(id);
    await this.ticketsRepository.remove(ticket);
  }

  async findByStatus(status: TicketStatus): Promise<Ticket[]> {
    return this.ticketsRepository.find({ 
      where: { status },
      order: { createdAt: 'DESC' as any }
    });
  }

  async findByPriority(priority: TicketPriority): Promise<Ticket[]> {
    return this.ticketsRepository.find({ 
      where: { priority },
      order: { createdAt: 'DESC' as any }
    });
  }

  async getStatistics(): Promise<any> {
    const tickets = await this.ticketsRepository.find();
    
    return {
      total: tickets.length,
      byStatus: Object.values(TicketStatus).reduce((acc, status) => {
        acc[status] = tickets.filter(t => t.status === status).length;
        return acc;
      }, {}),
      byPriority: Object.values(TicketPriority).reduce((acc, priority) => {
        acc[priority] = tickets.filter(t => t.priority === priority).length;
        return acc;
      }, {}),
      openCount: tickets.filter(t => t.status === TicketStatus.OPEN).length,
      inProgressCount: tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length,
    };
  }
}
