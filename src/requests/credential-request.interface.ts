import { Organization } from '../organizations/organization.entity';
import { CredentialType } from 'src/types/credential-type.entity';

export interface CredentialRequest {
  requestId: string;
  iss: string;
  type: CredentialType;
  callbackUrl: string;
  requestor: Organization;
}
