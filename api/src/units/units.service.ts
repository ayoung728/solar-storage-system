import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from './entities/unit.entity';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private repo: Repository<Unit>,
  ) {}

  async findByDevice(deviceId: number): Promise<Unit[]> {
    return this.repo.find({ where: { deviceId }, relations: ['maintenanceItems'] });
  }

  async findOne(id: number): Promise<Unit> {
    const unit = await this.repo.findOne({ where: { id }, relations: ['device', 'maintenanceItems'] });
    if (!unit) throw new NotFoundException(`Unit ${id} not found`);
    return unit;
  }

  async create(deviceId: number, dto: Partial<Unit>): Promise<Unit> {
    const unit = this.repo.create({ ...dto, deviceId });
    return this.repo.save(unit);
  }

  async update(id: number, dto: Partial<Unit>): Promise<Unit> {
    const unit = await this.findOne(id);
    Object.assign(unit, dto);
    return this.repo.save(unit);
  }

  async remove(id: number): Promise<void> {
    const unit = await this.findOne(id);
    await this.repo.remove(unit);
  }
}
