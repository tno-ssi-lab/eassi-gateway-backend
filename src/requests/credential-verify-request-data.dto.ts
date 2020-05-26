import { IsNotEmpty, IsString } from 'class-validator';

export class CredentialVerifyRequestData {
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
