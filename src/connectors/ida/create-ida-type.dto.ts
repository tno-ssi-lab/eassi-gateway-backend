import {
  IsNotEmpty,
  IsString,
  IsNotEmptyObject,
  IsArray,
} from 'class-validator';

export class CreateIdaTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  context: string;

  // For now, this will be packaged inside a single IDA predicate
  @IsNotEmptyObject()
  attributes: object[];
  // @IsString({ each: true })
  // @IsNotEmpty({ each: true })
  // atributes: string[];
}
