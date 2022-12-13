import {
  IsNotEmpty,
  IsString,
  IsNotEmptyObject,
  IsArray,
} from 'class-validator';
import { BaseMetadata } from 'cred-types-jolocom-core/js/types';

export class CreateJolocomTypeDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  context: BaseMetadata['context'];

  @IsNotEmptyObject()
  claimInterface: BaseMetadata['claimInterface'];
}
