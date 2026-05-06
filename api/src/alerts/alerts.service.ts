import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert, AlertSeverity, AlertStatus } from './entities/alert.entity';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alert)
    private alertsRepository: Repository<Alert>,
  ) {}

  async findAll(): Promise<Alert[]> {
    return this.alertsRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Alert> {
    const alert = await this.alertsRepository.findOne({ where: { id } });
    if (!alert) {
      throw new NotFoundException(`Alert with ID ${id} not found`);
    }
    return alert;
  }

  async create(createAlertDto: Partial<Alert>): Promise<Alert> {
    const newAlert = this.alertsRepository.create(createAlertDto);
    return this.alertsRepository.save(newAlert);
  }

  async updateStatus(id: number, status: AlertStatus): Promise<Alert> {
    const alert = await this.findOne(id);
    alert.status = status;

    if (status === AlertStatus.RESOLVED) {
      alert.resolvedAt = new Date();
    }

    return this.alertsRepository.save(alert);
  }

  async getAlertStats(): Promise<any> {
    const alerts = await this.alertsRepository.find();

    const stats = {
      total: alerts.length,
      unresolved: alerts.filter(a => a.status === AlertStatus.UNRESOLVED).length,
      acknowledged: alerts.filter(a => a.status === AlertStatus.ACKNOWLEDGED).length,
      resolved: alerts.filter(a => a.status === AlertStatus.RESOLVED).length,
      bySeverity: {
        critical: alerts.filter(a => a.severity === AlertSeverity.CRITICAL).length,
        high: alerts.filter(a => a.severity === AlertSeverity.HIGH).length,
        medium: alerts.filter(a => a.severity === AlertSeverity.MEDIUM).length,
        low: alerts.filter(a => a.severity === AlertSeverity.LOW).length,
      },
    };

    return stats;
  }

  async getCriticalAlerts(): Promise<Alert[]> {
    return this.alertsRepository.find({
      where: { severity: AlertSeverity.CRITICAL },
      order: { createdAt: 'DESC' },
    });
  }

  async clearResolvedAlerts(): Promise<{ affected: number }> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.alertsRepository
      .createQueryBuilder()
      .delete()
      .from(Alert)
      .where('status = :status AND createdAt < :date', {
        status: AlertStatus.RESOLVED,
        date: thirtyDaysAgo,
      })
      .execute();

    return { affected: result.affected };
  }
}
