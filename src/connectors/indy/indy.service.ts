import {
  HttpService,
  Injectable,
  Logger,
  NotImplementedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { inspect } from 'util';
import * as QRCode from 'qrcode';

import { Organization } from '../../organizations/organization.entity';
import { CredentialIssueRequest } from '../../requests/credential-issue-request.entity';
import { CredentialVerifyRequest } from '../../requests/credential-verify-request.entity';
import { ConnectorService } from '../connector-service.interface';
import {
  IndyConnectionResponse,
  IndyInvitation,
} from './indy-invitation.entity';
import {
  IndyCredDefResponse,
  IndySchema,
  IndySchemaResponse,
} from './indy-schema.entity';
import { RequestsService } from 'src/requests/requests.service';
import { ConfigService } from 'src/config/config.service';

export interface IndyPresentProofResponse {
  presentation: {
    requested_proof: {
      revealed_attrs: {
        [key: string]: {
          raw: string;
        };
      };
    };
  };
  presentation_request_dict: {
    comment: string;
  };
  state: string;
  verified: string;
}

export interface IndyIssueCredentialResponse {
  credential_proposal_dict: {
    comment: string;
  };
  state: string;
}

@Injectable()
export class IndyService implements ConnectorService {
  name = 'indy';

  private logger: Logger;

  constructor(
    private configService: ConfigService,
    @InjectRepository(IndySchema)
    private schemasRepository: Repository<IndySchema>,
    @InjectRepository(IndyInvitation)
    private invitationsRepository: Repository<IndyInvitation>,
    private httpService: HttpService, // private requestsService: RequestsService,
  ) {
    this.logger = new Logger(IndyService.name);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async registerOrganization(organization: Organization) {
    // We don't need to do anything for Indy.
    return;
  }

  canIssueCredentialRequest(request: CredentialIssueRequest) {
    if (!request.type) {
      throw Error('Could not check type');
    }

    const schema = request.type.indySchema;
    if (!schema) {
      return false;
    }

    return schema.indyCredentialDefinitionId.startsWith(
      this.configService.getIndyDID(),
    );
  }

  canVerifyCredentialRequest(request: CredentialVerifyRequest) {
    if (!request.type) {
      throw Error('Could not check type');
    }

    return !!request.type.indySchema;
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

  async handleVerifyCredentialDisclosure() {
    throw new NotImplementedException(
      'Cannot verify Indy credentials through this channel',
    );
  }

  async handleVerifyCredentialRequestForConnection(
    verifyRequest: CredentialVerifyRequest,
    identifier: string,
  ) {
    const invitation = await this.getInvitationByIdentifier(identifier);
    const schema = verifyRequest.type.indySchema;

    const requestedAttributes = {};
    const requestedPredicates = {};

    for (const pred in verifyRequest.predicates) {
      console.log(pred);
      requestedPredicates[pred] = {
        name: verifyRequest.predicates[pred].name,
        p_type: verifyRequest.predicates[pred].p_type,
        p_value: verifyRequest.predicates[pred].p_value,
        restrictions: [
          {
            cred_def_id: schema.indyCredentialDefinitionId,
          },
        ],
      };
    };
    console.log(requestedPredicates);

    // Check for predicates, if none are set, then set request attributes
    if (Object.keys(requestedPredicates).length == 0) {
      schema.attributes.forEach((att) => {
        requestedAttributes[att] = {
          name: att,
          restrictions: [
            {
              cred_def_id: schema.indyCredentialDefinitionId,
            },
          ],
        };
      });
    }

    const requestData = {
      comment: verifyRequest.requestId,
      connection_id: invitation.connectionId,
      proof_request: {
        name: 'Proof request',
        nonce: this.getNonce(),
        requested_attributes: requestedAttributes,
        requested_predicates: requestedPredicates,
        version: '1.0',
      },
      trace: false,
    };

    this.logger.debug('Asking for', inspect(requestData, false, 7));

    return this.httpService
      .post(this.indyUrl('present-proof/send-request'), requestData)
      .toPromise();
  }

  async handleIssueCredentialRequestForConnection(
    issueRequest: CredentialIssueRequest,
    identifier: string,
  ) {
    const invitation = await this.getInvitationByIdentifier(identifier);
    const schema = issueRequest.type.indySchema;

    const proposal = schema.attributes.map((att) => {
      return {
        name: att,
        value: (issueRequest.data[att] || '').toString(),
      };
    });

    this.logger.debug('Proposing', inspect(proposal, false, 7));

    return this.httpService
      .post(this.indyUrl('issue-credential/send'), {
        auto_remove: false,
        comment: issueRequest.requestId,
        connection_id: invitation.connectionId,
        cred_def_id: schema.indyCredentialDefinitionId,
        credential_proposal: {
          '@type': 'issue-credential/1.0/credential-preview',
          attributes: proposal,
        },
        issuer_did: schema.credDefIssuerDid,
        schema_id: schema.indySchemaId,
        schema_issuer_did: schema.schemaIssuerDid,
        schema_name: schema.name,
        schema_version: schema.version,
        trace: false,
      })
      .toPromise();
  }

  async handleVerifyCredentialDisclosureFromWebhook(
    verifyRequest: CredentialVerifyRequest,
    data: IndyPresentProofResponse,
  ) {
    // const verifyRequest = await this.requestsService.findVerifyRequestByRequestId(
    //   data.presentation_request_dict.comment,
    // );
    return this.extractData(data);
  }

  async handleIssueCredentialDisclosureFromWebhook(
    issueRequest: CredentialIssueRequest,
    data: IndyIssueCredentialResponse,
  ) {
    return;
  }

  protected extractData(data: IndyPresentProofResponse) {
    const extracted = {};
    const revealedAttrs = data.presentation.requested_proof.revealed_attrs;

    Object.keys(revealedAttrs).forEach((key) => {
      extracted[key] = revealedAttrs[key].raw;
    });

    return extracted;
  }

  async findAllSchemas() {
    return this.schemasRepository.find();
  }

  async createSchema(schemaData: Partial<IndySchema>) {
    const schema = new IndySchema();
    schema.name = schemaData.name;
    schema.version = schemaData.version;
    schema.attributes = schemaData.attributes;

    await this.createSchemaAndCredDef(schema, schemaData);

    return this.schemasRepository.save(schema);
  }

  async createInvitation() {
    const invitation = new IndyInvitation();
    invitation.identifier = IndyInvitation.randomIdentifier();

    const response = await this.httpService
      .post<IndyConnectionResponse>(
        this.indyUrl('connections/create-invitation'),
        {
          alias: invitation.identifier,
        },
      )
      .toPromise();
    invitation.connectionId = response.data.connection_id;
    invitation.connectionResponse = response.data;
    await this.invitationsRepository.save(invitation);

    return {
      invitation,
      qr: await QRCode.toDataURL(
        JSON.stringify(invitation.connectionResponse.invitation),
      ),
    };
  }

  async getInvitationByIdentifier(identifier: string) {
    return this.invitationsRepository.findOneOrFail({ identifier });
  }

  protected async createSchemaAndCredDef(
    schema: IndySchema,
    schemaData: Partial<IndySchema>,
  ) {
    if (schemaData.indySchemaId) {
      this.logger.debug('Existing indy schema', schema.name);
      schema.indySchemaId = schemaData.indySchemaId;
    } else {
      this.logger.debug('Creating indy schema', schema.name);

      const schemaResponse = await this.httpService
        .post<IndySchemaResponse>(this.indyUrl('schemas'), {
          attributes: schema.attributes,
          schema_name: schema.name,
          schema_version: schema.version,
        })
        .toPromise();

      this.logger.debug('Created indy schema', schemaResponse.data.schema_id);

      schema.indySchemaId = schemaResponse.data.schema_id;

      // If we don't have a schemaId we can't have a credDefId.
      schemaData.indyCredentialDefinitionId = null;
    }

    if (schemaData.indyCredentialDefinitionId) {
      schema.indyCredentialDefinitionId = schemaData.indyCredentialDefinitionId;
    } else {
      this.logger.debug('Creating indy credDef', schema.indySchemaId);

      const credDefResponse = await this.httpService
        .post<IndyCredDefResponse>(this.indyUrl('credential-definitions'), {
          revocation_registry_size: 1000,
          schema_id: schema.indySchemaId,
          support_revocation: false,
          tag: schema.name,
        })
        .toPromise();

      this.logger.debug(
        'Created indy credDef',
        credDefResponse.data.credential_definition_id,
      );

      schema.indyCredentialDefinitionId =
        credDefResponse.data.credential_definition_id;
    }

    return schema;
  }

  protected indyUrl(path: string) {
    return new URL(path, this.configService.getIndyUrl()).toString();
  }

  protected getNonce(length = 3) {
    // Not sure if we need a 0-9 digit nonce or not.
    return parseInt(randomBytes(length).toString('hex'), 16).toString();
  }
}
