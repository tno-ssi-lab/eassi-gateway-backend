import { Injectable } from '@nestjs/common';

import { JolocomService } from './jolocom/jolocom.service';
import { IrmaService } from './irma/irma.service';
import { IndyService } from './indy/indy.service';

import { ConnectorService } from './connector-service.interface';
import { Organization } from '../organizations/organization.entity';
import { CredentialIssueRequest } from '../requests/credential-issue-request.entity';
import { CredentialVerifyRequest } from '../requests/credential-verify-request.entity';

@Injectable()
export class ConnectorsService {
  private connectors: ConnectorService[] = [];

  constructor(
    private jolocomService: JolocomService,
    private irmaService: IrmaService,
    private indyService: IndyService,
  ) {
    this.connectors.push(this.jolocomService);
    this.connectors.push(this.irmaService);
    this.connectors.push(this.indyService);
  }

  getConnector(name: string) {
    return this.connectors.find(connector => connector.name === name);
  }

  async registerOrganization(organization: Organization) {
    await Promise.all(
      this.connectors.map(
        async connector => await connector.registerOrganization(organization),
      ),
    );
  }

  async availableIssueConnectors(request: CredentialIssueRequest) {
    const results = await Promise.all(
      this.connectors.map(async connector => {
        return {
          connector,
          available: await connector.canIssueCredentialRequest(request),
        };
      }),
    );
    return results.filter(r => r.available).map(r => r.connector);
  }

  async availableVerifyConnectors(request: CredentialVerifyRequest) {
    const results = await Promise.all(
      this.connectors.map(async connector => {
        return {
          connector,
          available: await connector.canVerifyCredentialRequest(request),
        };
      }),
    );
    return results.filter(r => r.available).map(r => r.connector);
  }
}
