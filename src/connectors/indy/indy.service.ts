import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../../organizations/organization.entity';
import { CredentialIssueRequest } from '../../requests/credential-issue-request.entity';
import { CredentialVerifyRequest } from '../../requests/credential-verify-request.entity';
import { ConnectorService } from '../connector-service.interface';
import { IndySchema } from './indy-schema.entity';

@Injectable()
export class IndyService implements ConnectorService {
  name = 'indy';

  private logger: Logger;

  constructor(
    @InjectRepository(IndySchema)
    private schemasRepository: Repository<IndySchema>, // private configService: ConfigService,
  ) {
    this.logger = new Logger(IndyService.name);
  }

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

  async findAllSchemas() {
    return this.schemasRepository.find();
  }

  async createSchema(schemaData: Partial<IndySchema>) {
    const schema = new IndySchema();
    schema.name = schemaData.name;
    schema.version = schemaData.version;
    schema.attributes = schemaData.attributes;
    return this.schemasRepository.save(schema);
  }
}
