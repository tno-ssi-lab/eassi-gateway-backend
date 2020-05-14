import { Injectable } from '@nestjs/common';
import { decode, verify } from 'jsonwebtoken';

import { OrganizationsService } from 'src/organizations/organizations.service';
import { Organization } from 'src/organizations/organization.entity';
import {
  CredentialVerifyRequest,
  CredentialVerifyRequestData,
} from './credential-verify-request';
import {
  CredentialIssueRequest,
  CredentialIssueRequestData,
} from './credential-issue-request';

export class InvalidRequestJWT extends Error {}

const JWT_MAX_AGE = '300s';

@Injectable()
export class RequestsService {
  constructor(private organizationsService: OrganizationsService) {}

  async decodeVerifyRequestToken(jwt: string) {
    const { request, requestor } = await this.decodeAndVerifyJwt<
      CredentialVerifyRequestData
    >(jwt);

    return {
      verifyRequest: new CredentialVerifyRequest(
        request.iss,
        request.type,
        request.callbackUrl,
      ),
      verifier: requestor,
    };
  }

  async decodeIssueRequestToken(jwt: string) {
    const { request, requestor } = await this.decodeAndVerifyJwt<
      CredentialIssueRequestData
    >(jwt);

    return {
      issueRequest: new CredentialIssueRequest(
        request.iss,
        request.type,
        request.data,
        request.callbackUrl,
      ),
      issuer: requestor,
    };
  }

  async decodeAndVerifyJwt<T>(
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

      return { request, requestor };
    } catch (e) {
      throw new InvalidRequestJWT('Could not decode request JWT');
    }
  }
}
