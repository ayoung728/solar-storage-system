import { Controller, Get, Post, Put, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ExecutionsService } from './executions.service';
import { ExecutionRecord } from './entities/execution-record.entity';
import { ExecutionPhoto } from './entities/execution-photo.entity';

@Controller('api/executions')
export class ExecutionsController {
  constructor(private readonly service: ExecutionsService) {}

  @Get()
  async findAll(@Param('status') status?: string): Promise<ExecutionRecord[]> {
    return this.service.findAll(status);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ExecutionRecord> {
    return this.service.findOne(id);
  }

  @Post()
  async create(@Body('dispatchPackageId', ParseIntPipe) dispatchPackageId: number): Promise<ExecutionRecord> {
    return this.service.create(dispatchPackageId);
  }

  @Put(':id/accept')
  async accept(@Param('id', ParseIntPipe) id: number): Promise<ExecutionRecord> {
    return this.service.accept(id);
  }

  @Put(':id/start')
  async start(@Param('id', ParseIntPipe) id: number): Promise<ExecutionRecord> {
    return this.service.start(id);
  }

  @Put(':id/sign')
  async sign(
    @Param('id', ParseIntPipe) id: number,
    @Body('customerName') customerName: string,
    @Body('signaturePath') signaturePath: string,
  ): Promise<ExecutionRecord> {
    return this.service.sign(id, customerName, signaturePath);
  }

  @Put(':id/acceptance')
  async submitAcceptance(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
    @Body('notes') notes?: string,
  ): Promise<ExecutionRecord> {
    return this.service.submitAcceptance(id, status, notes);
  }

  @Put(':id/complete')
  async complete(@Param('id', ParseIntPipe) id: number): Promise<ExecutionRecord> {
    return this.service.complete(id);
  }

  @Get(':id/photos')
  async getPhotos(@Param('id', ParseIntPipe) id: number): Promise<ExecutionPhoto[]> {
    return this.service.getPhotos(id);
  }

  @Post(':id/photos')
  async addPhoto(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { workItemId?: number; stepOrder?: number; photoType: string; filePath: string; description?: string },
  ): Promise<ExecutionPhoto> {
    return this.service.addPhoto(id, dto);
  }
}
