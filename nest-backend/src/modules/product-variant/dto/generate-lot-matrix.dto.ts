import { IsUUID, ArrayMinSize } from 'class-validator';

export class GenerateLotMatrixDto {
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  attributeIds: string[];
}
