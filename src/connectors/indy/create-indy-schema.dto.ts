import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateJolocomTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @Matches(/^\d+(\.\d+)*$/)
  version: string;

  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  attributes: string[];
}
