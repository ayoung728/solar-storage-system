import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { Device, DeviceStatus, DeviceType } from './entities/device.entity';

describe('DeviceService', () => {
  let service: DevicesService;
  let repository: Repository<Device>;

  const mockDevice: Partial<Device> = {
    id: 1,
    serialNumber: 'SN001',
    deviceType: DeviceType.SOLAR_PANEL,
    name: 'Solar Panel 1',
    status: DeviceStatus.ONLINE,
    location: 'Roof A',
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevicesService,
        { provide: getRepositoryToken(Device), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<DevicesService>(DevicesService);
    repository = module.get<Repository<Device>>(getRepositoryToken(Device));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of devices', async () => {
      mockRepository.find.mockResolvedValue([mockDevice as Device]);

      const result = await service.findAll();

      expect(result).toEqual([mockDevice]);
    });
  });

  describe('findOne', () => {
    it('should return a device by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockDevice as Device);

      const result = await service.findOne(1);

      expect(result).toEqual(mockDevice);
    });

    it('should throw NotFoundException if device not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a new device', async () => {
      const createDto = {
        serialNumber: 'SN002',
        deviceType: DeviceType.SOLAR_PANEL,
        name: 'Battery 1',
        location: 'Basement B',
      };

      mockRepository.create.mockReturnValue({ ...mockDevice, id: 2 });
      mockRepository.save.mockResolvedValue({ ...mockDevice, id: 2 });

      const result = await service.create(createDto as any);

      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
    });

    it('should throw BadRequestException if serialNumber already exists', async () => {
      const createDto = {
        serialNumber: 'SN001', // duplicate
        deviceType: DeviceType.INVERTER,
        name: 'Inverter 1',
      };

      mockRepository.findOne.mockResolvedValue(mockDevice as Device);

      await expect(service.create(createDto as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStatus', () => {
    it('should update device status and return the updated device', async () => {
      const deviceId = 1;
      const status: DeviceStatus = DeviceStatus.OFFLINE;

      mockRepository.findOne.mockResolvedValue(mockDevice as Device);
      mockRepository.save.mockResolvedValue({ ...mockDevice, status: DeviceStatus.OFFLINE });

      const result = await service.updateStatus(deviceId, status);

      expect(result).toHaveProperty('status', DeviceStatus.OFFLINE);
    });
  });

  describe('updateTelemetryData', () => {
    it('should update device telemetry data and return the updated device', async () => {
      const deviceId = 1;
      const telemetryData = { voltage: 220, current: 5.5 };

      mockRepository.findOne.mockResolvedValue(mockDevice as Device);
      mockRepository.save.mockResolvedValue({ ...mockDevice, telemetryData });

      const result = await service.updateTelemetryData(deviceId, telemetryData);

      expect(result).toHaveProperty('telemetryData');
    });
  });
});
