import {
  IsNotEmpty,
  IsString,
  Matches,
  IsOptional
} from 'class-validator';

export class CreateWaltidSchemaDto {
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
  waltidSchemaId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  waltidCredentialDefinitionId?: string;
}
