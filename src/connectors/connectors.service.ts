import { Injectable } from '@nestjs/common';
import { JolocomService } from './jolocom/jolocom.service';
import { IrmaService } from './irma/irma.service';
import { ConnectorService } from './connector-service.interface';
import { Organization } from '../organizations/organization.entity';

@Injectable()
export class ConnectorsService {
  private connectors: ConnectorService[] = [];

  constructor(
    private jolocomService: JolocomService,
    private irmaService: IrmaService,
  ) {
    this.connectors.push(this.jolocomService);
    this.connectors.push(this.irmaService);
  }

  getConnector(type: string) {
    return this.connectors.find(connector => connector.type === type);
  }

  async registerOrganization(organization: Organization) {
    await Promise.all(
      this.connectors.map(
        async connector => await connector.registerOrganization(organization),
      ),
    );
  }
}
