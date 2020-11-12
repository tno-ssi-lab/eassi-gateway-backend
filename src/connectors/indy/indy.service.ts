import {
  HttpService,
  Injectable,
  Logger,
  NotImplementedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../../organizations/organization.entity';
import { CredentialIssueRequest } from '../../requests/credential-issue-request.entity';
import { CredentialVerifyRequest } from '../../requests/credential-verify-request.entity';
import { ConnectorService } from '../connector-service.interface';
import { IndyInvitation } from './indy-invitation.entity';
import {
  IndyCredDefResponse,
  IndySchema,
  IndySchemaResponse,
} from './indy-schema.entity';

@Injectable()
export class IndyService implements ConnectorService {
  name = 'indy';

  private logger: Logger;

  constructor(
    @InjectRepository(IndySchema)
    private schemasRepository: Repository<IndySchema>, // private configService: ConfigService,
    private invitationsRepository: Repository<IndyInvitation>,
    private httpService: HttpService,
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
    await this.createSchemaAndCredDef(schema);

    return this.schemasRepository.save(schema);
  }

  async createInvitation() {
    // const invitation = new IndyInvitation();
    // invitation.verifyRequest = verifyRequest;

    this.httpService.post(this.indyUrl('connections/create-invitation'), {
      alias: 'myAlias',
    });
  }

  protected async createSchemaAndCredDef(schema: IndySchema) {
    this.logger.debug('Creating indy schema', schema.name);

    const schemaResponse = await this.httpService
      .post<IndySchemaResponse>(this.indyUrl('schemas'), {
        attributes: schema.attributes,
        // eslint-disable-next-line @typescript-eslint/camelcase
        schema_name: schema.name,
        // eslint-disable-next-line @typescript-eslint/camelcase
        schema_version: schema.version,
      })
      .toPromise();

    this.logger.debug('Created indy schema', schemaResponse.data.schema_id);

    schema.indySchemaId = schemaResponse.data.schema_id;

    this.logger.debug('Creating indy credDef', schema.indySchemaId);

    const credDefResponse = await this.httpService
      .post<IndyCredDefResponse>(this.indyUrl('credential-definitions'), {
        // eslint-disable-next-line @typescript-eslint/camelcase
        revocation_registry_size: 1000,
        // eslint-disable-next-line @typescript-eslint/camelcase
        schema_id: schema.indySchemaId,
        // eslint-disable-next-line @typescript-eslint/camelcase
        support_revocation: false,
        tag: 'default',
      })
      .toPromise();

    this.logger.debug(
      'Created indy credDef',
      credDefResponse.data.credential_definition_id,
    );

    schema.indyCredentialDefinitionId =
      credDefResponse.data.credential_definition_id;

    return schema;
  }

  private indyUrl(path: string) {
    return `http://acapy:9001/${path}`;
  }
}
