import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateTypeDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsOptional()
  @IsString()
  irmaType: string;

  @IsOptional()
  @IsNumber()
  jolocomCredentialTypeId: number;

  @IsOptional()
  @IsNumber()
  indySchemaId: number;

  @IsOptional()
  @IsNumber()
  trinsicSchemaId: number;

  @IsNumber()
  organizationId: number;
}
