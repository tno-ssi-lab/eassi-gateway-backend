import { IsNotEmpty, IsString } from 'class-validator';
import { CredentialRequestData } from './credential-request-data.interface';

export class CredentialVerifyRequestData implements CredentialRequestData {
  @IsString()
  @IsNotEmpty()
  jti: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  callbackUrl: string;
}
