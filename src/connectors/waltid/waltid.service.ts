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
  import * as QRCode from 'qrcode';
  import {
    WaltidConnectionResponse,
    WaltidInvitation,
  } from './waltid-invitation.entity';
  import {
    WaltidCredDefResponse,
    WaltidSchema,
    WaltidSchemaResponse,
  } from './waltid-schema.entity';
  import { ConfigService } from 'src/config/config.service';
  
  
  @Injectable()
  export class WaltidService implements ConnectorService {
    name = 'waltid';
    private logger: Logger;
  
    /* ConnectorService methods */
    constructor(
  
      private configService: ConfigService,
      @InjectRepository(WaltidSchema)
      private schemasRepository: Repository<WaltidSchema>,
      @InjectRepository(WaltidInvitation)
      private invitationsRepository: Repository<WaltidInvitation>,
      private httpService: HttpService, // private requestsService: RequestsService,
  
    ) {
      this.logger = new Logger(WaltidService.name);
    }
  
    async registerOrganization(organization: Organization) {
      // TODO
      return;
    }
  
    canIssueCredentialRequest(request: CredentialIssueRequest) {
      if (!request.type) {
        throw Error('Could not check type');
      }
  
      const schema = request.type.waltidSchema;
      if (!schema) {
        return false;
      }
  
      return !!request.type.waltidSchema;
    }
  
    canVerifyCredentialRequest(request: CredentialVerifyRequest) {
      if (!request.type) {
        throw Error('Could not check type');
      }
  
      return !!request.type.waltidSchema;
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
      const schema = verifyRequest.type.waltidSchema;
  
      const headersRequest = {
        'Authorization': this.configService.getWaltidAPIKey(),
      };
  
      console.log(invitation.connectionId);
  
    //   const response = await this.httpService
    //     .post(this.waltidUrl('/credentials/v1/verifications/policy/connections/' + invitation.connectionId), {
    //       name: schema.name,
    //       version: schema.version,
    //       attributes: [{
    //         attributeNames: schema.attributeNames,
    //         policyName: schema.name
    //       }]
    //     },
    //       {
    //         headers: headersRequest
    //       }).toPromise();
  
    //   return response.data;
    }
  
    async handleIssueCredentialRequestForConnection(issueRequest: CredentialIssueRequest, identifier: string,) {
      const invitation = await this.getInvitationByIdentifier(identifier);
  
      const schema = issueRequest.type.waltidSchema;
  
      console.log(schema.waltidCredentialDefinitionId)
  
      const headersRequest = {
        'Authorization': this.configService.getWaltidAPIKey(),
      };
  
      const proposal = {};
      schema.attributeNames.forEach((att) => {
        proposal[att] = (issueRequest.data[att] || '').toString();
      })
  
      this.logger.debug('Proposing', inspect(proposal, false, 7));
  
      const response = await this.httpService
        .post(this.waltidUrl('/credentials/v1/credentials'), {
          connectionId: invitation.connectionId,
          definitionId: schema.waltidCredentialDefinitionId,
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
  
    async createSchema(schemaData: Partial<WaltidSchema>) {
      const schema = new WaltidSchema();
      schema.name = schemaData.name;
      schema.version = schemaData.version;
      schema.attributeNames = schemaData.attributeNames;
  
      await this.createSchemaAndCredDef(schema, schemaData);
  
      return this.schemasRepository.save(schema);
  
    }
  
    async createInvitation() {
      const invitation = new WaltidInvitation();
      invitation.connectionId = WaltidInvitation.randomIdentifier();
  
      const headersRequest = {
        'Authorization': this.configService.getWaltidAPIKey(),
      };
  
      const response = await this.httpService
        .post<WaltidConnectionResponse>(
          this.waltidUrl('/credentials/v1/connections'),
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
      schema: WaltidSchema,
      schemaData: Partial<WaltidSchema>,
    ) {
      if (schemaData.waltidSchemaId) {
        this.logger.debug('Existing Waltid schema', schema.name);
        schema.waltidSchemaId = schemaData.waltidSchemaId;
      } else {
        this.logger.debug('Creating Waltid schema', schema.name);
  
        const headersRequest = {
          'Authorization': this.configService.getWaltidAPIKey(),
        };
  
        const schemaResponse = await this.httpService
          .post<WaltidSchemaResponse>(this.waltidUrl('/credentials/v1/definitions/schemas'), {
  
            attributeNames: schema.attributeNames,
            name: schema.name,
            version: schema.version,
          },
            {
              headers: headersRequest
            })
          .toPromise();
  
        this.logger.debug('Created Waltid schema', schemaResponse.data.toString());
  
        schema.waltidSchemaId = schemaResponse.data.toString();
  
        // If we don't have a schemaId we can't have a credDefId.
        schemaData.waltidCredentialDefinitionId = null;
      }
  
      if (schemaData.waltidCredentialDefinitionId) {
        schema.waltidCredentialDefinitionId = schemaData.waltidCredentialDefinitionId;
      } else {
        this.logger.debug('Creating Waltid credDef', schema.waltidSchemaId);
  
        const headersRequest = {
          'Authorization': this.configService.getWaltidAPIKey(),
        };
  
        const credDefResponse = await this.httpService
          .post<WaltidCredDefResponse>(this.waltidUrl('/credentials/v1/definitions/credentials/' + schema.waltidSchemaId), {
            supportRevocation: false,
            tag: 'default',
          },
            {
              headers: headersRequest
            })
          .toPromise();
  
        this.logger.debug(
          'Created Waltid credDef',
          credDefResponse.data.definitionId,
        );
  
        schema.waltidCredentialDefinitionId =
          credDefResponse.data.definitionId;
      }
  
      return schema;
    }
  
    async getInvitationByIdentifier(connectionId: string) {
      return this.invitationsRepository.findOneOrFail({ connectionId });
    }
  
    protected waltidUrl(path: string) {
      return new URL(path, this.configService.getWaltidUrl()).toString();
    }
  
    public async handleIssueCredentialDisclosure(
      issueRequest: CredentialIssueRequest,
      data
    ) {
      const headersRequest = {
        'Authorization': this.configService.getWaltidAPIKey(),
      };
  
      let credentialId = data.response.data.credentialId;
      let issueData = null;
      let issueState = "Offered";
      let timedOut = false;
      setTimeout(() => timedOut = true, 1000 * 60);
  
      while (!timedOut && issueState === "Offered") {
        const response = await this.httpService
          .get(this.waltidUrl('/credentials/v1/credentials/' + credentialId),
            {
              headers: headersRequest
            }).toPromise();
  
        issueState = response.data.state;
        issueData = response.data
      }
  
      // Sometimes the state "Requested" pops up in between " Offered" and "Issued", not sure why...
      setTimeout(() => timedOut = true, 1000 * 60);
      while (!timedOut && issueState === "Requested") {
        const response = await this.httpService
          .get(this.waltidUrl('/credentials/v1/credentials/' + credentialId),
            {
              headers: headersRequest
            }).toPromise();
  
        issueState = response.data.state;
        issueData = response.data
      }
  
      if (issueState === "Issued") {
        return issueState
      }
    }
  
    public async handleVerifyCredentialDisclosure(
      verifyRequest: CredentialVerifyRequest,
      data,
    ) {
      const headersRequest = {
        'Authorization': this.configService.getWaltidAPIKey(),
      };
  
      let verificationId = data.response.data.verificationId;
      let verificationData = null;
      let verificationState = "Requested";
      let timedOut = false;
      setTimeout(() => timedOut = true, 1000 * 60);
  
      while (!timedOut && verificationState === "Requested") {
        const response = await this.httpService
          .get(this.waltidUrl('/credentials/v1/verifications/' + verificationId),
            {
              headers: headersRequest
            }).toPromise();
  
        verificationState = response.data.state;
        verificationData = response.data
      }
  
      if (verificationState === "Accepted") {
        
        return verificationData.proof[Object.keys(verificationData.proof)[0]].attributes
      }
    }
  
    protected getNonce(length = 3) {
      // Not sure if we need a 0-9 digit nonce or not.
      return parseInt(randomBytes(length).toString('hex'), 16).toString();
    }
  }