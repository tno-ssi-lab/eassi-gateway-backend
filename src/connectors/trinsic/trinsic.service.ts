import { Injectable, NotImplementedException } from '@nestjs/common';
import { ConnectorService } from '../connector-service.interface';
import { Organization } from '../../organizations/organization.entity';
import { CredentialIssueRequest } from 'src/requests/credential-issue-request.entity';
import { CredentialVerifyRequest } from 'src/requests/credential-verify-request.entity';
import { sign, verify } from 'jsonwebtoken';

// import * as trinsicCredentials from './trinsic-credentials.json';

@Injectable()
export class TrinsicService implements ConnectorService {
  name = 'trinsic';

  /* ConnectorService methods */

  async registerOrganization(organization: Organization) {
    // TODO
    return;
  }

  canIssueCredentialRequest(request: CredentialIssueRequest) {
    // TODO
    return false
  }

  canVerifyCredentialRequest(request: CredentialVerifyRequest) {
    // TODO
    return false
  }

  async handleIssueCredentialRequest(request: CredentialIssueRequest) {
    throw new NotImplementedException('Cannot issue IDA credentials yet');
  }

  async handleVerifyCredentialRequest(request: CredentialVerifyRequest) {
    throw new NotImplementedException('Cannot verify IDA credentials yet');
  }

  public async handleVerifyCredentialDisclosure(
    verifyRequest: CredentialVerifyRequest,
    body: { jwt: string },
  ) {
    throw new NotImplementedException('Cannot verify IDA credentials yet');
  }
}