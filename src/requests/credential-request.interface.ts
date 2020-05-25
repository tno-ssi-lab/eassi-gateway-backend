import { Organization } from '../organizations/organization.entity';
import { CredentialType } from 'src/types/credential-type.entity';

export interface CredentialRequest {
  requestId: string;
  jwtId: string;
  hash: string;
  iss: string;
  callbackUrl: string;
  type: CredentialType;
  requestor: Organization;
}
