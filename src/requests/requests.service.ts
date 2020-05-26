import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { decode, verify, sign, SignOptions, VerifyOptions } from 'jsonwebtoken';
import { createHash } from 'crypto';

import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

import { Organization } from '../organizations/organization.entity';
import { CredentialVerifyRequest } from './credential-verify-request.entity';
import { CredentialIssueRequest } from './credential-issue-request.entity';

import { CredentialType } from '../types/credential-type.entity';
import { ResponseStatus } from '../connectors/response-status.enum';

import { CredentialIssueRequestData } from './credential-issue-request-data.dto';
import { CredentialVerifyRequestData } from './credential-verify-request-data.dto';
import { ClassType } from 'class-transformer/ClassTransformer';

export class InvalidRequestJWT extends Error {}

const JWT_MAX_AGE = '300s'; // TODO: Get from config
const JWT_AUDIENCE = 'ssi-service-provider'; // TODO: Get from config
const VERIFY_REQUEST_SUBJECT = 'credential-verify-request';
const VERIFY_RESPONSE_SUBJECT = 'credential-verify-response';

const ISSUE_REQUEST_SUBJECT = 'credential-issue-request';
const ISSUE_RESPONSE_SUBJECT = 'credential-issue-response';

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
    const hash = this.computeHash(jwt);

    let verifyRequest = await this.verifyRequestsRepository.findOne({ hash });

    if (verifyRequest) {
      return verifyRequest;
    }

    const { request, requestor } = await this.decodeAndVerifyJwt(jwt, {
      subject: VERIFY_REQUEST_SUBJECT,
    });

    const requestData = await this.verifyWithClass(
      CredentialVerifyRequestData,
      request,
    );

    const type = await this.typesRepository.findOneOrFail(
      {
        organization: requestor,
        type: requestData.type,
      },
      {
        relations: ['jolocomType'],
      },
    );

    verifyRequest = new CredentialVerifyRequest();

    verifyRequest.hash = hash;
    verifyRequest.jwtId = requestData.jti;
    verifyRequest.requestor = requestor;
    verifyRequest.type = type;
    verifyRequest.callbackUrl = requestData.callbackUrl;

    return this.verifyRequestsRepository.save(verifyRequest);
  }

  async decodeIssueRequestToken(jwt: string) {
    const hash = this.computeHash(jwt);

    let issueRequest = await this.issueRequestsRepository.findOne({ hash });

    if (issueRequest) {
      return issueRequest;
    }

    const { request, requestor } = await this.decodeAndVerifyJwt(jwt, {
      subject: ISSUE_REQUEST_SUBJECT,
    });

    const requestData = await this.verifyWithClass(
      CredentialIssueRequestData,
      request,
    );

    const type = await this.typesRepository.findOneOrFail(
      {
        organization: requestor,
        type: requestData.type,
      },
      {
        relations: ['jolocomType'],
      },
    );

    issueRequest = new CredentialIssueRequest();

    issueRequest.hash = hash;
    issueRequest.jwtId = requestData.jti;
    issueRequest.requestor = requestor;
    issueRequest.type = type;
    issueRequest.callbackUrl = requestData.callbackUrl;
    issueRequest.data = requestData.data;

    return this.issueRequestsRepository.save(issueRequest);
  }

  async decodeAndVerifyJwt(
    jwt: string,
    verifyOptions?: VerifyOptions,
  ): Promise<{ request: object; requestor: Organization }> {
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
        audience: JWT_AUDIENCE,
        ...verifyOptions,
      });

      if (typeof request === 'string') {
        // This can actually never happen due to the verifyOptions passed above.
        throw new Error(`String returned: '${request}'. Expecting object`);
      }

      // This is an unsafe casting that creates a runtime exception if the
      // casting fails. A more robust solution would be to use the
      // class-transformer and class-validator libraries to make sure the object
      // is valid.
      return { request, requestor };
    } catch (e) {
      this.logger.error(`Received error during JWT decoding: ${e}`);
      throw new InvalidRequestJWT('Could not decode request JWT');
    }
  }

  computeHash(str: string) {
    const hash = createHash('sha256');
    hash.update(str);
    return hash.digest('hex');
  }

  async verifyWithClass<T, V>(cls: ClassType<T>, plain: V): Promise<T> {
    const entity = plainToClass<T, V>(cls, plain);
    const errors = await validate(entity);

    if (errors.length > 0) {
      throw new Error(
        `Got errors during validation: ${errors
          .map(e => e.toString())
          .join(', ')}`,
      );
    }

    return entity;
  }

  encodeVerifyRequestResponse(
    verifyRequest: CredentialVerifyRequest,
    status: ResponseStatus,
    connectorName: string,
    data: any,
  ) {
    return this.encodeResponse(
      {
        requestId: verifyRequest.jwtId,
        type: verifyRequest.type.type,
        status,
        connector: connectorName,
        data,
      },
      verifyRequest.verifier,
      {
        subject: VERIFY_RESPONSE_SUBJECT,
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
        requestId: issueRequest.jwtId,
        type: issueRequest.type.type,
        status,
        connector: connectorName,
      },
      issueRequest.issuer,
      {
        subject: ISSUE_RESPONSE_SUBJECT,
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
