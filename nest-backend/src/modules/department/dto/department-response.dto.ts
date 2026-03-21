import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class DepartmentResponseDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() name: string;
  @ApiProperty() @Expose() isActive: boolean;
  @ApiProperty() @Expose() createdAt: Date;
  @ApiProperty() @Expose() updatedAt: Date;

  constructor(partial: Partial<DepartmentResponseDto>) {
    Object.assign(this, partial);
  }
}
