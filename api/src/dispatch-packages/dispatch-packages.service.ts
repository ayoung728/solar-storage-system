import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DispatchPackage, DispatchStatus, ExecutorType } from './entities/dispatch-package.entity';
import { DispatchPackageItem } from './entities/dispatch-package-item.entity';
import { WorkItem, WorkItemStatus } from '../work-items/entities/work-item.entity';

@Injectable()
export class DispatchPackagesService {
  constructor(
    @InjectRepository(DispatchPackage)
    private repo: Repository<DispatchPackage>,
    @InjectRepository(DispatchPackageItem)
    private itemRepo: Repository<DispatchPackageItem>,
    @InjectRepository(WorkItem)
    private workItemRepo: Repository<WorkItem>,
  ) {}

  async findAll(status?: string, engineerId?: number): Promise<DispatchPackage[]> {
    const where: any = {};
    if (status) where.status = status;
    if (engineerId) where.engineerId = engineerId;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<DispatchPackage> {
    const dp = await this.repo.findOne({
      where: { id },
      relations: ['dispatchPackageItems', 'dispatchPackageItems.workItem'],
    });
    if (!dp) throw new NotFoundException(`DispatchPackage ${id} not found`);
    return dp;
  }

  async create(dto: {
    title?: string;
    priority?: string;
    scheduledDate?: string;
    executorType?: ExecutorType;
    engineerId?: number;
    contractorId?: number;
    notes?: string;
    workItemIds: number[];
    createdBy?: number;
  }): Promise<DispatchPackage> {
    const count = await this.repo.count();
    const code = `DP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(count + 1).padStart(3, '0')}`;

    const pkg = this.repo.create({
      packageCode: code,
      title: dto.title,
      priority: dto.priority || 'medium',
      scheduledDate: dto.scheduledDate,
      executorType: dto.executorType || ExecutorType.INTERNAL,
      engineerId: dto.engineerId,
      contractorId: dto.contractorId,
      notes: dto.notes,
      status: DispatchStatus.DRAFT,
      createdBy: dto.createdBy,
    });
    const saved = await this.repo.save(pkg);

    // Create package items and update work item status to ASSIGNED
    for (let i = 0; i < dto.workItemIds.length; i++) {
      await this.itemRepo.save({
        packageId: saved.id,
        workItemId: dto.workItemIds[i],
        sortOrder: i,
      });
      await this.workItemRepo.update(dto.workItemIds[i], { status: WorkItemStatus.ASSIGNED });
    }

    return this.findOne(saved.id);
  }

  async updateStatus(id: number, status: DispatchStatus): Promise<DispatchPackage> {
    const pkg = await this.findOne(id);
    pkg.status = status;
    if (status === DispatchStatus.COMPLETED) {
      pkg.completedDate = new Date().toISOString().slice(0, 10);
    }
    return this.repo.save(pkg);
  }

  async assignEngineer(id: number, engineerId: number): Promise<DispatchPackage> {
    const pkg = await this.findOne(id);
    pkg.engineerId = engineerId;
    pkg.executorType = ExecutorType.INTERNAL;
    pkg.status = DispatchStatus.ASSIGNED;
    return this.repo.save(pkg);
  }

  async assignContractor(id: number, contractorId: number): Promise<DispatchPackage> {
    const pkg = await this.findOne(id);
    pkg.contractorId = contractorId;
    pkg.executorType = ExecutorType.CONTRACTOR;
    pkg.status = DispatchStatus.ASSIGNED;
    return this.repo.save(pkg);
  }

  async remove(id: number): Promise<void> {
    const pkg = await this.findOne(id);
    await this.itemRepo.delete({ packageId: id });
    await this.repo.remove(pkg);
  }

  // Simple suggest: group by site
  async suggest(workItemIds: number[]): Promise<any[]> {
    const items = await this.workItemRepo.findByIds(workItemIds);
    const groups = new Map<number, WorkItem[]>();
    for (const item of items) {
      const siteId = item.siteId || 0;
      if (!groups.has(siteId)) groups.set(siteId, []);
      groups.get(siteId).push(item);
    }
    const result = [];
    for (const [siteId, siteItems] of groups) {
      result.push({
        siteId,
        count: siteItems.length,
        totalEstimatedMinutes: siteItems.reduce((s, i) => s + (i.estimatedMinutes || 0), 0),
      });
    }
    return result;
  }
}
