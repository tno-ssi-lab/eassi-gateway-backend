import { Injectable, NotImplementedException } from '@nestjs/common';
import { Organization } from 'src/organizations/organization.entity';
import { CredentialIssueRequest } from 'src/requests/credential-issue-request.entity';
import { CredentialVerifyRequest } from 'src/requests/credential-verify-request.entity';
import { ConnectorService } from '../connector-service.interface';

@Injectable()
export class GatacaService implements ConnectorService {
  name = 'gataca';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async registerOrganization(organization: Organization) {
    // We don't need to do anything for Gataca.
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canIssueCredentialRequest(request: CredentialIssueRequest) {
    return true;
  }

  canVerifyCredentialRequest(request: CredentialVerifyRequest) {
    if (!request.type) {
      throw Error('Could not check type');
    }

    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handleIssueCredentialRequest(issueRequest: CredentialIssueRequest) {
    return {};  
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handleVerifyCredentialRequest(verifyRequest: CredentialVerifyRequest) {
    return {};
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handleVerifyCredentialDisclosure(
    verifyRequest: CredentialVerifyRequest,
    body: any,
  ) {
    const result = {};

    for (const vc of body?.verifiableCredential) {
      for (const key of Object.keys(vc.credentialSubject)) {
        if (key != "id") {
          result[key] = vc.credentialSubject[key];
        }
      }
    }

    return result;
  }
}
