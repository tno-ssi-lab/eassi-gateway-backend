import { IsNotEmpty, IsString, IsObject } from 'class-validator';

type AttributeName = string;
type AttributeValue = string | number | boolean;

export type CredentialData = Map<AttributeName, AttributeValue>;

export class CredentialIssueRequestData {
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
  data: CredentialData;
}
