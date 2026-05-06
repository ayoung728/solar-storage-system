import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { MaintenanceRecord, MaintenanceStatus } from './entities/maintenance.entity';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(MaintenanceRecord)
    private maintenanceRepository: Repository<MaintenanceRecord>,
  ) {}

  async findAll(): Promise<MaintenanceRecord[]> {
    return this.maintenanceRepository.find({ order: { scheduledDate: 'ASC' } });
  }

  async findOne(id: number): Promise<MaintenanceRecord> {
    const record = await this.maintenanceRepository.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException(`Maintenance record with ID ${id} not found`);
    }
    return record;
  }

  async create(createMaintenanceDto: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    const newRecord = this.maintenanceRepository.create(createMaintenanceDto as any);
    return this.maintenanceRepository.save(newRecord) as unknown as Promise<MaintenanceRecord>;
  }

  async updateStatus(id: number, status: MaintenanceStatus): Promise<MaintenanceRecord> {
    const record = await this.findOne(id);
    record.status = status;

    if (status === MaintenanceStatus.COMPLETED) {
      record.completedDate = new Date();
    }

    return this.maintenanceRepository.save(record);
  }

  async getMaintenanceStats(): Promise<any> {
    const records = await this.maintenanceRepository.find();

    const stats = {
      total: records.length,
      scheduled: records.filter(r => r.status === MaintenanceStatus.SCHEDULED).length,
      inProgress: records.filter(r => r.status === MaintenanceStatus.IN_PROGRESS).length,
      completed: records.filter(r => r.status === MaintenanceStatus.COMPLETED).length,
      cancelled: records.filter(r => r.status === MaintenanceStatus.CANCELLED).length,
    };

    return stats;
  }

  async getUpcomingMaintenance(): Promise<MaintenanceRecord[]> {
    const now = new Date();
    return this.maintenanceRepository.find({
      where: { scheduledDate: MoreThan(now) },
      order: { scheduledDate: 'ASC' },
    });
  }

  async getDeviceMaintenanceHistory(deviceId: number): Promise<MaintenanceRecord[]> {
    return this.maintenanceRepository.find({
      where: { deviceId },
      order: { completedDate: 'DESC' },
    });
  }

  async completeMaintenance(id: number, completionData: { estimatedCost?: number }): Promise<MaintenanceRecord> {
    const record = await this.findOne(id);
    record.status = MaintenanceStatus.COMPLETED;
    record.completedDate = new Date();

    if (completionData.estimatedCost) {
      record.estimatedCost = completionData.estimatedCost;
    }

    return this.maintenanceRepository.save(record);
  }
}
