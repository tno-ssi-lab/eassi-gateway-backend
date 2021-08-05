import {
  HttpService,
  Injectable,
  Logger,
  NotImplementedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConnectorService } from '../connector-service.interface';
import { Organization } from '../../organizations/organization.entity';
import { CredentialIssueRequest } from 'src/requests/credential-issue-request.entity';
import { CredentialVerifyRequest } from 'src/requests/credential-verify-request.entity';
import { CredentialsServiceClient, ProviderServiceClient, WalletServiceClient, Credentials, ProviderCredentials } from '@trinsic/service-clients';
import { sign, verify } from 'jsonwebtoken';
import { TrinsicModule } from './trinsic.module';
import * as QRCode from 'qrcode';
import {
  TrinsicConnectionResponse,
  TrinsicInvitation,
} from './trinsic-invitation.entity';
import {
  TrinsicCredDefResponse,
  TrinsicSchema,
  TrinsicSchemaResponse,
} from './trinsic-schema.entity';
import { ConfigService } from 'src/config/config.service';

// import * as trinsicCredentials from './trinsic-credentials.json';

@Injectable()
export class TrinsicService implements ConnectorService {
  name = 'trinsic';
  private logger: Logger;

  /* ConnectorService methods */
  constructor(
    private configService: ConfigService,
    @InjectRepository(TrinsicSchema)
    private schemasRepository: Repository<TrinsicSchema>,
    @InjectRepository(TrinsicInvitation)
    private invitationsRepository: Repository<TrinsicInvitation>,
    private httpService: HttpService, // private requestsService: RequestsService,
    private walletServiceClient: WalletServiceClient,
    private credentialsServiceClient: CredentialsServiceClient,
    //private credentialsClient = new CredentialsServiceClient(new Credentials("KysnBkxKkaCdh9QHsD6WmlyFqVYxYjZSJ7rhd8b4aMQ"), { noRetryPolicy: true }),
    //private walletClient = new WalletServiceClient(new Credentials("KysnBkxKkaCdh9QHsD6WmlyFqVYxYjZSJ7rhd8b4aMQ"), { noRetryPolicy: true }),

  ) {
    this.logger = new Logger(TrinsicService.name);
  }

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

  async findAllSchemas() {
    return this.credentialsServiceClient.listSchemas();
  }

  async listCredentialDefinition() {
    return this.credentialsServiceClient.listCredentialDefinitions();
  }

  async createSchema(schemaData: Partial<TrinsicSchema>) {
    const schema = new TrinsicSchema();
    schema.name = schemaData.name;
    schema.version = schemaData.version;
    schema.attributeNames = schemaData.attributeNames;

    await this.createSchemaAndCredDef(schema, schemaData);

    return this.schemasRepository.save(schema);

  }

  async createInvitation() {
    const invitation = new TrinsicInvitation();
    invitation.connectionId = TrinsicInvitation.randomIdentifier();

    const response = await this.httpService
      .post<TrinsicConnectionResponse>(
        this.trinsicUrl('connections/create-invitation'),
        {
          alias: invitation.connectionId,
        },
      )
      .toPromise();
    invitation.connectionId = response.data.connectionId;
    invitation.connectionResponse = response.data;
    await this.invitationsRepository.save(invitation);

    return {
      invitation,
      qr: await QRCode.toDataURL(
        JSON.stringify(invitation.connectionResponse.invitation),
      ),
    };
  }

  protected async createSchemaAndCredDef(
    schema: TrinsicSchema,
    schemaData: Partial<TrinsicSchema>,
  ) {
    if (schemaData.trinsicSchemaId) {
      this.logger.debug('Existing Trinsic schema', schema.name);
      schema.trinsicSchemaId = schemaData.trinsicSchemaId;
    } else {
      this.logger.debug('Creating Trinsic schema', schema.name);

      const headersRequest = {
        'Authorization': 'KysnBkxKkaCdh9QHsD6WmlyFqVYxYjZSJ7rhd8b4aMQ',
      };  

      const schemaResponse = await this.httpService
        .post<TrinsicSchemaResponse>(this.trinsicUrl('/credentials/v1/definitions/schemas'), {

          attributeNames: schema.attributeNames,
          name: schema.name,
          version: schema.version,
        },
        {
          headers: headersRequest
        })
        .toPromise();

      this.logger.debug('Created Trinsic schema', schemaResponse.data.toString());

      schema.trinsicSchemaId = schemaResponse.data.toString();

      // If we don't have a schemaId we can't have a credDefId.
      schemaData.trinsicCredentialDefinitionId = null;
    }

    if (schemaData.trinsicCredentialDefinitionId) {
      schema.trinsicCredentialDefinitionId = schemaData.trinsicCredentialDefinitionId;
    } else {
      this.logger.debug('Creating Trinsic credDef', schema.trinsicSchemaId);

      const headersRequest = {
        'Authorization': 'KysnBkxKkaCdh9QHsD6WmlyFqVYxYjZSJ7rhd8b4aMQ',
      };  

      const credDefResponse = await this.httpService
        .post<TrinsicCredDefResponse>(this.trinsicUrl('/credentials/v1/definitions/credentials/' + schema.trinsicSchemaId), {
          supportRevocation: false,
          tag: 'default',
        },
        {
          headers: headersRequest
        })
        .toPromise();

      this.logger.debug(
        'Created Trinsic credDef',
        credDefResponse.data.definitionId,
      );

      schema.trinsicCredentialDefinitionId =
        credDefResponse.data.definitionId;
    }

    return schema;
  }

  protected trinsicUrl(path: string) {
    return new URL(path, this.configService.getTrinsicUrl()).toString();
  }

  public async handleVerifyCredentialDisclosure(
    verifyRequest: CredentialVerifyRequest,
    body: { jwt: string },
  ) {
    throw new NotImplementedException('Cannot verify Trinsic credentials yet');
  }
}