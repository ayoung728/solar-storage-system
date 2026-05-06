import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceRecord, MaintenanceStatus } from './entities/maintenance.entity';

describe('MaintenanceService', () => {
  let service: MaintenanceService;
  let repository: Repository<MaintenanceRecord>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaintenanceService,
        {
          provide: getRepositoryToken(MaintenanceRecord),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<MaintenanceService>(MaintenanceService);
    repository = module.get<Repository<MaintenanceRecord>>(getRepositoryToken(MaintenanceRecord));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of maintenance records', async () => {
      const mockRecords = [
        { id: 1, title: 'Routine check', status: MaintenanceStatus.SCHEDULED },
        { id: 2, title: 'Repair', status: MaintenanceStatus.SCHEDULED },
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(mockRecords as MaintenanceRecord[]);

      const result = await service.findAll();
      expect(result).toEqual(mockRecords);
    });
  });

  describe('findOne', () => {
    it('should return a single maintenance record', async () => {
      const mockRecord = { id: 1, title: 'Test record' } as MaintenanceRecord;
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockRecord);

      const result = await service.findOne(1);
      expect(result).toEqual(mockRecord);
    });

    it('should throw NotFoundException if record not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow('Maintenance record with ID 999 not found');
    });
  });

  describe('create', () => {
    it('should create and return a maintenance record', async () => {
      const mockRecord = { id: 1, title: 'New record' } as MaintenanceRecord;
      jest.spyOn(repository, 'create').mockReturnValue(mockRecord);
      jest.spyOn(repository, 'save').mockResolvedValue(mockRecord);

      const result = await service.create({ title: 'New record' });
      expect(result).toEqual(mockRecord);
    });
  });

  describe('updateStatus', () => {
    it('should update and return a maintenance record', async () => {
      const mockRecord = { id: 1, status: MaintenanceStatus.SCHEDULED } as MaintenanceRecord;
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockRecord);
      jest.spyOn(repository, 'save').mockResolvedValue({ ...mockRecord, status: MaintenanceStatus.COMPLETED });

      const result = await service.updateStatus(1, MaintenanceStatus.COMPLETED);
      expect(result.status).toBe(MaintenanceStatus.COMPLETED);
    });
  });

  describe('getMaintenanceStats', () => {
    it('should return maintenance statistics', async () => {
      const mockRecords = [
        { id: 1, status: MaintenanceStatus.SCHEDULED },
        { id: 2, status: MaintenanceStatus.COMPLETED },
        { id: 3, status: MaintenanceStatus.IN_PROGRESS },
      ] as MaintenanceRecord[];
      jest.spyOn(repository, 'find').mockResolvedValue(mockRecords);

      const result = await service.getMaintenanceStats();
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('scheduled');
      expect(result).toHaveProperty('completed');
    });
  });

  describe('getUpcomingMaintenance', () => {
    it('should return maintenance records scheduled in the future', async () => {
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const mockRecords = [
        { id: 1, scheduledDate: nextWeek },
      ] as MaintenanceRecord[];
      jest.spyOn(repository, 'find').mockResolvedValue(mockRecords);

      const result = await service.getUpcomingMaintenance();
      expect(result).toHaveLength(1);
    });
  });

  describe('getDeviceMaintenanceHistory', () => {
    it('should return maintenance records for a specific device', async () => {
      const mockRecords = [
        { id: 1, deviceId: 101 },
      ] as MaintenanceRecord[];
      jest.spyOn(repository, 'find').mockResolvedValue(mockRecords);

      const result = await service.getDeviceMaintenanceHistory(101);
      expect(result).toEqual(mockRecords);
    });
  });

  describe('completeMaintenance', () => {
    it('should mark a maintenance record as completed with date and cost', async () => {
      const mockRecord = { id: 1, status: MaintenanceStatus.SCHEDULED } as MaintenanceRecord;
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockRecord);
      jest.spyOn(repository, 'save').mockResolvedValue({
        ...mockRecord,
        status: MaintenanceStatus.COMPLETED,
        completedDate: expect.any(Date),
        estimatedCost: 500,
      });

      const result = await service.completeMaintenance(1, { estimatedCost: 500 });
      expect(result.status).toBe(MaintenanceStatus.COMPLETED);
      expect(result.completedDate).toBeDefined();
    });
  });
});
