import { Injectable, NotImplementedException } from '@nestjs/common';
import { ConnectorService } from '../connector-service.interface';
import { Organization } from 'src/organizations/organization.entity';
import { CredentialIssueRequest } from 'src/requests/credential-issue-request.entity';
import { CredentialVerifyRequest } from 'src/requests/credential-verify-request.entity';
import { sign, verify } from 'jsonwebtoken';

// import * as idaCredentials from './ida-credentials.json';

@Injectable()
export class IdaService implements ConnectorService {
  name = 'ida';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async registerOrganization(organization: Organization) {
    // For now, we don't need to do anything for IDA.
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canIssueCredentialRequest(request: CredentialIssueRequest) {
    // Issuing IDA crendentials still has to be implemented.
    return false;
  }

  canVerifyCredentialRequest(request: CredentialVerifyRequest) {
    // Verifying IDA crendentials still has to be implemented.
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handleIssueCredentialRequest(issueRequest: CredentialIssueRequest) {
    throw new NotImplementedException('Cannot issue IDA credentials yet');
  }

  async handleVerifyCredentialRequest(verifyRequest: CredentialVerifyRequest) {
    throw new NotImplementedException('Cannot verify IDA credentials yet');
  }

  async handleVerifyCredentialDisclosure(
    verifyRequest: CredentialVerifyRequest,
    body: { jwt: string },
  ) {
    throw new NotImplementedException('Cannot verify IDA credentials yet');
  }
}
