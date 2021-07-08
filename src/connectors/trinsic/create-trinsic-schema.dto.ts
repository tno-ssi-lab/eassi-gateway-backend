import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateTrinsicSchemaDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @Matches(/^\d+(\.\d+)*$/)
  version: string;

  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  attributeNames: string[];

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  trinsicSchemaId?: string;
}
