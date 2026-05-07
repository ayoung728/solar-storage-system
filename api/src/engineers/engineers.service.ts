import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Engineer } from './entities/engineer.entity';
import { EngineerSchedule } from './entities/engineer-schedule.entity';

@Injectable()
export class EngineersService {
  constructor(
    @InjectRepository(Engineer)
    private repo: Repository<Engineer>,
    @InjectRepository(EngineerSchedule)
    private scheduleRepo: Repository<EngineerSchedule>,
  ) {}

  async findAll(): Promise<Engineer[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<Engineer> {
    const e = await this.repo.findOne({ where: { id } });
    if (!e) throw new NotFoundException(`Engineer ${id} not found`);
    return e;
  }

  async create(dto: Partial<Engineer>): Promise<Engineer> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: number, dto: Partial<Engineer>): Promise<Engineer> {
    const e = await this.findOne(id);
    Object.assign(e, dto);
    return this.repo.save(e);
  }

  async updateStatus(id: number, isActive: boolean): Promise<Engineer> {
    const e = await this.findOne(id);
    e.isActive = isActive;
    return this.repo.save(e);
  }

  // Schedule
  async getSchedule(engineerId: number, month: string): Promise<EngineerSchedule[]> {
    const [year, m] = month.split('-').map(Number);
    const start = `${year}-${String(m).padStart(2, '0')}-01`;
    const endDate = new Date(year, m, 0);
    const end = `${year}-${String(m).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
    return this.scheduleRepo.find({
      where: { engineerId, workDate: { $between: [start, end] } as any },
      order: { workDate: 'ASC' },
    });
  }

  async getTodaySchedule(): Promise<any[]> {
    const today = new Date().toISOString().slice(0, 10);
    return this.scheduleRepo.find({
      where: { workDate: today },
      relations: ['engineer'],
    });
  }

  // Generate 做2休2 schedule for a month
  async generateSchedule(year: number, month: number): Promise<{ created: number }> {
    const engineers = await this.repo.find({ where: { isActive: true } });
    const daysInMonth = new Date(year, month, 0).getDate();
    let created = 0;

    const dayGroup = engineers.filter(e => e.shiftGroup === 'day');
    const nightGroup = engineers.filter(e => e.shiftGroup === 'night');
    const backupGroup = engineers.filter(e => e.shiftGroup === 'backup');

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayOfWeek = new Date(year, month - 1, day).getDay(); // 0=Sun

      // Day shift (做2休2: P1, P1, P2, P2, P1, P1, ...)
      if (dayGroup.length >= 2) {
        const idx = Math.floor((day - 1) / 2) % 2;
        const engineer = dayGroup[idx];
        await this.scheduleRepo.save({ engineerId: engineer.id, workDate: date, shift: 'day' });
        created++;
      }

      // Night shift
      if (nightGroup.length >= 2) {
        const idx = Math.floor((day - 1) / 2) % 2;
        const engineer = nightGroup[idx];
        await this.scheduleRepo.save({ engineerId: engineer.id, workDate: date, shift: 'night' });
        created++;
      }

      // Backup (weekdays only)
      if (backupGroup.length > 0 && dayOfWeek >= 1 && dayOfWeek <= 5) {
        const engineer = backupGroup[0];
        await this.scheduleRepo.save({ engineerId: engineer.id, workDate: date, shift: 'backup' });
        created++;
      }
    }

    return { created };
  }

  async addSchedule(dto: { engineerId: number; workDate: string; shift: string; note?: string }): Promise<EngineerSchedule> {
    return this.scheduleRepo.save(this.scheduleRepo.create(dto));
  }

  async updateSchedule(id: number, dto: Partial<EngineerSchedule>): Promise<EngineerSchedule> {
    const s = await this.scheduleRepo.findOne({ where: { id } });
    if (!s) throw new NotFoundException(`Schedule ${id} not found`);
    Object.assign(s, dto);
    return this.scheduleRepo.save(s);
  }

  async removeSchedule(id: number): Promise<void> {
    await this.scheduleRepo.delete(id);
  }

  async swapSchedule(id1: number, id2: number): Promise<void> {
    const s1 = await this.scheduleRepo.findOne({ where: { id: id1 } });
    const s2 = await this.scheduleRepo.findOne({ where: { id: id2 } });
    if (!s1 || !s2) throw new NotFoundException('Schedule not found');
    const tempEngineer = s1.engineerId;
    s1.engineerId = s2.engineerId;
    s2.engineerId = tempEngineer;
    await this.scheduleRepo.save([s1, s2]);
  }
}
