import { Organization } from '../organizations/organization.entity';

export interface CredentialRequest {
  requestId: string;
  iss: string;
  type: string;
  callbackUrl: string;
  requestor: Organization;
}
