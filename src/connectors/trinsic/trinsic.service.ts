import {
  HttpService,
  Injectable,
  Logger,
  NotImplementedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { inspect } from 'util';
import { InjectRepository } from '@nestjs/typeorm';
import { ConnectorService } from '../connector-service.interface';
import { Organization } from '../../organizations/organization.entity';
import { CredentialIssueRequest } from 'src/requests/credential-issue-request.entity';
import { CredentialVerifyRequest } from 'src/requests/credential-verify-request.entity';
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

  ) {
    this.logger = new Logger(TrinsicService.name);
  }

  async registerOrganization(organization: Organization) {
    // TODO
    return;
  }

  canIssueCredentialRequest(request: CredentialIssueRequest) {
    if (!request.type) {
      throw Error('Could not check type');
    }

    const schema = request.type.trinsicSchema;
    if (!schema) {
      return false;
    }

    return !!request.type.trinsicSchema;
  }

  canVerifyCredentialRequest(request: CredentialVerifyRequest) {
    if (!request.type) {
      throw Error('Could not check type');
    }

    return !!request.type.trinsicSchema;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handleIssueCredentialRequest(issueRequest: CredentialIssueRequest) {
    // We handle this through a different channel, since we need a connectionId.
    return {};
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handleVerifyCredentialRequest(verifyRequest: CredentialVerifyRequest) {
    // We handle this through a different channel, since we need a connectionId.
    return {};
  }

  async handleVerifyCredentialRequestForConnection(
    verifyRequest: CredentialVerifyRequest,
    identifier: string,
  ) {
    const invitation = await this.getInvitationByIdentifier(identifier);
    const schema = verifyRequest.type.trinsicSchema;

    const headersRequest = {
      'Authorization': this.configService.getTrinsicAPIKey(),
    };

    console.log(invitation.connectionId);

    const response = await this.httpService
      .post(this.trinsicUrl('/credentials/v1/verifications/policy/connections/' + invitation.connectionId), {
        name: schema.name,
        version: schema.version,
        attributes: [{
          attributeNames: schema.attributeNames,
          policyName: schema.name
        }]
      },
        {
          headers: headersRequest
        }).toPromise();

    return response.data;
  }

  async handleIssueCredentialRequestForConnection(issueRequest: CredentialIssueRequest, identifier: string,) {
    const invitation = await this.getInvitationByIdentifier(identifier);

    const schema = issueRequest.type.trinsicSchema;

    console.log(schema.trinsicCredentialDefinitionId)

    const headersRequest = {
      'Authorization': this.configService.getTrinsicAPIKey(),
    };

    const proposal = {};
    schema.attributeNames.forEach((att) => {
      proposal[att] = (issueRequest.data[att] || '').toString();
    })

    this.logger.debug('Proposing', inspect(proposal, false, 7));
    this.logger.debug('dict', inspect({
      [schema.attributeNames[0]]: "test",
      // [schema.attributeNames[1]]: "test",
    }, false, 7));

    //TODO: send all attributeNames (now only first 2 are being send)
    //TODO: remove hardcoded test string with real data

    const response = await this.httpService
      .post(this.trinsicUrl('/credentials/v1/credentials'), {
        connectionId: invitation.connectionId,
        definitionId: schema.trinsicCredentialDefinitionId,
        automaticIssuance: true,
        credentialValues: proposal,
      },
        {
          headers: headersRequest
        })
      .toPromise();

    return response.data;
  }

  async findAllSchemas() {
    return this.schemasRepository.find();
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

    const headersRequest = {
      'Authorization': this.configService.getTrinsicAPIKey(),
    };

    const response = await this.httpService
      .post<TrinsicConnectionResponse>(
        this.trinsicUrl('/credentials/v1/connections'),
        {
          connectionId: invitation.connectionId,
        },
        {
          headers: headersRequest
        })
      .toPromise();

    invitation.connectionId = response.data.connectionId;
    invitation.name = response.data.connectionId;
    invitation.multiParty = response.data.multiParty;
    invitation.connectionResponse = response.data;
    await this.invitationsRepository.save(invitation);

    return {
      invitation,
      qr: await QRCode.toDataURL(invitation.connectionResponse.invitationUrl),
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
        'Authorization': this.configService.getTrinsicAPIKey(),
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
        'Authorization': this.configService.getTrinsicAPIKey(),
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

  async getInvitationByIdentifier(connectionId: string) {
    return this.invitationsRepository.findOneOrFail({ connectionId });
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

  protected getNonce(length = 3) {
    // Not sure if we need a 0-9 digit nonce or not.
    return parseInt(randomBytes(length).toString('hex'), 16).toString();
  }
}
