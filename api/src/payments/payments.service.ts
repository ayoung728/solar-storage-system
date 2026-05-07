import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentRecord, PaymentStatus } from './entities/payment-record.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentRecord)
    private repo: Repository<PaymentRecord>,
  ) {}

  async findAll(status?: string): Promise<PaymentRecord[]> {
    const where: any = {};
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<PaymentRecord> {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException(`PaymentRecord ${id} not found`);
    return p;
  }

  async create(dto: Partial<PaymentRecord>): Promise<PaymentRecord> {
    return this.repo.save(this.repo.create(dto));
  }

  async approve(id: number): Promise<PaymentRecord> {
    const p = await this.findOne(id);
    p.status = PaymentStatus.APPROVED;
    return this.repo.save(p);
  }

  async markPaid(id: number, paidDate?: string): Promise<PaymentRecord> {
    const p = await this.findOne(id);
    p.status = PaymentStatus.PAID;
    p.paidDate = paidDate || new Date().toISOString().slice(0, 10);
    return this.repo.save(p);
  }

  async reject(id: number, notes?: string): Promise<PaymentRecord> {
    const p = await this.findOne(id);
    p.status = PaymentStatus.CANCELLED;
    if (notes) p.notes = notes;
    return this.repo.save(p);
  }
}
