import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Customer } from './entities/customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private repo: Repository<Customer>,
  ) {}

  async findAll(search?: string): Promise<Customer[]> {
    if (search) {
      return this.repo.find({
        where: [
          { name: Like(`%${search}%`) },
          { code: Like(`%${search}%`) },
          { contactPerson: Like(`%${search}%`) },
        ],
      });
    }
    return this.repo.find();
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.repo.findOne({ where: { id }, relations: ['sites'] });
    if (!customer) throw new NotFoundException(`Customer ${id} not found`);
    return customer;
  }

  async create(dto: Partial<Customer>): Promise<Customer> {
    const count = await this.repo.count();
    const code = `CUST-${String(count + 1).padStart(3, '0')}`;
    const customer = this.repo.create({ ...dto, code });
    return this.repo.save(customer);
  }

  async update(id: number, dto: Partial<Customer>): Promise<Customer> {
    const customer = await this.findOne(id);
    Object.assign(customer, dto);
    return this.repo.save(customer);
  }

  async remove(id: number): Promise<void> {
    const customer = await this.findOne(id);
    await this.repo.remove(customer);
  }
}
