import { Injectable } from '@nestjs/common';
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

export class InvalidRequestJWT extends Error {}

const JWT_MAX_AGE = '300s';

@Injectable()
export class RequestsService {
  constructor(private organizationsService: OrganizationsService) {}

  async decodeVerifyRequestToken(jwt: string) {
    const { request, requestor } = await this.decodeAndVerifyJwt<
      CredentialVerifyRequestData
    >(jwt);

    const verifyRequest = new CredentialVerifyRequest();

    verifyRequest.requestor = requestor;
    verifyRequest.type = request.type;
    verifyRequest.callbackUrl = request.callbackUrl;

    // TODO: Save to db

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

    // TODO: Save to db

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
        throw new Error('Could not decode issuer');
      }

      const requestor = await this.organizationsService.findByIdentifier(
        decoded.iss,
      );

      if (!requestor) {
        throw new Error('Could not find requestor');
      }

      // Verify that jwt is signed by specified issuer
      const request = verify(jwt, requestor.sharedSecret, {
        maxAge: JWT_MAX_AGE,
      });

      if (typeof request === 'string') {
        throw new Error(`String returned '${request}'. Expecting json object`);
      }

      return { request: (request as unknown) as T, requestor };
    } catch (e) {
      throw new InvalidRequestJWT('Could not decode request JWT');
    }
  }
}
