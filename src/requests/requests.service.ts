import { Injectable, Logger } from '@nestjs/common';
import { decode, verify } from 'jsonwebtoken';

import { OrganizationsService } from 'src/organizations/organizations.service';
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

export class InvalidRequestJWT extends Error {}

const JWT_MAX_AGE = '300s';

@Injectable()
export class RequestsService {
  logger: Logger;

  constructor(
    private organizationsService: OrganizationsService,
    @InjectRepository(CredentialIssueRequest)
    private issueRequestRepository: Repository<CredentialIssueRequest>,
    @InjectRepository(CredentialVerifyRequest)
    private verifyRequestRepository: Repository<CredentialVerifyRequest>,
  ) {
    this.logger = new Logger(RequestsService.name);
  }

  async findVerifyRequestByIdentifier(uuid: string) {
    return this.verifyRequestRepository.findOne({ uuid });
  }

  async findIssueRequestByIdentifier(uuid: string) {
    return this.issueRequestRepository.findOne({ uuid });
  }

  async findVerifyRequestByRequestId(requestId: string) {
    const [type, uuid] = requestId.split(':');

    if (type !== CredentialVerifyRequest.requestType || !uuid) {
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
    const { request, requestor } = await this.decodeAndVerifyJwt<
      CredentialVerifyRequestData
    >(jwt);

    const verifyRequest = new CredentialVerifyRequest();

    verifyRequest.requestor = requestor;
    verifyRequest.type = request.type;
    verifyRequest.callbackUrl = request.callbackUrl;

    await this.verifyRequestRepository.save(verifyRequest);
    return verifyRequest;
  }

  async decodeIssueRequestToken(jwt: string) {
    const { request, requestor } = await this.decodeAndVerifyJwt<
      CredentialIssueRequestData
    >(jwt);

    const issueRequest = new CredentialIssueRequest();

    issueRequest.requestor = requestor;
    issueRequest.type = request.type;
    issueRequest.callbackUrl = request.callbackUrl;
    issueRequest.data = request.data;

    await this.issueRequestRepository.save(issueRequest);
    return issueRequest;
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

      const requestor = await this.organizationsService.findByIdentifier(
        decoded.iss,
      );

      if (!requestor) {
        throw new Error(`Could not find requestor from: ${decoded.iss}`);
      }

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
}
