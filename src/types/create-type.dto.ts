import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateTypeDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsOptional()
  @IsString()
  irmaType: string;

  @IsNumber()
  jolocomCredentialTypeId: number;

  @IsNumber()
  organizationId: number;
}
