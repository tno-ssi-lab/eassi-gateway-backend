import * as QRCode from 'qrcode';
import { 
  HttpService, 
  Injectable, 
  Logger, 
  NotImplementedException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ConfigService } from 'src/config/config.service';
import { ConnectorService } from '../connector-service.interface';
import { Organization } from 'src/organizations/organization.entity';
import { IdaCredentialType } from './ida-credential-type.entity';
import { IdaCredentialRequestToken } from './ida-credential-request-token.entity';
import { CredentialIssueRequest } from 'src/requests/credential-issue-request.entity';
import { CredentialVerifyRequest } from 'src/requests/credential-verify-request.entity';
import { sign, verify } from 'jsonwebtoken';

// import * as idaCredentials from './ida-credentials.json';

@Injectable()
export class IdaService implements ConnectorService {
  name = 'ida';

  private logger: Logger;

  constructor(
    @InjectRepository(IdaCredentialType)
    private typesRepository: Repository<IdaCredentialType>,
    @InjectRepository(IdaCredentialRequestToken)
    private tokenRepository: Repository<IdaCredentialRequestToken>,
    private configService: ConfigService,
    private httpService: HttpService, // private requestsService: RequestsService,
  ) {
    // this.registry = JolocomLib.registries.jolocom.create();
    this.logger = new Logger(IdaService.name);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async registerOrganization(organization: Organization) {
    // For now, we don't need to do anything for IDA.
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canIssueCredentialRequest(request: CredentialIssueRequest) {
    // Issuing IDA crendentials still has to be implemented.
    if (!request.type) {
      throw Error('Could not check type');
    }

    return !!request.type.idaType;
  }

  canVerifyCredentialRequest(request: CredentialVerifyRequest) {
    // Verifying IDA crendentials still has to be implemented.
    if (!request.type) {
      throw Error('Could not check type');
    }

    return !!request.type.idaType;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handleIssueCredentialRequest(issueRequest: CredentialIssueRequest) {
    // throw new NotImplementedException('Cannot issue IDA credentials yet');
    const apiUrl = "https://0xvvmwxd6e.execute-api.eu-west-1.amazonaws.com/dev/sessions";
    const headers = {
      headers: {
        'Content-Type': 'application/json', // afaik this one is not needed
        'Authorization': `Basic `, // NOTE: The authentication credential should not be part a config file, and should not be checked in!
      }
    };

    const context = issueRequest.type.idaType.context;
    const data = issueRequest.data;

    console.log(context);
    console.log(data);

    const body = {
      toAttest: {
          [context]: {
              "predicates": data
          }
      },
      toVerify: [],
      userId: "abc"
    };

    const session = await this.httpService
    .post(apiUrl, body, headers)
    .toPromise();

    const qrPayload = `{"inviteURL":"${session.data.qrcode}","operationType":"issuing", "documentName": "testdocument"}`;
    console.log(qrPayload);

    return {
      qr: await QRCode.toDataURL(qrPayload),
    };
  }

  async handleVerifyCredentialRequest(verifyRequest: CredentialVerifyRequest) {
    throw new NotImplementedException('Cannot verify IDA credentials yet');
  }

  async handleVerifyCredentialDisclosure(
    verifyRequest: CredentialVerifyRequest,
    body: { jwt: string },
  ) {
    throw new NotImplementedException('Cannot verify IDA credentials yet');
  }

  async findAllTypes() {
    return this.typesRepository.find();
  }

  async createType(typeData: Partial<IdaCredentialType>) {
    const type = new IdaCredentialType();
    type.name = typeData.name;
    type.context = typeData.context;
    type.attributes = typeData.attributes;

    return this.typesRepository.save(type);
  }
}
