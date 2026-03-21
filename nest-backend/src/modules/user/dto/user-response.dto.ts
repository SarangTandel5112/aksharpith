import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoleResponseDto } from '../../role/dto/role-response.dto';

export class UserResponseDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() firstName: string;
  @ApiPropertyOptional() @Expose() middleName: string | null;
  @ApiProperty() @Expose() lastName: string;
  @ApiProperty() @Expose() email: string;
  @ApiProperty() @Expose() roleId: string;
  @ApiPropertyOptional() @Expose() @Type(() => RoleResponseDto) role?: RoleResponseDto;
  @ApiProperty() @Expose() isActive: boolean;
  @ApiProperty() @Expose() createdAt: Date;
  @ApiProperty() @Expose() updatedAt: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
