import { Injectable, NotImplementedException } from '@nestjs/common';
import { Organization } from '../../organizations/organization.entity';
import { CredentialIssueRequest } from '../../requests/credential-issue-request.entity';
import { CredentialVerifyRequest } from '../../requests/credential-verify-request.entity';
import { ConnectorService } from '../connector-service.interface';

@Injectable()
export class IndyService implements ConnectorService {
  name = 'indy';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async registerOrganization(organization: Organization) {
    // We don't need to do anything for IRMA.
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canIssueCredentialRequest(request: CredentialIssueRequest) {
    // We cannot issue IRMA credentials right now.
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canVerifyCredentialRequest(request: CredentialVerifyRequest) {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handleIssueCredentialRequest(issueRequest: CredentialIssueRequest) {
    throw new NotImplementedException('Cannot issue Indy credentials');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handleVerifyCredentialRequest(verifyRequest: CredentialVerifyRequest) {
    throw new NotImplementedException('Cannot verify Indy credentials');
  }

  async handleVerifyCredentialDisclosure() {
    throw new NotImplementedException('Cannot verify Indy credentials');
  }
}
