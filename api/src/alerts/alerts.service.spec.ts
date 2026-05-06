import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertsService } from './alerts.service';
import { Alert, AlertSeverity, AlertStatus } from './entities/alert.entity';

describe('AlertsService', () => {
  let service: AlertsService;
  let repository: Repository<Alert>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsService,
        {
          provide: getRepositoryToken(Alert),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<AlertsService>(AlertsService);
    repository = module.get<Repository<Alert>>(getRepositoryToken(Alert));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of alerts', async () => {
      const mockAlerts = [
        { id: 1, severity: AlertSeverity.HIGH, message: 'Test alert 1' },
        { id: 2, severity: AlertSeverity.LOW, message: 'Test alert 2' },
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(mockAlerts as Alert[]);

      const result = await service.findAll();
      expect(result).toEqual(mockAlerts);
    });
  });

  describe('findOne', () => {
    it('should return a single alert', async () => {
      const mockAlert = { id: 1, severity: AlertSeverity.HIGH, message: 'Test alert' } as Alert;
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockAlert);

      const result = await service.findOne(1);
      expect(result).toEqual(mockAlert);
    });

    it('should throw NotFoundException if alert not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow('Alert with ID 999 not found');
    });
  });

  describe('create', () => {
    it('should create and return an alert', async () => {
      const mockAlert = { id: 1, severity: AlertSeverity.HIGH, message: 'New alert' } as Alert;
      jest.spyOn(repository, 'create').mockReturnValue(mockAlert);
      jest.spyOn(repository, 'save').mockResolvedValue(mockAlert);

      const result = await service.create({ message: 'New alert', severity: AlertSeverity.HIGH });
      expect(result).toEqual(mockAlert);
    });
  });

  describe('updateStatus', () => {
    it('should update and return an alert', async () => {
      const mockAlert = { id: 1, status: AlertStatus.UNRESOLVED, message: 'Test alert' } as Alert;
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockAlert);
      jest.spyOn(repository, 'save').mockResolvedValue({ ...mockAlert, status: AlertStatus.RESOLVED });

      const result = await service.updateStatus(1, AlertStatus.RESOLVED);
      expect(result.status).toBe(AlertStatus.RESOLVED);
    });
  });

  describe('getAlertStats', () => {
    it('should return alert statistics', async () => {
      const mockAlerts = [
        { id: 1, severity: AlertSeverity.HIGH, status: AlertStatus.UNRESOLVED },
        { id: 2, severity: AlertSeverity.LOW, status: AlertStatus.RESOLVED },
        { id: 3, severity: AlertSeverity.CRITICAL, status: AlertStatus.UNRESOLVED },
      ] as Alert[];
      jest.spyOn(repository, 'find').mockResolvedValue(mockAlerts);

      const result = await service.getAlertStats();
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('unresolved');
      expect(result).toHaveProperty('resolved');
    });
  });

  describe('getCriticalAlerts', () => {
    it('should return only critical alerts', async () => {
      const mockAlerts = [
        { id: 1, severity: AlertSeverity.CRITICAL, status: AlertStatus.UNRESOLVED },
        { id: 2, severity: AlertSeverity.HIGH, status: AlertStatus.UNRESOLVED },
      ] as Alert[];
      jest.spyOn(repository, 'find').mockResolvedValue(mockAlerts);

      const result = await service.getCriticalAlerts();
      expect(result).toHaveLength(1);
      expect(result[0].severity).toBe(AlertSeverity.CRITICAL);
    });
  });

  describe('clearResolvedAlerts', () => {
    it('should remove resolved alerts older than 30 days', async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 31);

      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 5 }),
      } as any);

      const result = await service.clearResolvedAlerts();
      expect(result).toEqual({ affected: 5 });
    });
  });
});
