import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device, DeviceStatus, DeviceType } from './entities/device.entity';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private devicesRepository: Repository<Device>,
  ) {}

  async findAll(): Promise<Device[]> {
    return this.devicesRepository.find();
  }

  async findOne(id: number): Promise<Device> {
    const device = await this.devicesRepository.findOne({ where: { id } });
    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }
    return device;
  }

  async create(createDeviceDto: Partial<Device>): Promise<Device> {
    // Check if serial number already exists
    const existingDevice = await this.devicesRepository.findOne({
      where: { serialNumber: createDeviceDto.serialNumber },
    });

    if (existingDevice) {
      throw new BadRequestException(`Device with serial number ${createDeviceDto.serialNumber} already exists`);
    }

    const newDevice = this.devicesRepository.create(createDeviceDto);
    return this.devicesRepository.save(newDevice);
  }

  async update(id: number, updateDeviceDto: Partial<Device>): Promise<Device> {
    const device = await this.findOne(id);

    // If updating serial number, check for duplicates
    if (updateDeviceDto.serialNumber && updateDeviceDto.serialNumber !== device.serialNumber) {
      const existingDevice = await this.devicesRepository.findOne({
        where: { serialNumber: updateDeviceDto.serialNumber },
      });

      if (existingDevice) {
        throw new BadRequestException(`Device with serial number ${updateDeviceDto.serialNumber} already exists`);
      }
    }

    Object.assign(device, updateDeviceDto);
    return this.devicesRepository.save(device);
  }

  async remove(id: number): Promise<void> {
    const device = await this.findOne(id);
    await this.devicesRepository.remove(device);
  }

  async updateStatus(id: number, status: DeviceStatus): Promise<Device> {
    const device = await this.findOne(id);
    device.status = status;

    // Update lastSeenAt when status changes to online
    if (status === DeviceStatus.ONLINE) {
      device.lastSeenAt = new Date();
    }

    return this.devicesRepository.save(device);
  }

  async updateTelemetryData(id: number, telemetryData: any): Promise<Device> {
    const device = await this.findOne(id);
    device.telemetryData = telemetryData;
    device.lastSeenAt = new Date();

    return this.devicesRepository.save(device);
  }

  async getDeviceStats(): Promise<any> {
    const devices = await this.devicesRepository.find();

    const stats = {
      total: devices.length,
      online: devices.filter(d => d.status === DeviceStatus.ONLINE).length,
      offline: devices.filter(d => d.status === DeviceStatus.OFFLINE).length,
      warning: devices.filter(d => d.status === DeviceStatus.WARNING).length,
      error: devices.filter(d => d.status === DeviceStatus.ERROR).length,
    };

    return stats;
  }
}
