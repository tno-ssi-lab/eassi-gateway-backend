import { IsNotEmpty, IsString, IsObject } from 'class-validator';
import { CredentialRequestData } from './credential-request-data.interface';

type AttributeName = string;
type AttributeValue = string | number | boolean;

export type CredentialData = Record<AttributeName, AttributeValue>;

export class CredentialIssueRequestData implements CredentialRequestData {
  @IsString()
  @IsNotEmpty()
  jti: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  callbackUrl: string;

  @IsObject()
  @IsNotEmpty()
  data: CredentialData;
}
