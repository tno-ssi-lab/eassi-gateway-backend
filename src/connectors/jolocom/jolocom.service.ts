import { Injectable } from '@nestjs/common';
import { ConnectorService } from '../connector-service.interface';
import { Organization } from 'src/organizations/organization.entity';

@Injectable()
export class JolocomService implements ConnectorService {
  type = 'jolocom';

  async registerOrganization(organization: Organization) {
    return;
  }
}
