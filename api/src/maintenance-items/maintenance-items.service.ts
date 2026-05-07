import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceItem } from './entities/maintenance-item.entity';

@Injectable()
export class MaintenanceItemsService {
  constructor(
    @InjectRepository(MaintenanceItem)
    private repo: Repository<MaintenanceItem>,
  ) {}

  async findByUnit(unitId: number): Promise<MaintenanceItem[]> {
    return this.repo.find({ where: { unitId } });
  }

  async findOne(id: number): Promise<MaintenanceItem> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`MaintenanceItem ${id} not found`);
    return item;
  }

  async create(unitId: number, dto: Partial<MaintenanceItem>): Promise<MaintenanceItem> {
    const item = this.repo.create({ ...dto, unitId });
    return this.repo.save(item);
  }

  async update(id: number, dto: Partial<MaintenanceItem>): Promise<MaintenanceItem> {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    await this.repo.remove(item);
  }
}
