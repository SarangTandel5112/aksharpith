import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DepartmentResponseDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() name: string;
  @ApiPropertyOptional() @Expose() code: string | null;
  @ApiPropertyOptional() @Expose() description: string | null;
  @ApiProperty() @Expose() isActive: boolean;
  @ApiProperty() @Expose() createdAt: Date;
  @ApiPropertyOptional() @Expose() updatedAt: Date | null;

  constructor(partial: Partial<DepartmentResponseDto>) {
    Object.assign(this, partial);
  }
}
