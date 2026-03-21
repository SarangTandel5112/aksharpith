import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RoleResponseDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() roleName: string;
  @ApiProperty() @Expose() isActive: boolean;
  @ApiProperty() @Expose() createdAt: Date;
  @ApiProperty() @Expose() updatedAt: Date;

  constructor(partial: Partial<RoleResponseDto>) {
    Object.assign(this, partial);
  }
}
