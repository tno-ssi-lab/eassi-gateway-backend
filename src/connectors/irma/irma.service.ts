import { Injectable } from '@nestjs/common';
import { ConnectorService } from '../connector-service.interface';
import { Organization } from 'src/organizations/organization.entity';
import { CredentialIssueRequest } from 'src/requests/credential-issue-request.entity';
import { CredentialVerifyRequest } from 'src/requests/credential-verify-request.entity';

@Injectable()
export class IrmaService implements ConnectorService {
  type = 'irma';

  async registerOrganization(organization: Organization) {
    // We don't need to do anything for IRMA.
    return;
  }

  canIssueCredentialRequest(request: CredentialIssueRequest) {
    // We cannot issue IRMA credentials right now.
    return false;
  }

  canVerifyCredentialRequest(request: CredentialVerifyRequest) {
    if (!request.type) {
      throw Error('Could not check type');
    }

    return !!request.type.irmaType;
  }

  async handleIssueCredentialRequest(request: CredentialIssueRequest) {
    return null;
  }

  async handleVerifyCredentialRequest(request: CredentialIssueRequest) {
    return null;
  }
}
