import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkItem, WorkItemStatus } from './entities/work-item.entity';

@Injectable()
export class WorkItemsService {
  constructor(
    @InjectRepository(WorkItem)
    private repo: Repository<WorkItem>,
  ) {}

  async findAll(siteId?: number, status?: string, source?: string): Promise<WorkItem[]> {
    const where: any = {};
    if (siteId) where.siteId = siteId;
    if (status) where.status = status;
    if (source) where.sourceType = source;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findPool(): Promise<WorkItem[]> {
    return this.repo.find({ where: { status: WorkItemStatus.IN_POOL }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<WorkItem> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`WorkItem ${id} not found`);
    return item;
  }

  async create(dto: Partial<WorkItem>): Promise<WorkItem> {
    const item = this.repo.create({ ...dto, status: WorkItemStatus.IN_POOL });
    return this.repo.save(item);
  }

  async update(id: number, dto: Partial<WorkItem>): Promise<WorkItem> {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async updateStatus(id: number, status: WorkItemStatus): Promise<WorkItem> {
    const item = await this.findOne(id);
    item.status = status;
    if (status === WorkItemStatus.COMPLETED) item.completedAt = new Date();
    return this.repo.save(item);
  }

  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    await this.repo.remove(item);
  }
}
