import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contractor } from './entities/contractor.entity';

@Injectable()
export class ContractorsService {
  constructor(
    @InjectRepository(Contractor)
    private repo: Repository<Contractor>,
  ) {}

  async findAll(): Promise<Contractor[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<Contractor> {
    const c = await this.repo.findOne({ where: { id } });
    if (!c) throw new NotFoundException(`Contractor ${id} not found`);
    return c;
  }

  async create(dto: Partial<Contractor>): Promise<Contractor> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: number, dto: Partial<Contractor>): Promise<Contractor> {
    const c = await this.findOne(id);
    Object.assign(c, dto);
    return this.repo.save(c);
  }

  async updateStatus(id: number, isActive: boolean): Promise<Contractor> {
    const c = await this.findOne(id);
    c.isActive = isActive;
    return this.repo.save(c);
  }
}
