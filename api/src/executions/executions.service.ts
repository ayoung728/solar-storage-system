import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExecutionRecord, ExecutionStatus } from './entities/execution-record.entity';
import { ExecutionPhoto } from './entities/execution-photo.entity';

@Injectable()
export class ExecutionsService {
  constructor(
    @InjectRepository(ExecutionRecord)
    private repo: Repository<ExecutionRecord>,
    @InjectRepository(ExecutionPhoto)
    private photoRepo: Repository<ExecutionPhoto>,
  ) {}

  async findAll(status?: string): Promise<ExecutionRecord[]> {
    const where: any = {};
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<ExecutionRecord> {
    const rec = await this.repo.findOne({ where: { id } });
    if (!rec) throw new NotFoundException(`ExecutionRecord ${id} not found`);
    return rec;
  }

  async create(dispatchPackageId: number): Promise<ExecutionRecord> {
    const rec = this.repo.create({ dispatchPackageId, executorType: 'internal' });
    return this.repo.save(rec);
  }

  async accept(id: number): Promise<ExecutionRecord> {
    const rec = await this.findOne(id);
    rec.status = ExecutionStatus.ACCEPTED;
    rec.acceptedAt = new Date();
    return this.repo.save(rec);
  }

  async start(id: number): Promise<ExecutionRecord> {
    const rec = await this.findOne(id);
    rec.status = ExecutionStatus.IN_PROGRESS;
    rec.startedAt = new Date();
    return this.repo.save(rec);
  }

  async sign(id: number, customerName: string, signaturePath: string): Promise<ExecutionRecord> {
    const rec = await this.findOne(id);
    rec.customerName = customerName;
    rec.customerSignature = signaturePath;
    rec.signedAt = new Date();
    rec.status = ExecutionStatus.AWAITING_ACCEPTANCE;
    return this.repo.save(rec);
  }

  async submitAcceptance(id: number, status: string, notes?: string): Promise<ExecutionRecord> {
    const rec = await this.findOne(id);
    rec.acceptanceStatus = status;
    rec.acceptanceNotes = notes;
    rec.acceptedAt2 = new Date();
    if (status === 'passed') {
      rec.status = ExecutionStatus.COMPLETED;
      rec.completedAt = new Date();
    }
    return this.repo.save(rec);
  }

  async complete(id: number): Promise<ExecutionRecord> {
    const rec = await this.findOne(id);
    rec.status = ExecutionStatus.COMPLETED;
    rec.completedAt = new Date();
    return this.repo.save(rec);
  }

  // Photos
  async getPhotos(executionId: number): Promise<ExecutionPhoto[]> {
    return this.photoRepo.find({ where: { executionRecordId: executionId }, order: { uploadedAt: 'ASC' } });
  }

  async addPhoto(executionId: number, dto: { workItemId?: number; stepOrder?: number; photoType: string; filePath: string; description?: string }): Promise<ExecutionPhoto> {
    const photo = this.photoRepo.create({ ...dto, executionRecordId: executionId });
    return this.photoRepo.save(photo);
  }
}
