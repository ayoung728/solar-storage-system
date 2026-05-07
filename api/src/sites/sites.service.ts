import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Site } from './entities/site.entity';

@Injectable()
export class SitesService {
  constructor(
    @InjectRepository(Site)
    private repo: Repository<Site>,
  ) {}

  async findAll(customerId?: number, search?: string): Promise<Site[]> {
    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (search) {
      where.name = Like(`%${search}%`);
    }
    return this.repo.find({ where, relations: ['customer'] });
  }

  async findOne(id: number): Promise<Site> {
    const site = await this.repo.findOne({ where: { id }, relations: ['customer', 'devices'] });
    if (!site) throw new NotFoundException(`Site ${id} not found`);
    return site;
  }

  async create(dto: Partial<Site>): Promise<Site> {
    // Auto-generate code: {customerCode}-{seq}
    const count = await this.repo.count({ where: { customerId: dto.customerId } });
    const code = `SITE-${String(dto.customerId).padStart(3, '0')}-${String(count + 1).padStart(3, '0')}`;
    const site = this.repo.create({ ...dto, code });
    return this.repo.save(site);
  }

  async update(id: number, dto: Partial<Site>): Promise<Site> {
    const site = await this.findOne(id);
    Object.assign(site, dto);
    return this.repo.save(site);
  }

  async updateStatus(id: number, status: string): Promise<Site> {
    const site = await this.findOne(id);
    site.status = status as any;
    return this.repo.save(site);
  }

  async remove(id: number): Promise<void> {
    const site = await this.findOne(id);
    await this.repo.remove(site);
  }
}
