import { Injectable, Logger } from '@nestjs/common';
import { decode, verify, sign, SignOptions } from 'jsonwebtoken';

import { Organization } from 'src/organizations/organization.entity';
import {
  CredentialVerifyRequest,
  CredentialVerifyRequestData,
} from './credential-verify-request.entity';
import {
  CredentialIssueRequest,
  CredentialIssueRequestData,
} from './credential-issue-request.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CredentialType } from 'src/types/credential-type.entity';
import { ResponseStatus } from 'src/connectors/response-status.enum';

export class InvalidRequestJWT extends Error {}

const JWT_MAX_AGE = '300s';

@Injectable()
export class RequestsService {
  logger: Logger;

  constructor(
    @InjectRepository(Organization)
    private organizationsRepository: Repository<Organization>,
    @InjectRepository(CredentialIssueRequest)
    private issueRequestsRepository: Repository<CredentialIssueRequest>,
    @InjectRepository(CredentialVerifyRequest)
    private verifyRequestsRepository: Repository<CredentialVerifyRequest>,
    @InjectRepository(CredentialType)
    private typesRepository: Repository<CredentialType>,
  ) {
    this.logger = new Logger(RequestsService.name);
  }

  async findVerifyRequestByIdentifier(uuid: string) {
    return this.verifyRequestsRepository.findOne({ uuid });
  }

  async findIssueRequestByIdentifier(uuid: string) {
    return this.issueRequestsRepository.findOne({ uuid });
  }

  async findVerifyRequestByRequestId(requestId: string) {
    const [type, uuid] = requestId.split(':');

    console.log(type, CredentialVerifyRequest.requestType, uuid);

    if (type !== CredentialVerifyRequest.requestType || !uuid) {
      console.log(type !== CredentialVerifyRequest.requestType, !uuid);
      return null;
    }

    return this.findVerifyRequestByIdentifier(uuid);
  }

  async findIssueRequestByRequestId(requestId: string) {
    const [type, uuid] = requestId.split(':');

    if (type !== CredentialIssueRequest.requestType || !uuid) {
      return null;
    }

    return this.findIssueRequestByIdentifier(uuid);
  }

  async findRequestByRequestId(requestId: string) {
    const [type, uuid] = requestId.split(':');

    if (!type || !uuid) {
      return null;
    }

    if (type === CredentialVerifyRequest.requestType) {
      return this.findVerifyRequestByIdentifier(uuid);
    }

    if (type === CredentialIssueRequest.requestType) {
      return this.findIssueRequestByIdentifier(uuid);
    }

    return null;
  }

  async decodeVerifyRequestToken(jwt: string) {
    // TODO: verify sub(ject)
    const { request, requestor } = await this.decodeAndVerifyJwt<
      CredentialVerifyRequestData
    >(jwt);

    const type = await this.typesRepository.findOneOrFail(
      {
        organization: requestor,
        type: request.type,
      },
      {
        relations: ['jolocomType'],
      },
    );

    // TODO: load from db if request already exists.

    const verifyRequest = new CredentialVerifyRequest();

    verifyRequest.requestor = requestor;
    verifyRequest.type = type;
    verifyRequest.callbackUrl = request.callbackUrl;

    return this.verifyRequestsRepository.save(verifyRequest);
  }

  async decodeIssueRequestToken(jwt: string) {
    // TODO: verify sub(ject)

    const { request, requestor } = await this.decodeAndVerifyJwt<
      CredentialIssueRequestData
    >(jwt);

    const type = await this.typesRepository.findOneOrFail(
      {
        organization: requestor,
        type: request.type,
      },
      {
        relations: ['jolocomType'],
      },
    );

    // TODO: load from db if request already exists.

    const issueRequest = new CredentialIssueRequest();

    issueRequest.requestor = requestor;
    issueRequest.type = type;
    issueRequest.callbackUrl = request.callbackUrl;
    issueRequest.data = request.data;

    return this.issueRequestsRepository.save(issueRequest);
  }

  async decodeAndVerifyJwt<T = unknown>(
    jwt: string,
  ): Promise<{ request: T; requestor: Organization }> {
    try {
      // First decode to extract issuer
      const decoded = decode(jwt, { json: true });

      // Check if issuer is set
      if (!decoded || !decoded.iss) {
        throw new Error(
          `Could not decode issuer from: ${JSON.stringify(decoded)}`,
        );
      }

      const requestor = await this.organizationsRepository.findOneOrFail({
        uuid: decoded.iss,
      });

      // Verify that jwt is signed by specified issuer
      const request = verify(jwt, requestor.sharedSecret, {
        maxAge: JWT_MAX_AGE,
      });

      if (typeof request === 'string') {
        throw new Error(`String returned '${request}'. Expecting json object`);
      }

      // This is an unsafe casting that creates a runtime exception if the
      // casting fails. A more robust solution would be to use the
      // class-transformer and class-validator libraries to make sure the object
      // is valid.
      return { request: (request as unknown) as T, requestor };
    } catch (e) {
      this.logger.error(`Received error during JWT decoding: ${e}`);
      throw new InvalidRequestJWT('Could not decode request JWT');
    }
  }

  encodeVerifyRequestResponse(
    verifyRequest: CredentialVerifyRequest,
    status: ResponseStatus,
    connectorName: string,
    data: any,
  ) {
    return this.encodeResponse(
      {
        requestId: verifyRequest.uuid, // TODO: use jwtid from request
        type: verifyRequest.type.type,
        status,
        connector: connectorName,
        data,
      },
      verifyRequest.verifier,
      {
        subject: 'credential-verify-response',
      },
    );
  }

  encodeIssueRequestResponse(
    issueRequest: CredentialIssueRequest,
    status: ResponseStatus,
    connectorName: string,
  ) {
    return this.encodeResponse(
      {
        requestId: issueRequest.uuid, // TODO: use jwtid from request
        type: issueRequest.type.type,
        status,
        connector: connectorName,
      },
      issueRequest.issuer,
      {
        subject: 'credential-issue-response',
      },
    );
  }

  encodeResponse(
    payload: any,
    organization: Organization,
    options: SignOptions = {},
  ) {
    return sign(payload, organization.sharedSecret, {
      issuer: 'ssi-service-provider', // TODO Get from config?
      audience: organization.uuid,
      ...options,
    });
  }
}
