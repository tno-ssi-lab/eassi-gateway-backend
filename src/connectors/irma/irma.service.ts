import { Injectable } from '@nestjs/common';
import { ConnectorService } from '../connector-service.interface';
import { Organization } from 'src/organizations/organization.entity';

@Injectable()
export class IrmaService implements ConnectorService {
  type = 'irma';

  async registerOrganization(organization: Organization) {
    // We don't need to do anything for IRMA.
    return;
  }
}
