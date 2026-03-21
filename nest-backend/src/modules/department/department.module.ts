import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { DepartmentRepository } from './department.repository';
import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Department])],
  providers: [DepartmentRepository, DepartmentService],
  controllers: [DepartmentController],
  exports: [DepartmentRepository, DepartmentService],
})
export class DepartmentModule {}
